import { Page, Locator } from '@playwright/test';

export class OfertaAcademicaPage {
  readonly pageHeading: Locator;
  readonly misInscripcionesHeading: Locator;
  readonly recomendadosHeading: Locator;
  readonly explorarLink: Locator;

  readonly inscritoBadge: Locator;
  readonly irAlAulaButton: Locator;

  readonly recomendadosNextArrow: Locator;
  readonly firstVerMasButton: Locator;

  readonly catalogHeading: Locator;
  readonly backArrow: Locator;

  constructor(private readonly page: Page) {
    this.pageHeading = page.getByRole('heading', { name: /Oferta Acad[êé]mica/i, level: 1 });
    this.misInscripcionesHeading = page.getByText(/Minhas inscri|Mis inscripciones/i).first();
    this.recomendadosHeading = page.getByText(/Recomendados para (voc[êe]|vos)/i).first();
    this.explorarLink = page.getByRole('link', { name: /Explorar toda.*oferta/i }).filter({ visible: true }).first();

    this.inscritoBadge = page.getByText(/^(INSCRITO|INSCRIPTO)$/).first();
    this.irAlAulaButton = page.getByRole('link', { name: /Ir (para a sala|al aula)/i }).filter({ visible: true }).first();

    this.recomendadosNextArrow = page.getByRole('button', { name: /Pr[óo]ximos|Siguiente/i }).filter({ visible: true }).first();
    this.firstVerMasButton = page
      .locator('a, button')
      .filter({ hasText: /^Ver m[áa]s$|^Ver mais$/i })
      .filter({ visible: true })
      .first();

    this.catalogHeading = page.getByRole('heading', { name: /Explorar toda.*oferta/i });
    this.backArrow = page.getByRole('button').filter({ has: page.locator('svg[class*="chevron-left"], svg[class*="arrow-left"]') }).first();
  }

  async goto() {
    await this.page.goto('/sections/academic-offer', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }
}
