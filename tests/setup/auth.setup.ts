import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/Intramed/LoginPage-Intramed';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
  await page.waitForURL('**/feed**', { timeout: 30000 });
  await page.context().storageState({ path: 'playwright/.auth/auth.json' });
});
