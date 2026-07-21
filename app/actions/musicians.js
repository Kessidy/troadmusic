'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { syncTelegramUpdates } from '@/lib/telegram';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function createMusician(formData) {
  const tenantId = await getTenantId();
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const roleIds = formData.getAll('roleIds');
  const departmentIds = formData.getAll('departmentIds');
  const phone = formData.get('phone');
  const email = formData.get('email');

  await prisma.musician.create({
    data: {
      tenantId,
      firstName,
      lastName,
      phone,
      email,
      roles: { connect: roleIds.map(id => ({ id })) },
      departments: { connect: departmentIds.map(id => ({ id })) },
    },
  });

  revalidatePath('/musicians');
}

export async function updateMusician(id, formData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const roleIds = formData.getAll('roleIds');
  const departmentIds = formData.getAll('departmentIds');
  const phone = formData.get('phone');
  const email = formData.get('email');

  await prisma.musician.update({
    where: { id },
    data: {
      firstName,
      lastName,
      phone,
      email,
      roles: { set: roleIds.map(id => ({ id })) },
      departments: { set: departmentIds.map(id => ({ id })) },
    },
  });

  revalidatePath('/musicians');
}

export async function getMusicians() {
  const tenantId = await getTenantId();
  try {
    await syncTelegramUpdates();
  } catch (err) {
    console.error('Failed to sync Telegram updates:', err);
  }
  return await prisma.musician.findMany({
    where: { tenantId },
    include: { roles: true, departments: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteMusician(id) {
  await prisma.musician.delete({ where: { id } });
  revalidatePath('/musicians');
}
