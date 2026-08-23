// e2e/tickets.spec.ts
import { test, expect, Page } from '@playwright/test';

const cliente = { email: 'cliente@vivae.app', password: 'password123' };

async function loginCliente(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', cliente.email);
    await page.fill('input[type="password"]', cliente.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/eventos');
}

test.describe('Meus Ingressos', () => {
    test('cliente pode acessar /meus-ingressos', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');

        await expect(page.locator('h1')).toContainText('Meus ingressos');
    });

    test('cliente vê QR Code nos ingressos', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');

        // Verificar se há imagens de QR Code
        const qrCodes = page.locator('img[alt*="QR Code"]');
        await expect(qrCodes.first()).toBeVisible();
    });

    test('cliente pode salvar (download) o ingresso', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');

        // Aguardar download
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Salvar")');
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toMatch(/ingresso-.*\.png/);
    });

    test('cliente pode cancelar reserva', async ({ page }: { page: Page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');

        // Confirmar cancelamento
        page.on('dialog', async (dialog) => {
            await dialog.accept();
        });

        await page.click('button:has-text("Cancelar")');

        // Verificar toast de sucesso
        await expect(page.locator('text=Reserva cancelada')).toBeVisible();
    });
});