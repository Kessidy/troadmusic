'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function createRole(formData) {
  const tenantId = await getTenantId();
  const name = formData.get('name');
  if (!name) return;

  await prisma.role.create({ data: { name, tenantId } });
  revalidatePath('/config');
}

export async function getRoles() {
  const tenantId = await getTenantId();
  return await prisma.role.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function updateRole(id, name) {
  await prisma.role.update({ where: { id }, data: { name } });
  revalidatePath('/config');
}

export async function deleteRole(id) {
  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath('/config');
  } catch (error) {
    throw new Error('Não é possível excluir um instrumento que está sendo usado por músicos.');
  }
}
