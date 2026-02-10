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
        // AUTH TRUTH: Only refreshToken is a valid routing hint.
        // We do NOT trust 'isLoggedIn' client cookie as proof.
        const hasRefreshCookie = req.cookies.has('refreshToken');

        if (!hasRefreshCookie) {
            // Redirect to login with proper locale
            const locale = pathname.match(/^\/(en|ar)/)?.[1] || routing.defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, req.url);
            // Optional: Add ?redirectUrl=...
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
