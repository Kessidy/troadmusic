'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendInvitationEmail } from '@/lib/mail';

export async function getMinistryUsers() {
  const session = await auth();
  if (!session?.user?.tenantId) return [];

  return await prisma.user.findMany({
    where: { 
      tenantId: session.user.tenantId,
      role: { not: 'SUPERADMIN' }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function inviteUser(formData) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: 'Não autorizado.' };
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    return { error: 'Apenas administradores podem convidar usuários.' };
  }

  const firstName = formData.get('firstName')?.trim();
  const lastName = formData.get('lastName')?.trim();
  const email = formData.get('email')?.toLowerCase().trim();
  const phone = formData.get('phone')?.trim();

  if (!firstName || !lastName || !email) {
    return { error: 'Nome, Sobrenome e E-mail são obrigatórios.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Este e-mail já está cadastrado no sistema.' };

  const invitationToken = crypto.randomBytes(32).toString('hex');
  const invitationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  try {
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        tenantId: session.user.tenantId,
        role: 'USER',
        isBlocked: false,
        invitationToken,
        invitationTokenExpires
      }
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept-invite?token=${invitationToken}`;
    // Send the "enthusiastic" email (only if SMTP is configured)
    await sendInvitationEmail({
      to: email,
      firstName,
      ministryName: session.user.tenantName || 'seu ministério',
      inviteUrl
    });

    revalidatePath('/config');
    return { success: true, inviteUrl };
  } catch (error) {
    console.error('Error inviting user:', error);
    return { error: 'Erro ao convidar usuário. Tente novamente.' };
  }
}

export async function deleteUser(userId) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: 'Não autorizado.' };

  const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
  if (!userToDelete || userToDelete.tenantId !== session.user.tenantId) {
    return { error: 'Usuário não encontrado ou de outro ministério.' };
  }

  if (userToDelete.role === 'ADMIN' && session.user.role !== 'SUPERADMIN') {
    return { error: 'Você não pode excluir outro administrador.' };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath('/config');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Erro ao excluir usuário.' };
  }
}
export async function resendInvite(userId) {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: 'Não autorizado.' };

  const userResend = await prisma.user.findUnique({ where: { id: userId } });
  if (!userResend || userResend.tenantId !== session.user.tenantId) {
    return { error: 'Usuário não encontrado ou de outro ministério.' };
  }

  const invitationToken = crypto.randomBytes(32).toString('hex');
  const invitationTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { invitationToken, invitationTokenExpires }
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept-invite?token=${invitationToken}`;
    await sendInvitationEmail({
      to: userResend.email,
      firstName: userResend.firstName,
      ministryName: session.user.tenantName || 'seu ministério',
      inviteUrl
    });

    return { success: true, inviteUrl };
  } catch (error) {
    console.error('Error resending invite:', error);
    return { error: 'Erro ao reenviar convite.' };
  }
}

export async function acceptInvitation(token, newPassword) {
  if (!token || !newPassword) return { error: 'Dados inválidos.' };

  const user = await prisma.user.findUnique({ where: { invitationToken: token } });
  if (!user) return { error: 'Link de convite inválido ou adulterado.' };

  if (user.invitationTokenExpires && user.invitationTokenExpires < new Date()) {
    return { error: 'O link de convite expirou. Solicite um novo à sua liderança.' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        invitationToken: null,
        invitationTokenExpires: null,
        emailVerified: new Date(), // Optionally mark email as verified!
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { error: 'Erro ao definir a senha. Tente novamente.' };
  }
}
