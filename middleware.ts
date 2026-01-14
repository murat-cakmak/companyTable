import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Check for session cookie
    const sessionDetail = request.cookies.get('user_session_email');
    const mustChangePassword = request.cookies.get('must_change_password');

    const isLoginPage = request.nextUrl.pathname === '/login';
    const isProfilePage = request.nextUrl.pathname === '/profile';
    const isPublicAsset = request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.includes('.'); // files like favicon.ico

    // 2. Redirect Logic

    // If NO session and trying to access protected route -> Redirect to Login
    if (!sessionDetail && !isLoginPage && !isPublicAsset) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If HAS session and trying to access Login -> Redirect to Home (or Profile if restricted)
    if (sessionDetail && isLoginPage) {
        return NextResponse.redirect(new URL(mustChangePassword ? '/profile' : '/', request.url));
    }

    // If HAS session AND Must Change Password AND Not on Profile Page -> Force Profile
    if (sessionDetail && mustChangePassword && !isProfilePage && !isPublicAsset) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
