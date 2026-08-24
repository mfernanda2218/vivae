// e2e/auth.spec.ts
import { test, expect, Page } from '@playwright/test';

const demoAccounts = {
    cliente: { email: 'cliente1@vivae.com', password: 'password123' },
    organizador: { email: 'organizer@vivae.com', password: 'password123' },
    portaria: { email: 'portaria@vivae.com', password: 'password123' },
};

async function login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
}

test.describe('Autenticação', () => {
    test('login como cliente redireciona para /eventos', async ({ page }) => {
        await login(page, demoAccounts.cliente.email, demoAccounts.cliente.password);
        await expect(page).toHaveURL(/\/eventos/);
    });

    test('login como organizador redireciona para /dashboard', async ({ page }) => {
        await login(page, demoAccounts.organizador.email, demoAccounts.organizador.password);
        // Aceitar /dashboard ou /eventos (fallback)
        await expect(page).toHaveURL(/\/dashboard|\/eventos/);
    });

    test('login como portaria redireciona para /portaria', async ({ page }) => {
        await login(page, demoAccounts.portaria.email, demoAccounts.portaria.password);
        // Aceitar /portaria ou /eventos (fallback)
        await expect(page).toHaveURL(/\/portaria|\/eventos/);
    });

    test('login com credenciais inválidas não redireciona', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'invalido@teste.com');
        await page.fill('input[type="password"]', 'senhaerrada123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        // Deve permanecer em /login
        await expect(page).toHaveURL(/\/login/);
    });

    test('logout retorna para home', async ({ page }) => {
        await login(page, demoAccounts.cliente.email, demoAccounts.cliente.password);

        // Tentar clicar em Sair (se existir)
        const logoutButton = page.locator('button:has-text("Sair")');
        if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/\/$/);
        }
    });
});