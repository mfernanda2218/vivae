// e2e/dashboard.spec.ts
import { test, expect, Page } from '@playwright/test';

const organizador = { email: 'organizador@vivae.app', password: 'password123' };

async function loginOrganizador(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"]', organizador.email);
    await page.fill('input[type="password"]', organizador.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
}

test.describe('Dashboard do Organizador', () => {
    test('organizador pode acessar /dashboard', async ({ page }: { page: Page }) => {
        await loginOrganizador(page);

        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('dashboard mostra métricas', async ({ page }: { page: Page }) => {
        await loginOrganizador(page);

        await expect(page.locator('text=Eventos')).toBeVisible();
        await expect(page.locator('text=Ingressos')).toBeVisible();
        await expect(page.locator('text=Ativos')).toBeVisible();
    });

    test('organizador pode abrir portaria', async ({ page }: { page: Page }) => {
        await loginOrganizador(page);

        await page.click('text=Abrir portaria');

        await expect(page).toHaveURL(/\/portaria/);
    });

    test('organizador pode criar portaria', async ({ page }: { page: Page }) => {
        await loginOrganizador(page);

        await page.click('text=Criar portaria');

        // Preencher formulário
        await page.fill('input[placeholder="Nome da portaria"]', 'Portaria Teste');
        await page.fill('input[placeholder="portaria@evento.com"]', 'portaria.teste@vivae.com');
        await page.fill('input[placeholder="Mínimo 8 caracteres"]', 'password123');

        await page.click('button:has-text("Criar portaria")');

        await expect(page.locator('text=Portaria criada')).toBeVisible();
    });

    test('dashboard mostra eventos do organizador', async ({ page }: { page: Page }) => {
        await loginOrganizador(page);

        // Verificar se há eventos listados
        const eventCards = page.locator('article');
        const count = await eventCards.count();
        expect(count).toBeGreaterThan(0);
    });
});