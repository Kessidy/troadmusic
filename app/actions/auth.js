'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function registerUser(formData) {
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.toLowerCase().trim();
  const phone = formData.get('phone')?.trim();
  const ministry = formData.get('ministry')?.trim();
  const password = formData.get('password');

  if (!name || !email || !phone || !password || !ministry) return { error: 'Preencha todos os campos.' };
  if (password.length < 6) return { error: 'Senha deve ter no mínimo 6 caracteres.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Este e-mail já está cadastrado.' };

  const hashed = await bcrypt.hash(password, 12);
  const slug = ministry.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: ministry,
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`, // Simple unique slug
          license: {
            create: { 
              plan: 'basic', 
              status: 'suspended', 
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            },
          },
          config: {
            create: { repertoireLoopDays: 15 }
          }
        },
      });

      await tx.user.create({
        data: { 
          name, 
          email, 
          phone, 
          ministry, 
          password: hashed, 
          role: 'ADMIN', 
          tenantId: tenant.id,
          isBlocked: false 
        },
      });
    });

    revalidatePath('/backoffice');
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Erro ao criar conta. Tente novamente.' };
  }

  return { success: true };
}

export async function changePassword(formData, userId) {
  const current = formData.get('currentPassword');
  const newPass = formData.get('newPassword');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'Usuário não encontrado.' };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: 'Senha atual incorreta.' };

  const hashed = await bcrypt.hash(newPass, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { success: true };
}
