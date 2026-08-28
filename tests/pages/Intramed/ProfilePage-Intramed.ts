import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly userNavLink: Locator;
  readonly descriptionEditButton: Locator;
  readonly descriptionInput: Locator;
  readonly saveChangesButton: Locator;
  readonly editUserButton: Locator;
  readonly datosPersonalesTab: Locator;
  readonly phoneInput: Locator;
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
  readonly cancelButton: Locator;
  readonly closeModalButton: Locator;
  readonly educacionDescriptionCounter: Locator;
  readonly modalHeadingAgregarEducacion: Locator;
  readonly addSectionButton: Locator;
  readonly addSectionModalHeading: Locator;
  readonly ordenarSeccionesButton: Locator;
  readonly personalizarSeccionesHeading: Locator;
  readonly sortableHandles: Locator;
  readonly activityMoreButton: Locator;
  readonly activityFilter: (name: string) => Locator;
  readonly activityBackButton: Locator;

  constructor(private readonly page: Page) {
    this.userNavLink = page.getByRole('link', { name: /^Ing\. Tincho Barroso\s+\S/ });

    const sectionHeader = (name: string | RegExp) =>
      page
        .locator('.flex.flex-col > .bg-grayscale-10')
        .filter({ hasText: name })
        .filter({ visible: true });

    this.addSectionButton = page
      .locator('.bg-grayscale-10')
      .filter({ hasText: /^Agregar secciones/ })
      .filter({ visible: true })
      .locator('button')
      .first();

    this.addSectionModalHeading = page.getByRole('heading', { name: 'Agregar sección', exact: true });

    this.ordenarSeccionesButton = page
      .locator('.bg-grayscale-10')
      .filter({ hasText: /^Ordenar secciones/ })
      .filter({ visible: true })
      .locator('button')
      .first();

    this.personalizarSeccionesHeading = page.getByRole('heading', { name: 'Personalizar secciones', exact: true });

    this.sortableHandles = page.locator('[aria-roledescription="sortable"]');

    this.activityMoreButton = page.getByText('Ver más actividad').filter({ visible: true }).first();

    this.activityFilter = (name: string) =>
      page.getByRole('button', { name, exact: true }).filter({ visible: true }).first();

    this.activityBackButton = page.getByRole('button').filter({ has: page.locator('svg[class*="chevron-left"], svg[class*="arrow-left"]') }).first();

    this.descriptionEditButton = page.locator('.w-full > .h-full').filter({ visible: true }).first();
    this.descriptionInput = page.getByRole('textbox', { name: 'Escribir sobre tí' });
    this.saveChangesButton = page.getByRole('button', { name: 'Guardar cambios' });
    this.editUserButton = page.locator('button.h-full.self-center').filter({ visible: true }).first();
    this.datosPersonalesTab = page.getByRole('button', { name: /datos personales/i });
    this.phoneInput = page.locator('input[name="phone"]');

    this.addEducacionButton = sectionHeader(/^Educación/).locator('button').first();

    this.educacionDropdown = page.getByText('Seleccionar...').first();
    this.institucionInput = page.getByRole('textbox', { name: 'Institución *' });
    this.titleInput = page.locator('input[name="title"]');
    this.educacionDescriptionInput = page.locator('input[name="description"]');
    this.currentlyStudyingCheckbox = page.locator('input[name="isCurrent"]');
    this.startDateInput = page.locator('input[type="date"]').first();
    this.addButton = page.getByRole('button', { name: 'Agregar' });
    this.deleteEducacionButton = page.locator('.h-full.flex.items-center.absolute').first();
    this.confirmDeleteButton = page.getByRole('button', { name: 'Eliminar' });
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
    this.closeModalButton = page.locator('button:has(svg.feather-x)').first();
    this.educacionDescriptionCounter = page.getByText(/\d+\/180/);
    this.modalHeadingAgregarEducacion = page.getByRole('heading', { name: 'Agregar educación' });
  }

  async gotoViaFeed() {
    await this.page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.userNavLink.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async openUserEditModal() {
    await this.editUserButton.waitFor({ state: 'visible' });
    await this.editUserButton.click();
    await this.datosPersonalesTab.waitFor({ state: 'visible' });
    await this.datosPersonalesTab.click();
  }

  async returnToProfile() {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
  }

  async gotoOtherProfile(handle: string) {
    await this.page.goto(`/profile/${handle}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  get followButton(): Locator {
    return this.page.getByRole('button', { name: /^seguir$/i }).filter({ visible: true }).first();
  }

  get followingButton(): Locator {
    return this.page.getByRole('button', { name: /siguiendo|dejar de seguir/i }).filter({ visible: true }).first();
  }
}
