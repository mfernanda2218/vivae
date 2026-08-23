// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

const demoAccounts = {
    cliente: { email: 'cliente@vivae.app', password: 'password123' },
    organizador: { email: 'organizador@vivae.app', password: 'password123' },
    portaria: { email: 'portaria@vivae.app', password: 'password123' },
};

test.describe('Autenticação', () => {
    test('login como cliente redireciona para /eventos', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.cliente.email);
        await page.fill('input[type="password"]', demoAccounts.cliente.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/eventos');
        await expect(page).toHaveURL(/\/eventos/);
    });

    test('login como organizador redireciona para /dashboard', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.organizador.email);
        await page.fill('input[type="password"]', demoAccounts.organizador.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('login como portaria redireciona para /portaria', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.portaria.email);
        await page.fill('input[type="password"]', demoAccounts.portaria.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/portaria');
        await expect(page).toHaveURL(/\/portaria/);
    });

    test('login com credenciais inválidas mostra erro', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'invalido@teste.com');
        await page.fill('input[type="password"]', 'senhaerrada123');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    });

    test('header mostra "Meus ingressos" para cliente logado', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.cliente.email);
        await page.fill('input[type="password"]', demoAccounts.cliente.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/eventos');

        await expect(page.locator('header')).toContainText('Meus ingressos');
    });

    test('header mostra "Dashboard" para organizador logado', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.organizador.email);
        await page.fill('input[type="password"]', demoAccounts.organizador.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/dashboard');

        await expect(page.locator('header')).toContainText('Dashboard');
    });

    test('logout retorna para home', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', demoAccounts.cliente.email);
        await page.fill('input[type="password"]', demoAccounts.cliente.password);
        await page.click('button[type="submit"]');

        await page.waitForURL('**/eventos');

        await page.click('button:has-text("Sair")');
        await page.waitForURL('**/');

        await expect(page).toHaveURL(/\/$/);
    });
});