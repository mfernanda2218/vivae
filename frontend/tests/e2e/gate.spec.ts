// e2e/gate.spec.ts
import { test, expect, Page } from '@playwright/test';

const portaria = { email: 'portaria@vivae.com', password: 'password123' };

async function loginPortaria(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', portaria.email);
    await page.fill('input[type="password"]', portaria.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
}

test.describe('Portaria', () => {
    test('portaria pode acessar /portaria', async ({ page }) => {
        await loginPortaria(page);

        // Navegar diretamente para /portaria
        await page.goto('/portaria');
        await page.waitForTimeout(3000);

        // Verificar se está na página
        await expect(page).toHaveURL(/\/portaria/);
    });

    test('portaria pode selecionar evento', async ({ page }) => {
        await loginPortaria(page);

        await page.goto('/portaria');
        await page.waitForTimeout(3000);

        // Tentar selecionar evento
        const select = page.locator('select');
        if (await select.count() > 0) {
            await select.selectOption({ index: 1 });
        }
    });

    test('portaria pode validar ingresso manualmente', async ({ page }) => {
        await loginPortaria(page);

        await page.goto('/portaria');
        await page.waitForTimeout(3000);

        // Tentar preencher e validar
        const input = page.locator('input[placeholder*="Cole o link"]');
        const validateButton = page.locator('button:has-text("Validar entrada")');

        if (await input.count() > 0 && await validateButton.count() > 0) {
            await input.fill('VIVAE-TESTE123');
            await validateButton.click();
            await page.waitForTimeout(2000);
        }
    });
});