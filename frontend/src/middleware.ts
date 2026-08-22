// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas (acessíveis sem login)
const publicRoutes = ['/', '/eventos', '/login', '/cadastro', '/ingresso'];

// Rotas que exigem autenticação (qualquer usuário logado)
const authRoutes = ['/checkout', '/checkout/sucesso', '/checkout/erro'];

// Rotas por role
const roleRoutes: Record<string, string[]> = {
    CUSTOMER: ['/meus-ingressos', '/checkout', '/checkout/sucesso', '/checkout/erro'],
    ORGANIZER: ['/dashboard'],
    GATE: ['/portaria'],
};

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Permite acesso a rotas públicas
    if (publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // Tenta ler token de cookies ou headers
    const token = request.cookies.get('vivae_token')?.value;
    const userData = request.cookies.get('vivae_user')?.value;

    // Se não tem token, redireciona para login
    if (!token || !userData) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // Parse do usuário
    let user;
    try {
        user = JSON.parse(decodeURIComponent(userData));
    } catch {
        // Se o usuário for inválido, redirecionar para login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // Verificar acesso por role
    const allowedRoutes = roleRoutes[user.role] || [];

    if (allowedRoutes.length > 0 && !allowedRoutes.some(route => path.startsWith(route))) {
        // Usuário não tem permissão para esta rota
        // Redirecionar para a área correta baseado no role
        const redirectPath = user.role === 'ORGANIZER' ? '/dashboard' :
            user.role === 'GATE' ? '/portaria' :
                user.role === 'CUSTOMER' ? '/meus-ingressos' : '/';

        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Proteger todas as rotas exceto as públicas
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};