import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            tenant: { include: { license: true } },
          },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        if (user.isBlocked) throw new Error('BLOCKED');

        // SUPERADMIN bypass license check
        if (user.role !== 'SUPERADMIN') {
          const license = user.tenant?.license;
          if (!license) throw new Error('NO_LICENSE');
          if (license.status === 'suspended') throw new Error('SUSPENDED');
          if (license.status === 'expired' || new Date(license.expiresAt) < new Date()) {
            throw new Error('EXPIRED');
          }
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const license = user.tenant?.license;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant?.name ?? 'TroadMusic',
          licenseStatus: license?.status ?? null,
          licenseExpiresAt: license?.expiresAt?.toISOString() ?? null,
        };
      },
    }),
  ],
});

