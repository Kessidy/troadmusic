'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function createDepartment(formData) {
  const tenantId = await getTenantId();
  const name = formData.get('name');
  const color = formData.get('color') || '#64ffda';
  if (!name) return { error: 'Nome é obrigatório' };
  
  // Enforce Basic plan limits
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { license: true }
  });
  
  const plan = tenant?.license?.plan || 'basic';
  
  if (plan === 'basic') {
    const deptCount = await prisma.department.count({
      where: { tenantId }
    });
    
    if (deptCount >= 2) {
      return { error: 'O plano Basic permite cadastrar no máximo 02 departamentos. A sua licença atual não suporta esta ação.' };
    }
  }

  await prisma.department.create({ data: { name, color, tenantId } });
  revalidatePath('/config');
  return { success: true };
}

export async function getDepartments() {
  const tenantId = await getTenantId();
  return await prisma.department.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function updateDepartment(id, name, color) {
  await prisma.department.update({ where: { id }, data: { name, color } });
  revalidatePath('/config');
}

export async function deleteDepartment(id) {
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath('/config');
  } catch (error) {
    throw new Error('Não é possível excluir um departamento que possui eventos vinculados.');
  }
}
