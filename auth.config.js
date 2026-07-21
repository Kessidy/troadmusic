export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [], // Providers are populated in auth.js to avoid loading Prisma in Edge Runtime
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
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName;
        session.user.licenseStatus = token.licenseStatus;
        session.user.licenseExpiresAt = token.licenseExpiresAt;
      }
      return session;
    },
  },
};
