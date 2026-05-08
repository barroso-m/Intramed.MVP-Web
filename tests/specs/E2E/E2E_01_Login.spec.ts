import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/Intramed/LoginPage-Intramed';

const EMAIL = process.env.TEST_EMAIL!;
const PASSWORD = process.env.TEST_PASSWORD!;
const INVALID_EMAIL = process.env.TEST_INVALID_EMAIL!;
const INVALID_PASSWORD = process.env.TEST_INVALID_PASSWORD!;

test.describe('Login', () => {
  test('[IE-T17] TC01 - login fallido con usuario inexistente', { tag: '@login' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(INVALID_EMAIL, INVALID_PASSWORD);

    await expect(page.getByText('El usuario/email y/o contraseña no son válidos.')).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T18] TC02 - login exitoso con credenciales válidas', { tag: '@login' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(EMAIL, PASSWORD);

    await expect(page.getByText('Ing. Tincho Barroso')).toBeVisible({ timeout: 10000 });
  });
});
