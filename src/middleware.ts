import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
// POLICY: Public by default. Only these routes require strict auth.
// (student) group routes:
const PROTECTED_SEGMENTS = ['/dashboard', '/profile', '/learn', '/enroll', '/verify-email'];

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip public files (images, fonts, etc)
    if (PUBLIC_FILE.test(pathname)) {
        return NextResponse.next();
    }

    // 2. Check if route is protected
    // Remove locale prefix (e.g. /en/dashboard -> /dashboard) to check
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
    const isProtected = PROTECTED_SEGMENTS.some(segment => pathWithoutLocale.startsWith(segment));

    if (isProtected) {
        // ROUTING HINT: Use the 'isLoggedIn' client-side cookie as a navigation gate.
        //
        // WHY NOT refreshToken?
        // The refreshToken cookie has path='/api/v1/auth/refresh' and is set on the
        // backend domain (Railway). It is NEVER sent to the Vercel edge middleware
        // because: (a) the path doesn't match, and (b) it's a different domain.
        //
        // The isLoggedIn cookie is:
        // - Set client-side via document.cookie on path=/ (same Vercel domain)
        // - A non-sensitive boolean hint — it does NOT grant API access
        // - Cleared on logout and on RBAC failures
        //
        // SECURITY: Real auth is enforced by the backend on every API call via
        // JWT validation. This cookie only prevents premature redirects.
        const hasSessionHint = req.cookies.has('isLoggedIn');

        if (!hasSessionHint) {
            // Redirect to login with proper locale
            const locale = pathname.match(/^\/(en|ar)/)?.[1] || routing.defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, req.url);
            loginUrl.searchParams.set('redirect', pathWithoutLocale);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 4. Continue with next-intl middleware for localization
    return createMiddleware(routing)(req);
}

export const config = {
    // Match only internationalized pathnames
    // Skip internal paths (_next, api, etc)
    matcher: ['/', '/(ar|en)/:path*']
};
