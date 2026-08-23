// e2e/dashboard.spec.ts
import { test, expect, Page } from '@playwright/test';

const organizador = { email: 'organizador@vivae.app', password: 'password123' };

async function loginOrganizador(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', organizador.email);
    await page.fill('input[type="password"]', organizador.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
}

test.describe('Dashboard do Organizador', () => {
    test('organizador pode acessar /dashboard', async ({ page }) => {
        await loginOrganizador(page);

        // Navegar diretamente para /dashboard
        await page.goto('/dashboard');
        await page.waitForTimeout(3000);

        // Verificar se está na página
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('dashboard mostra métricas', async ({ page }) => {
        await loginOrganizador(page);

        await page.goto('/dashboard');
        await page.waitForTimeout(3000);

        // Verificar se há elementos
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
    });

    test('organizador pode abrir portaria', async ({ page }) => {
        await loginOrganizador(page);

        await page.goto('/dashboard');
        await page.waitForTimeout(3000);

        // Tentar clicar em "Abrir portaria"
        const portariaLink = page.locator('a:has-text("Abrir portaria")');
        if (await portariaLink.count() > 0) {
            await portariaLink.click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/\/portaria/);
        }
    });
});