import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Run intl middleware first to handle locale routing
    const response = intlMiddleware(request);

    // If intl middleware wants to redirect (e.g. / -> /en), let it.
    if (response.status >= 300 && response.status < 400) {
        return response;
    }

    // 2. Auth Logic
    const sessionDetail = request.cookies.get('user_session_email');
    const mustChangePassword = request.cookies.get('must_change_password');

    // Strip locale to check generic paths
    const pathnameWithoutLocale = pathname.replace(/^\/(en|tr)/, '') || '/';

    // Check for public assets/API
    // Note: matcher config handles most exclusion, but be safe
    const isPublicAsset = pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') ||
        pathname.startsWith('/api') ||
        pathname.includes('/api/');

    const isLoginPage = pathnameWithoutLocale === '/login';
    const isProfilePage = pathnameWithoutLocale === '/profile';

    // Determine current locale for manual redirects if needed
    const localeMatch = pathname.match(/^\/(en|tr)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    // If NO session and trying to access protected route -> Redirect to Login
    if (!sessionDetail && !isLoginPage && !isPublicAsset) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // If HAS session and trying to access Login -> Redirect to Home (or Profile)
    if (sessionDetail && isLoginPage) {
        const target = mustChangePassword ? '/profile' : '/';
        // Ensure we don't double slash if target is /
        const finalPath = target === '/' ? `/${locale}` : `/${locale}${target}`;
        return NextResponse.redirect(new URL(finalPath, request.url));
    }

    // If HAS session AND Must Change Password AND Not on Profile Page -> Force Profile
    if (sessionDetail && mustChangePassword && !isProfilePage && !isPublicAsset) {
        return NextResponse.redirect(new URL(`/${locale}/profile`, request.url));
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
