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
    await page.waitForTimeout(3000);
}

test.describe('Proteção de Rotas', () => {
    test('usuário não logado é redirecionado para /login ao acessar rota protegida', async ({ page }) => {
        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Deve estar em /login
        await expect(page).toHaveURL(/\/login/);
    });

    test('cliente não pode acessar /dashboard', async ({ page }) => {
        await login(page, demoAccounts.cliente);
        await page.waitForTimeout(1000);

        // Tentar acessar dashboard
        await page.goto('/dashboard');
        await page.waitForTimeout(3000);

        // Deve ser redirecionado para /eventos ou /login
        const url = page.url();
        expect(url.includes('/eventos') || url.includes('/login')).toBeTruthy();
    });

    test('organizador não pode acessar /meus-ingressos', async ({ page }) => {
        await login(page, demoAccounts.organizador);
        await page.waitForTimeout(1000);

        // Tentar acessar meus-ingressos
        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Deve ser redirecionado para /dashboard ou /eventos
        const url = page.url();
        expect(url.includes('/dashboard') || url.includes('/eventos')).toBeTruthy();
    });

    test('portaria não pode acessar /dashboard', async ({ page }) => {
        await login(page, demoAccounts.portaria);
        await page.waitForTimeout(1000);

        // Tentar acessar dashboard
        await page.goto('/dashboard');
        await page.waitForTimeout(3000);

        // Deve ser redirecionado para /portaria ou /eventos
        const url = page.url();
        expect(url.includes('/portaria') || url.includes('/eventos')).toBeTruthy();
    });
});

test.describe('Navegação', () => {
    test('cliente pode navegar para /meus-ingressos', async ({ page }) => {
        await login(page, demoAccounts.cliente);

        // Navegar diretamente para /meus-ingressos
        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Deve estar em /meus-ingressos
        await expect(page).toHaveURL(/\/meus-ingressos/);
    });

    test('organizador pode navegar para /portaria', async ({ page }) => {
        await login(page, demoAccounts.organizador);

        // Navegar diretamente para /portaria
        await page.goto('/portaria');
        await page.waitForTimeout(3000);

        // Deve estar em /portaria
        await expect(page).toHaveURL(/\/portaria/);
    });
});