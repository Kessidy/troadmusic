'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function getTenantId() {
  const session = await auth();
  return session?.user?.tenantId || null;
}

export async function createSong(formData) {
  const tenantId = await getTenantId();
  const title = formData.get('title');
  const youtubeLink = formData.get('youtubeLink');

  await prisma.song.create({ data: { title, youtubeLink, tenantId } });
  revalidatePath('/repertorio');
}

export async function getSongs() {
  const tenantId = await getTenantId();
  return await prisma.song.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteSong(id) {
  await prisma.song.delete({ where: { id } });
  revalidatePath('/repertorio');
}
