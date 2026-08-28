import { Page, Locator, expect } from '@playwright/test';

export class InstitutionPage {
  readonly userAvatarNav: Locator;
  readonly userMenuCrearInstitucion: Locator;

  readonly createModalHeading: Locator;
  readonly nameInput: Locator;
  readonly createSubmitButton: Locator;

  readonly followButton: Locator;
  readonly followingButton: Locator;

  readonly infoTab: Locator;
  readonly addUserButton: Locator;
  readonly addUserSearchInput: Locator;
  readonly addUserConfirmButton: Locator;

  constructor(private readonly page: Page) {
    this.userAvatarNav = page.locator('img[alt="user-profile-img"]').first();
    this.userMenuCrearInstitucion = page.getByText('Crear institución', { exact: true }).filter({ visible: true }).first();

    this.createModalHeading = page.getByRole('heading', { name: /crear nueva institución|crear institución/i });
    this.nameInput = page.locator('input[name="name"], input[name="institutionName"], input[placeholder*="nombre" i]').first();
    this.createSubmitButton = page.getByRole('button', { name: /^(crear|guardar|crear institución|siguiente)$/i }).filter({ visible: true }).last();

    this.followButton = page.getByRole('button', { name: /^seguir$/i }).filter({ visible: true }).first();
    this.followingButton = page.getByRole('button', { name: /siguiendo|dejar de seguir/i }).filter({ visible: true }).first();

    this.infoTab = page.getByRole('link', { name: /gestion de permisos|gestión de permisos/i }).or(
      page.getByRole('button', { name: /gestion de permisos|gestión de permisos/i })
    ).filter({ visible: true }).first();
    this.addUserButton = page.getByRole('button', { name: /agregar usuario|invitar usuario|nuevo administrador|agregar administrador/i }).filter({ visible: true }).first();
    this.addUserSearchInput = page.getByPlaceholder(/buscar|nombre|email/i).filter({ visible: true }).first();
    this.addUserConfirmButton = page.getByRole('button', { name: /agregar|enviar invitación|confirmar/i }).filter({ visible: true }).last();
  }

  async openUserMenu() {
    await this.userAvatarNav.waitFor({ state: 'visible' });
    await this.userAvatarNav.click({ force: true });
    await this.userMenuCrearInstitucion.waitFor({ state: 'visible', timeout: 10000 });
  }

  async openCreateInstitutionForm() {
    await this.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.openUserMenu();
    await this.userMenuCrearInstitucion.click();
    await this.page.waitForLoadState('networkidle');
  }

  async gotoInstitution(slug: string) {
    await this.page.goto(`/institution/${slug}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async uploadFileToHiddenInput(inputLocator: Locator, filePath: string) {
    await inputLocator.setInputFiles(filePath);
  }
}
