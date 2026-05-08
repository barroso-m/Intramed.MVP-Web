import { Page, Locator } from '@playwright/test';
import { secureFill } from '../../../utils/secureFill';

const LOGIN_URL = process.env.LOGIN_URL ?? 'https://intramed-login-qa.conexa.ai/login';

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
    await this.page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await secureFill(this.passwordInput, password);
    await this.submitButton.click();
  }
}
