import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly userNavLink: Locator;
  readonly descriptionEditButton: Locator;
  readonly descriptionInput: Locator;
  readonly saveChangesButton: Locator;
  readonly editUserButton: Locator;
  readonly datosPersonalesTab: Locator;
  readonly phoneInput: Locator;
  readonly editSectionButton: Locator;
  readonly closeSubPanelButton: Locator;
  readonly educacionTab: Locator;
  readonly addEducacionButton: Locator;
  readonly educacionDropdown: Locator;
  readonly institucionInput: Locator;
  readonly titleInput: Locator;
  readonly educacionDescriptionInput: Locator;
  readonly currentlyStudyingCheckbox: Locator;
  readonly startDateInput: Locator;
  readonly addButton: Locator;
  readonly deleteEducacionButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.userNavLink = page.getByRole('link', { name: 'Ing. Tincho Barroso' });
    this.descriptionEditButton = page.locator('.w-full > .h-full').first();
    this.descriptionInput = page.getByRole('textbox', { name: 'Escribir sobre tí' });
    this.saveChangesButton = page.getByRole('button', { name: 'Guardar cambios' });
    this.editUserButton = page.locator('xpath=/html/body/div[4]/div/div/div[1]/div[1]/div/div[2]/div[3]/button[1]');
    this.datosPersonalesTab = page.getByRole('button', { name: /datos personales/i });
    this.phoneInput = page.locator('input[name="phone"]');
    this.editSectionButton = page.locator('.flex.flex-col > .bg-grayscale-10 > .w-full.flex.justify-between > .flex.gap-4 > .h-full');
    this.closeSubPanelButton = page.locator('.feather.feather-x');
    this.educacionTab = page.locator('div').filter({ hasText: /^Educación$/ });
    this.addEducacionButton = page.locator('.flex.flex-col > .bg-grayscale-10 > .w-full.flex.justify-between > .flex.gap-4 > .h-full');
    this.educacionDropdown = page.locator('.css-n9qnu9').first();
    this.institucionInput = page.getByRole('textbox', { name: 'Institución *' });
    this.titleInput = page.locator('input[name="title"]');
    this.educacionDescriptionInput = page.locator('input[name="description"]');
    this.currentlyStudyingCheckbox = page.getByRole('checkbox').first();
    this.startDateInput = page.locator('input[type="date"]').first();
    this.currentlyStudyingCheckbox = page.locator('input[name="isCurrent"]');
    this.addButton = page.getByRole('button', { name: 'Agregar' });
    this.deleteEducacionButton = page.locator('.h-full.flex.items-center.absolute').first();
    this.confirmDeleteButton = page.getByRole('button', { name: 'Eliminar' });
    this.backButton = page.getByRole('button').filter({ has: page.locator('svg.feather-chevron-left') }).first();
  }

  async gotoViaFeed() {
    await this.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await this.userNavLink.click();
  }

  async openUserEditModal() {
    await this.editUserButton.waitFor({ state: 'visible' });
    await this.editUserButton.click();
    await this.datosPersonalesTab.waitFor({ state: 'visible' });
    await this.datosPersonalesTab.click();
  }
}
