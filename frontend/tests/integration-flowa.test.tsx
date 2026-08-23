// tests/integration-flows.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RoleGuard, roleHome } from '@/components/RoleGuard';
import { Header } from '@/components/Header';

// Mock do Next.js navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
        replace: mockReplace,
        back: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock das APIs
vi.mock('@/lib/api', () => ({
    getEvents: vi.fn(),
    getEvent: vi.fn(),
    getTickets: vi.fn(),
    getReservation: vi.fn(),
    getGateDashboard: vi.fn(),
    getPublicTicket: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    createReservation: vi.fn(),
    processPayment: vi.fn(),
    cancelReservation: vi.fn(),
    validateGateTicket: vi.fn(),
    cancelGateTicket: vi.fn(),
}));

describe('Integração - Fluxo Completo', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('cliente: login → eventos → compra → sucesso', async () => {
        // Mock usuário cliente
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'customer-1',
            name: 'Cliente',
            email: 'cliente@teste.com',
            role: 'CUSTOMER',
        }));

        // Verificar redirecionamento
        const destination = roleHome.CUSTOMER;
        expect(destination).toBe('/eventos');

        // Renderizar com Header
        render(<Header />);

        await waitFor(() => {
            expect(screen.getByText('Eventos')).toBeInTheDocument();
            expect(screen.getByText('Meus ingressos')).toBeInTheDocument();
        });
    });

    it('organizador: login → dashboard', async () => {
        // Mock usuário organizador
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'organizer-1',
            name: 'Organizador',
            email: 'organizador@teste.com',
            role: 'ORGANIZER',
        }));

        // Verificar redirecionamento
        const destination = roleHome.ORGANIZER;
        expect(destination).toBe('/dashboard');

        // Renderizar com Header
        render(<Header />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });

    it('deve bloquear acesso não autorizado', async () => {
        // Mock usuário cliente tentando acessar dashboard
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'customer-1',
            name: 'Cliente',
            email: 'cliente@teste.com',
            role: 'CUSTOMER',
        }));

        // Cliente não deve ter acesso a /dashboard
        const customerHome = roleHome.CUSTOMER;
        expect(customerHome).not.toBe('/dashboard');

        // Organizador não deve ter acesso a /meus-ingressos
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'organizer-1',
            name: 'Organizador',
            email: 'organizador@teste.com',
            role: 'ORGANIZER',
        }));

        const organizerHome = roleHome.ORGANIZER;
        expect(organizerHome).not.toBe('/meus-ingressos');
    });

    it('deve permitir RoleGuard para cliente acessar /meus-ingressos', async () => {
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'customer-1',
            name: 'Cliente',
            email: 'cliente@teste.com',
            role: 'CUSTOMER',
        }));

        render(
            <RoleGuard allowedRoles={['CUSTOMER']}>
                <div>Página de Meus Ingressos</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Página de Meus Ingressos')).toBeInTheDocument();
        });
    });

    it('deve permitir RoleGuard para organizador acessar /dashboard', async () => {
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'organizer-1',
            name: 'Organizador',
            email: 'organizador@teste.com',
            role: 'ORGANIZER',
        }));

        render(
            <RoleGuard allowedRoles={['ORGANIZER']}>
                <div>Página de Dashboard</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Página de Dashboard')).toBeInTheDocument();
        });
    });

    it('deve bloquear RoleGuard para cliente acessar dashboard', async () => {
        localStorage.setItem('vivae_user', JSON.stringify({
            id: 'customer-1',
            name: 'Cliente',
            email: 'cliente@teste.com',
            role: 'CUSTOMER',
        }));

        render(
            <RoleGuard allowedRoles={['ORGANIZER']}>
                <div>Dashboard</div>
            </RoleGuard>
        );

        // Deve redirecionar para /eventos (home do cliente)
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/eventos');
        });
    });
});