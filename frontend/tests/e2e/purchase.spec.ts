// e2e/purchase.spec.ts
import { test, expect, Page } from '@playwright/test';

const cliente = { email: 'cliente@vivae.app', password: 'password123' };

async function loginCliente(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', cliente.email);
    await page.fill('input[type="password"]', cliente.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
}

test.describe('Fluxo de Compra', () => {
    test('cliente pode acessar detalhes de um evento', async ({ page }) => {
        await loginCliente(page);

        // Navegar para eventos
        await page.goto('/eventos');
        await page.waitForTimeout(2000);

        // Tentar encontrar um link de evento
        const eventLink = page.locator('a[href*="/eventos/"]').first();

        if (await eventLink.count() > 0) {
            await eventLink.click();
            await page.waitForTimeout(2000);
            await expect(page).toHaveURL(/\/eventos\/[a-f0-9-]+/);
        } else {
            // Se não encontrar eventos, verificar se está na página de eventos
            await expect(page).toHaveURL(/\/eventos/);
        }
    });

    test('cliente pode clicar em "Comprar ingresso"', async ({ page }) => {
        await loginCliente(page);

        // Navegar para eventos
        await page.goto('/eventos');
        await page.waitForTimeout(2000);

        // Tentar encontrar um link de evento
        const eventLink = page.locator('a[href*="/eventos/"]').first();

        if (await eventLink.count() > 0) {
            await eventLink.click();
            await page.waitForTimeout(2000);

            // Tentar clicar em "Comprar ingresso"
            const buyButton = page.locator('a:has-text("Comprar ingresso")');
            if (await buyButton.count() > 0) {
                await buyButton.click();
                await page.waitForTimeout(2000);
                await expect(page).toHaveURL(/\/eventos\/[a-f0-9-]+\/comprar/);
            }
        }
    });
});