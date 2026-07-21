import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },

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

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
        token.licenseStatus = user.licenseStatus;
        token.licenseExpiresAt = user.licenseExpiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.tenantName = token.tenantName;
      session.user.licenseStatus = token.licenseStatus;
      session.user.licenseExpiresAt = token.licenseExpiresAt;
      return session;
    },
  },
});

