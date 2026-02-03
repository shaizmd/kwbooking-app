import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

/**
 * Role-based route protection configuration
 */
const PROTECTED_ROUTES = {
  ADMIN: ['/admin'],
  HOST: ['/host'],
  CUSTOMER: ['/bookings'],
} as const;

/**
 * Check if a route requires role-based protection
 */
function getRequiredRole(pathname: string): 'ADMIN' | 'HOST' | 'CUSTOMER' | null {
  for (const [role, routes] of Object.entries(PROTECTED_ROUTES)) {
    for (const route of routes) {
      if (pathname.includes(route)) {
        return role as 'ADMIN' | 'HOST' | 'CUSTOMER';
      }
    }
  }
  return null;
}

/**
 * Role-based middleware protection
 */
export function roleMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip role check for public routes
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/properties') ||
    pathname === '/' ||
    pathname.includes('/api/auth') ||
    pathname.includes('/_next') ||
    pathname.includes('/403')
  ) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);
  
  if (!requiredRole) {
    return NextResponse.next();
  }

  // Get access token
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    // Redirect to login
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  try {
    const payload = verifyAccessToken(token);

    // ADMIN has access to all routes
    if (payload.role === 'ADMIN') {
      return NextResponse.next();
    }

    // Check role for other users
    if (payload.role !== requiredRole) {
      // Redirect to 403 forbidden page
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/403`, request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid token - redirect to login
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}
