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
export async function roleMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log("=== ROLE MIDDLEWARE ===");
  console.log("Path:", pathname);
  
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
    console.log("Public route, skipping auth check");
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);
  
  console.log("Required role:", requiredRole);
  
  if (!requiredRole) {
    console.log("No role required, allowing access");
    return NextResponse.next();
  }

  // Get access token
  const token = request.cookies.get('access_token')?.value;

  console.log("Token present:", !!token);
  
  if (!token) {
    // Redirect to login
    const locale = pathname.split('/')[1] || 'en';
    console.log(`[AUTH] No token for ${pathname}, redirecting to /${locale}/login`);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  try {
    const payload = await verifyAccessToken(token);
    
    console.log(`[AUTH] Token verified for ${payload.sub} (${payload.role})`);

    // ADMIN has access to all routes
    if (payload.role === 'ADMIN') {
      console.log("ADMIN user, allowing access");
      return NextResponse.next();
    }

    // Check role for other users
    if (payload.role !== requiredRole) {
      // Redirect to 403 forbidden page
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/403`, request.url));
    }

    console.log("Role check passed, allowing access");
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to login
    const locale = pathname.split('/')[1] || 'en';
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}
