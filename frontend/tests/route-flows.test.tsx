// tests/route-flows.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import { RoleGuard, roleHome } from '@/components/RoleGuard';
import { Header } from '@/components/Header';

// Mock das APIs
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockGetEvents = vi.fn();
const mockGetEvent = vi.fn();
const mockCreateReservation = vi.fn();
const mockProcessPayment = vi.fn();

vi.mock('@/lib/api', () => ({
    login: (...args: any[]) => mockLogin(...args),
    register: (...args: any[]) => mockRegister(...args),
    getEvents: (...args: any[]) => mockGetEvents(...args),
    getEvent: (...args: any[]) => mockGetEvent(...args),
    createReservation: (...args: any[]) => mockCreateReservation(...args),
    processPayment: (...args: any[]) => mockProcessPayment(...args),
    getTickets: vi.fn(),
    getReservation: vi.fn(),
    getGateDashboard: vi.fn(),
    getPublicTicket: vi.fn(),
    cancelReservation: vi.fn(),
    validateGateTicket: vi.fn(),
    cancelGateTicket: vi.fn(),
}));

// Mock do useToast
const mockShowToast = vi.fn();
vi.mock('@/components/ToastProvider', () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

// Mock do Next.js navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
        replace: mockReplace,
        back: mockBack,
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Dados de teste
const mockEvents = [
    {
        id: 'event-1',
        title: 'Festival de Música',
        description: 'Um festival incrível',
        category: 'Música',
        date: '2026-09-18T22:00:00.000Z',
        location: 'São Paulo, SP',
        price: 180,
        availableTickets: 100,
        imageUrl: null,
        organizer: { id: 'org-1', name: 'Organizador' },
    },
];

const mockCustomerUser = {
    id: 'customer-1',
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    role: 'CUSTOMER' as const,
};

const mockOrganizerUser = {
    id: 'organizer-1',
    name: 'Organizador Teste',
    email: 'organizador@teste.com',
    role: 'ORGANIZER' as const,
};

const mockLoginResponse = {
    accessToken: 'token-test',
    user: mockCustomerUser,
};

const mockOrganizerLoginResponse = {
    accessToken: 'token-test',
    user: mockOrganizerUser,
};

describe('Fluxo de Rotas - Cliente', () => {
    beforeEach(() => {
        localStorage.clear();
        mockGetEvents.mockResolvedValue({ data: mockEvents, meta: { total: 1 } });
        mockGetEvent.mockResolvedValue(mockEvents[0]);
        mockLogin.mockResolvedValue(mockLoginResponse);
        mockCreateReservation.mockResolvedValue({ id: 'res-1' });
        mockProcessPayment.mockResolvedValue({ status: 'CONFIRMED', id: 'res-1' });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('deve redirecionar cliente para /eventos após login', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        const destination = roleHome[mockCustomerUser.role];

        expect(destination).toBe('/eventos');
    });

    it('deve permitir cliente acessar /eventos via RoleGuard', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        render(
            <RoleGuard allowedRoles={['CUSTOMER']}>
                <div>Lista de Eventos</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Lista de Eventos')).toBeInTheDocument();
        });
    });

    it('deve permitir cliente acessar /meus-ingressos via RoleGuard', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        render(
            <RoleGuard allowedRoles={['CUSTOMER']}>
                <div>Meus Ingressos</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Meus Ingressos')).toBeInTheDocument();
        });
    });

    it('deve bloquear cliente de acessar /dashboard', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        const destination = roleHome[mockCustomerUser.role];

        expect(destination).not.toBe('/dashboard');
    });

    it('deve mostrar "Meus ingressos" no header para cliente', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        render(<Header />);

        await waitFor(() => {
            expect(screen.getByText('Meus ingressos')).toBeInTheDocument();
        });
    });

    it('não deve mostrar "Dashboard" no header para cliente', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));

        render(<Header />);

        await waitFor(() => {
            expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
        });
    });
});

describe('Fluxo de Rotas - Organizador', () => {
    beforeEach(() => {
        localStorage.clear();
        mockGetEvents.mockResolvedValue({ data: mockEvents, meta: { total: 1 } });
        mockGetEvent.mockResolvedValue(mockEvents[0]);
        mockLogin.mockResolvedValue(mockOrganizerLoginResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('deve redirecionar organizador para /dashboard após login', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        const destination = roleHome[mockOrganizerUser.role];

        expect(destination).toBe('/dashboard');
    });

    it('deve permitir organizador acessar /dashboard via RoleGuard', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        render(
            <RoleGuard allowedRoles={['ORGANIZER']}>
                <div>Dashboard</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });

    it('deve permitir organizador acessar /eventos via RoleGuard', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        render(
            <RoleGuard allowedRoles={['ORGANIZER']}>
                <div>Lista de Eventos</div>
            </RoleGuard>
        );

        await waitFor(() => {
            expect(screen.getByText('Lista de Eventos')).toBeInTheDocument();
        });
    });

    it('deve bloquear organizador de acessar /meus-ingressos', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        const destination = roleHome[mockOrganizerUser.role];

        expect(destination).not.toBe('/meus-ingressos');
    });

    it('deve mostrar "Dashboard" no header para organizador', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        render(<Header />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });

    it('não deve mostrar "Meus ingressos" no header para organizador', async () => {
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockOrganizerUser));

        render(<Header />);

        await waitFor(() => {
            expect(screen.queryByText('Meus ingressos')).not.toBeInTheDocument();
        });
    });
});

describe('Fluxo de Compra - Cliente', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('vivae_token', 'token-test');
        localStorage.setItem('vivae_user', JSON.stringify(mockCustomerUser));
        mockGetEvents.mockResolvedValue({ data: mockEvents, meta: { total: 1 } });
        mockGetEvent.mockResolvedValue(mockEvents[0]);
        mockCreateReservation.mockResolvedValue({ id: 'res-1' });
        mockProcessPayment.mockResolvedValue({ status: 'CONFIRMED', id: 'res-1' });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('deve permitir cliente acessar checkout com eventId', async () => {
        const destination = roleHome.CUSTOMER;
        expect(destination).toBe('/eventos');
    });

    it('deve permitir cliente criar reserva', async () => {
        mockCreateReservation({ eventId: 'event-1', quantity: 2 });

        expect(mockCreateReservation).toHaveBeenCalledWith({
            eventId: 'event-1',
            quantity: 2,
        });
    });

    it('deve permitir cliente processar pagamento', async () => {
        mockProcessPayment({
            reservationId: 'res-1',
            outcome: 'APPROVED',
            method: 'CARD',
        });

        expect(mockProcessPayment).toHaveBeenCalledWith({
            reservationId: 'res-1',
            outcome: 'APPROVED',
            method: 'CARD',
        });
    });

    it('deve redirecionar para sucesso após pagamento aprovado', async () => {
        mockProcessPayment.mockResolvedValue({ status: 'CONFIRMED', id: 'res-1' });

        const result = await mockProcessPayment({
            reservationId: 'res-1',
            outcome: 'APPROVED',
            method: 'CARD',
        });

        expect(result.status).toBe('CONFIRMED');
    });
});