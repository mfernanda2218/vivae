// e2e/purchase.spec.ts
import { test, expect, Page } from '@playwright/test';

const cliente = { email: 'cliente@vivae.app', password: 'password123' };

async function loginCliente(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', cliente.email);
    await page.fill('input[type="password"]', cliente.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/eventos');
}

test.describe('Fluxo de Compra', () => {
    test('cliente pode acessar detalhes de um evento', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        // Clicar no primeiro evento
        await page.locator('a[href*="/eventos/"]').first().click();

        await expect(page).toHaveURL(/\/eventos\/[a-f0-9-]+/);
    });

    test('cliente pode clicar em "Comprar ingresso"', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        // Clicar no primeiro evento
        await page.locator('a[href*="/eventos/"]').first().click();

        // Clicar em Comprar ingresso
        await page.click('text=Comprar ingresso');

        await expect(page).toHaveURL(/\/eventos\/[a-f0-9-]+\/comprar/);
    });

    test('cliente pode selecionar quantidade e pagar', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        // Acessar um evento
        await page.locator('a[href*="/eventos/"]').first().click();
        await page.click('text=Comprar ingresso');

        // Aumentar quantidade
        await page.click('button[aria-label="Aumentar quantidade"]');

        // Verificar total atualizado
        const total = await page.locator('text=Total').locator('..').textContent();
        expect(total).toContain('R$');

        // Pagar
        await page.click('button:has-text("Pagar agora")');

        // Aguardar redirecionamento para sucesso
        await page.waitForURL('**/comprar/sucesso**');
        await expect(page.locator('text=Pagamento aprovado')).toBeVisible();
    });

    test('cliente pode simular pagamento recusado', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        // Acessar um evento
        await page.locator('a[href*="/eventos/"]').first().click();
        await page.click('text=Comprar ingresso');

        // Simular recusa
        await page.click('button:has-text("Simular recusa")');

        // Aguardar redirecionamento para erro
        await page.waitForURL('**/comprar/erro**');
        await expect(page.locator('text=Pagamento recusado')).toBeVisible();
    });
});