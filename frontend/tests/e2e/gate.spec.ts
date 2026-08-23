// e2e/gate.spec.ts
import { test, expect, Page } from '@playwright/test';

const portaria = { email: 'portaria@vivae.app', password: 'password123' };

async function loginPortaria(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', portaria.email);
    await page.fill('input[type="password"]', portaria.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/portaria');
}

test.describe('Portaria', () => {
    test('portaria pode acessar /portaria', async ({ page }: { page: Page }) => {
        await loginPortaria(page);

        await expect(page.locator('h1')).toContainText('Controle de entrada');
    });

    test('portaria pode selecionar evento', async ({ page }: { page: Page }) => {
        await loginPortaria(page);

        await page.selectOption('select', { index: 1 });

        await expect(page.locator('select')).toHaveValue(/[a-f0-9-]+/);
    });

    test('portaria pode validar ingresso manualmente', async ({ page }: { page: Page }) => {
        await loginPortaria(page);

        // Digitar código de ingresso (simulado)
        await page.fill('input[placeholder*="Cole o link"]', 'VIVAE-TESTE123');
        await page.click('button:has-text("Validar entrada")');

        // Aguardar resultado
        await expect(page.locator('text=Resultado')).toBeVisible();
    });

    test('portaria pode cancelar ingresso', async ({ page }: { page: Page }) => {
        await loginPortaria(page);

        // Digitar código de ingresso (simulado)
        await page.fill('input[placeholder*="Cole o link"]', 'VIVAE-TESTE123');
        await page.click('button:has-text("Cancelar ingresso")');

        // Aguardar resultado
        await expect(page.locator('text=Resultado')).toBeVisible();
    });

    test('portaria vê seleção de eventos', async ({ page }: { page: Page }) => {
        await loginPortaria(page);

        // Verificar se há opções de eventos
        const options = page.locator('select option');
        const count = await options.count();
        expect(count).toBeGreaterThan(0);
    });
});