import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';
import { roleMiddleware } from './lib/auth/role-middleware';

const i18nMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // First, handle role-based protection
  const roleResponse = roleMiddleware(request);
  
  // If role middleware returns a redirect, use it
  if (roleResponse.status === 307 || roleResponse.status === 302) {
    return roleResponse;
  }
  
  // Otherwise, proceed with i18n middleware
  return i18nMiddleware(request);
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|ar)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    // Exclude API routes, static files, and Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

