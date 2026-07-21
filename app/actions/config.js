'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function getConfig() {
  const tenantId = await getTenantId();
  let config = await prisma.config.findFirst({ where: { tenantId } });
  if (!config) {
    config = await prisma.config.create({ data: { tenantId, repertoireLoopDays: 15 } });
  }
  return config;
}

export async function updateConfig(formData) {
  const tenantId = await getTenantId();
  const repertoireLoopDays = parseInt(formData.get('repertoireLoopDays') || '15', 10);

  let config = await prisma.config.findFirst({ where: { tenantId } });
  if (config) {
    await prisma.config.update({ where: { id: config.id }, data: { repertoireLoopDays } });
  } else {
    await prisma.config.create({ data: { tenantId, repertoireLoopDays } });
  }

  revalidatePath('/config');
}
