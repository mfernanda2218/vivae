// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/eventos', '/login', '/cadastro', '/ingresso'];

const roleRoutes: Record<string, string[]> = {
    CUSTOMER: ['/meus-ingressos', '/checkout', '/checkout/sucesso', '/checkout/erro'],
    ORGANIZER: ['/dashboard'],
    GATE: ['/portaria'],
};

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('vivae_token')?.value;
    const userData = request.cookies.get('vivae_user')?.value;

    if (publicRoutes.some(route => path.startsWith(route))) {
        return NextResponse.next();
    }

    if (!token || !userData) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    let user;
    try {
        user = JSON.parse(userData);
    } catch {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    const allowedRoutes = roleRoutes[user.role] || [];

    if (allowedRoutes.length > 0 && !allowedRoutes.some(route => path.startsWith(route))) {
        const redirectPath = user.role === 'ORGANIZER' ? '/dashboard' :
            user.role === 'GATE' ? '/portaria' :
                user.role === 'CUSTOMER' ? '/meus-ingressos' : '/';

        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};