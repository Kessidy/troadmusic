import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const AUTH_ROUTES = ['/api/auth'];
// These pages are accessible even after login (don't redirect away)
const ALWAYS_PUBLIC = ['/licenca-suspensa', '/licenca-expirada', '/accept-invite'];

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  // Allow NextAuth API routes
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return NextResponse.next();

  // License blocked pages — always accessible, no redirect loop
  if (ALWAYS_PUBLIC.includes(pathname)) return NextResponse.next();

  // Login page — redirect to dashboard if already logged in
  if (pathname === '/login') {
    if (session) return NextResponse.redirect(new URL('/', nextUrl));
    return NextResponse.next();
  }

  // No session
  if (!session) {
    if (pathname === '/') return NextResponse.next();
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  const { role, licenseStatus, licenseExpiresAt } = session.user;

  // Backoffice → SUPERADMIN only
  if (pathname.startsWith('/backoffice') && role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // Non-superadmin: verify license from JWT (no DB call — Edge compatible)
  // Only block on EXPLICIT status values, not on null/undefined (old tokens)
  if (role !== 'SUPERADMIN' && licenseStatus) {
    if (licenseStatus === 'suspended') {
      return NextResponse.redirect(new URL('/licenca-suspensa', nextUrl));
    }
    if (licenseStatus === 'expired' || (licenseExpiresAt && new Date(licenseExpiresAt) < new Date())) {
      return NextResponse.redirect(new URL('/licenca-expirada', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
