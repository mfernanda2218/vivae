// e2e/navigation.spec.ts
import { test, expect, Page } from '@playwright/test';

const demoAccounts = {
    cliente: { email: 'cliente@vivae.app', password: 'password123' },
    organizador: { email: 'organizador@vivae.app', password: 'password123' },
    portaria: { email: 'portaria@vivae.app', password: 'password123' },
};

async function login(page: Page, account: { email: string; password: string }) {
    await page.goto('/login');
    await page.fill('input[type="email"]', account.email);
    await page.fill('input[type="password"]', account.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
}

test.describe('Proteção de Rotas', () => {
    test('cliente não pode acessar /dashboard', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.cliente);
        await page.waitForURL('**/eventos');

        await page.goto('/dashboard');

        await page.waitForURL('**/eventos');
        await expect(page).toHaveURL(/\/eventos/);
    });

    test('cliente não pode acessar /portaria', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.cliente);
        await page.waitForURL('**/eventos');

        await page.goto('/portaria');

        await page.waitForURL('**/eventos');
        await expect(page).toHaveURL(/\/eventos/);
    });

    test('organizador não pode acessar /meus-ingressos', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.organizador);
        await page.waitForURL('**/dashboard');

        await page.goto('/meus-ingressos');

        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('organizador pode acessar /portaria', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.organizador);
        await page.waitForURL('**/dashboard');

        await page.goto('/portaria');

        await expect(page).toHaveURL(/\/portaria/);
    });

    test('portaria não pode acessar /dashboard', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.portaria);
        await page.waitForURL('**/portaria');

        await page.goto('/dashboard');

        await page.waitForURL('**/portaria');
        await expect(page).toHaveURL(/\/portaria/);
    });

    test('usuário não logado é redirecionado para /login ao acessar rota protegida', async ({ page }: { page: Page }) => {
        await page.goto('/meus-ingressos');

        await page.waitForURL('**/login');
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe('Navegação', () => {
    test('cliente pode navegar para /meus-ingressos', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.cliente);
        await page.waitForURL('**/eventos');

        await page.click('text=Meus ingressos');

        await expect(page).toHaveURL(/\/meus-ingressos/);
    });

    test('organizador pode navegar para /portaria', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.organizador);
        await page.waitForURL('**/dashboard');

        await page.click('text=Portaria');

        await expect(page).toHaveURL(/\/portaria/);
    });

    test('cliente pode voltar para home', async ({ page }: { page: Page }) => {
        await login(page, demoAccounts.cliente);
        await page.waitForURL('**/eventos');

        await page.click('text=VIVAE');

        await expect(page).toHaveURL(/\/$/);
    });
});