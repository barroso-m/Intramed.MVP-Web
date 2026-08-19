import { Page, Locator } from '@playwright/test';

export class ConfigUserPage {
  readonly cuentaTab: Locator;
  readonly newsletterTab: Locator;
  readonly notificationsTab: Locator;
  readonly datosPersonalesCard: Locator;
  readonly datosProfesionalesCard: Locator;
  readonly gestionCuentaCard: Locator;
  readonly deleteAccountButton: Locator;
  readonly deleteAccountConfirmationText: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly matriculaNumberInput: Locator;
  readonly saveChangesButton: Locator;
  readonly newsletterCheckbox: Locator;
  readonly oncoNewsletterCheckbox: Locator;
  readonly mailingCheckbox: Locator;
  readonly firstWebNotificationSwitch: Locator;

  constructor(private readonly page: Page) {
    this.cuentaTab = page.getByRole('button', { name: 'Cuenta', exact: true });
    this.newsletterTab = page.getByRole('button', { name: 'Newsletter y Preferencias' });
    this.notificationsTab = page
      .locator('[class*="sidebar"], nav, aside')
      .getByRole('button', { name: 'Notificaciones', exact: true })
      .first();

    this.datosPersonalesCard = page.getByRole('button', { name: /^Datos personales/ });
    this.datosProfesionalesCard = page.getByRole('button', { name: /^Datos profesionales/ });
    this.gestionCuentaCard = page.getByRole('button', { name: /^Gestión de cuenta/ });
    this.deleteAccountButton = page.getByRole('button', { name: 'Eliminar', exact: true });
    this.deleteAccountConfirmationText = page.getByText('¿Está seguro que desea eliminar su cuenta de IntraMed?');

    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.matriculaNumberInput = page.locator('input[name="registrationNumber"], input[name="licenseNumber"], input[name="matriculationNumber"]');

    this.saveChangesButton = page.getByRole('button', { name: 'Guardar cambios' });

    this.newsletterCheckbox = page.locator('input#hasNewsletter');
    this.oncoNewsletterCheckbox = page.locator('input#hasOncoNewsletter');
    this.mailingCheckbox = page.locator('input#hasMailing');
    this.firstWebNotificationSwitch = page.locator('input[type="checkbox"]').first();
  }

  async setNewsletter(desired: boolean) {
    const cb = this.newsletterCheckbox;
    if (await cb.isChecked() === desired) return;
    const box = await this.page.locator('label:has(input#hasNewsletter) > div').boundingBox();
    if (!box) throw new Error('Newsletter switch not found');
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.waitForTimeout(400);
      if (await cb.isChecked() === desired) return;
    }
    throw new Error(`Could not set newsletter to ${desired}`);
  }

  async goto() {
    await this.page.goto('/config/user', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async openDatosPersonales() {
    await this.datosPersonalesCard.waitFor({ state: 'visible' });
    await this.datosPersonalesCard.click();
    await this.firstNameInput.waitFor({ state: 'visible' });
  }

  async openDatosProfesionales() {
    await this.datosProfesionalesCard.waitFor({ state: 'visible' });
    await this.datosProfesionalesCard.click();
    await this.saveChangesButton.waitFor({ state: 'visible' });
  }

  async openGestionDeCuenta() {
    await this.gestionCuentaCard.waitFor({ state: 'visible' });
    await this.gestionCuentaCard.click();
    await this.deleteAccountButton.waitFor({ state: 'visible' });
  }

  async deleteAccount() {
    await this.deleteAccountButton.click();
    await this.deleteAccountConfirmationText.waitFor({ state: 'visible' });
    await this.page.getByRole('button', { name: 'Eliminar', exact: true }).last().click();
  }

  async openNewsletter() {
    await this.newsletterTab.click();
    await this.newsletterCheckbox.waitFor({ state: 'attached' });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async openNotifications() {
    await this.page.locator('button:has-text("Notificaciones")').filter({ visible: true }).nth(1).click();
    await this.firstWebNotificationSwitch.waitFor({ state: 'attached' });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async setFirstWebNotification(desired: boolean) {
    const cb = this.firstWebNotificationSwitch;
    if (await cb.isChecked() === desired) return;
    const label = this.page.locator('label:has(input[type="checkbox"])').first();
    const box = await label.locator('> div').boundingBox();
    if (!box) throw new Error('First notification switch not found');
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.waitForTimeout(400);
      if (await cb.isChecked() === desired) return;
    }
    throw new Error(`Could not set first web notification to ${desired}`);
  }
}
