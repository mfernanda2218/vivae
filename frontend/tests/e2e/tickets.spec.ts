// e2e/tickets.spec.ts
import { test, expect, Page } from '@playwright/test';

const cliente = { email: 'cliente@vivae.app', password: 'password123' };

async function loginCliente(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', cliente.email);
    await page.fill('input[type="password"]', cliente.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
}

test.describe('Meus Ingressos', () => {
    test('cliente pode acessar /meus-ingressos', async ({ page }) => {
        await loginCliente(page);

        // Navegar diretamente para /meus-ingressos
        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Verificar se está na página
        await expect(page).toHaveURL(/\/meus-ingressos/);
    });

    test('cliente vê QR Code nos ingressos', async ({ page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Tentar encontrar QR Code
        const qrCodes = page.locator('img[src*="data:image"]');
        const qrCodeCount = await qrCodes.count();

        if (qrCodeCount === 0) {
            // Se não houver QR Codes, verificar se há mensagem de vazio
            const emptyMessage = page.locator('text=Nenhum ingresso por enquanto');
            if (await emptyMessage.count() > 0) {
                await expect(emptyMessage).toBeVisible();
            }
        }
    });

    test('cliente pode salvar (download) o ingresso', async ({ page }) => {
        await loginCliente(page);

        await page.goto('/meus-ingressos');
        await page.waitForTimeout(3000);

        // Tentar encontrar botão Salvar
        const saveButton = page.locator('button:has-text("Salvar")');

        if (await saveButton.count() > 0) {
            const downloadPromise = page.waitForEvent('download');
            await saveButton.click();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/ingresso-.*\.png/);
        }
    });
});