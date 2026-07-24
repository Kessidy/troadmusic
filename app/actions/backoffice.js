'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// ── Tenants ───────────────────────────────────────────────────────────

export async function getTenants() {
  return prisma.tenant.findMany({
    include: {
      license: true,
      users: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTenant(formData) {
  const name = formData.get('name')?.trim();
  const slug = formData.get('slug')?.toLowerCase().trim().replace(/\s+/g, '-');
  const plan = formData.get('plan') || 'basic';
  const expiresAt = new Date(formData.get('expiresAt'));

  if (!name || !slug) return { error: 'Nome e slug são obrigatórios.' };

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      license: {
        create: { plan, status: 'suspended', expiresAt },
      },
    },
  });

  // Auto config for tenant
  await prisma.config.create({
    data: { tenantId: tenant.id, repertoireLoopDays: 15 },
  });

  revalidatePath('/backoffice');
  return { success: true };
}

// ── Licenses ─────────────────────────────────────────────────────────

export async function updateTenantStatus(tenantId, status) {
  const license = await prisma.license.findUnique({ where: { tenantId } });
  if (!license) return { error: 'Licença não encontrada.' };

  await prisma.license.update({
    where: { id: license.id },
    data: { status },
  });

  revalidatePath('/backoffice');
  return { success: true };
}

export async function updateLicense(formData) {
  const licenseId = formData.get('licenseId');
  const status = formData.get('status');
  const expiresAt = new Date(formData.get('expiresAt'));
  const plan = formData.get('plan');

  await prisma.license.update({
    where: { id: licenseId },
    data: { status, expiresAt, plan },
  });

  revalidatePath('/backoffice');
  return { success: true };
}

// ── Users ─────────────────────────────────────────────────────────────

export async function getUsers(tenantId) {
  return prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingUsers() {
  return prisma.user.findMany({
    where: { tenantId: null, role: 'USER' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function assignUserToTenant(formData) {
  const userId = formData.get('userId');
  const tenantId = formData.get('tenantId');
  const role = formData.get('role') || 'USER';

  await prisma.user.update({
    where: { id: userId },
    data: { tenantId, role },
  });

  revalidatePath('/backoffice');
  return { success: true };
}

export async function createUserForTenant(formData) {
  const tenantId = formData.get('tenantId');
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.toLowerCase().trim();
  const phone = formData.get('phone')?.trim();
  const password = formData.get('password') || 'Troadmusic@123';
  const role = formData.get('role') || 'USER';

  if (!name || !email) return { error: 'Nome e e-mail são obrigatórios.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'E-mail já cadastrado.' };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, phone, password: hashed, role, tenantId },
  });

  revalidatePath('/backoffice');
  return { success: true };
}

export async function blockUser(userId) {
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: true } });
  revalidatePath('/backoffice');
}

export async function unblockUser(userId) {
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: false } });
  revalidatePath('/backoffice');
}

export async function setUserRole(userId, role) {
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/backoffice');
}

export async function adminResetPassword(userId, newPassword) {
  const hashed = await bcrypt.hash(newPassword || 'Troadmusic@123', 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  revalidatePath('/backoffice');
  return { success: true };
}

export async function deleteTenant(formData) {
  const tenantId = formData.get('tenantId');
  if (!tenantId) return { error: 'ID do tenant não fornecido.' };

  try {
    // 1. Detach Users to make them "Pending" again instead of outright deleting their login credentials
    await prisma.user.updateMany({
      where: { tenantId },
      data: { tenantId: null }
    });

    // 2. Find all events of tenant to explicitly delete event assignments (bypassing cascade constraints safely)
    const events = await prisma.event.findMany({ where: { tenantId }, select: { id: true } });
    const eventIds = events.map(e => e.id);
    if (eventIds.length > 0) {
      await prisma.eventMusician.deleteMany({ where: { eventId: { in: eventIds } } });
    }

    // 3. Delete root scoped items manually via transaction
    await prisma.$transaction([
      prisma.event.deleteMany({ where: { tenantId } }),
      prisma.song.deleteMany({ where: { tenantId } }),
      prisma.musician.deleteMany({ where: { tenantId } }),
      prisma.department.deleteMany({ where: { tenantId } }),
      prisma.role.deleteMany({ where: { tenantId } }),
      prisma.config.deleteMany({ where: { tenantId } }),
      prisma.license.deleteMany({ where: { tenantId } }),
      prisma.tenant.delete({ where: { id: tenantId } })
    ]);

    revalidatePath('/backoffice');
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir tenant:', error);
    return { error: 'Erro interno ao excluir o ministério. Verifique dependências.' };
  }
}

export async function deleteUser(userId) {
  try {
    await prisma.$transaction([
      prisma.account.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    revalidatePath('/backoffice');
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return { error: 'Falha ao deletar usuário.' };
  }
}

export async function updateUserEmailAndPhone(formData) {
  const userId = formData.get('userId');
  const email = formData.get('email')?.toLowerCase().trim();
  const phone = formData.get('phone')?.trim();

  if (!userId || !email) {
    return { error: 'ID do usuário e e-mail são obrigatórios.' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return { error: 'Este e-mail já está em uso por outro usuário.' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email, phone: phone || null }
    });

    revalidatePath('/backoffice');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar cadastro do usuário:', error);
    return { error: 'Erro ao atualizar dados.' };
  }
}

