import { Page, Locator } from '@playwright/test';
import { secureFill } from '../../../utils/secureFill';
import { fillStable, waitForHydration } from '../../../utils/hydration';

const LOGIN_URL = process.env.LOGIN_URL ?? 'https://login.qa.intramed.net/login';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole('textbox', { name: 'Email / Usuario' });
    this.passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
    this.submitButton = page.locator('#loginButton');
    this.errorMessage = page.locator('[class*="error"], [class*="alert"]').first();
  }

  async goto() {
    try {
      await this.page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    } catch (err) {
      // Playwright throws when a pending navigation (e.g. a post-logout redirect)
      // races against goto. In that case we've likely already landed on /login.
      if (!/is interrupted by another navigation/i.test((err as Error).message)) {
        throw err;
      }
    }
    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
    // Sin esto el submit se dispara de forma nativa y nunca llega a la API.
    await waitForHydration(this.submitButton);
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await fillStable(this.emailInput, email);
    await secureFill(this.passwordInput, password);
    await this.submitButton.click();
  }
}
