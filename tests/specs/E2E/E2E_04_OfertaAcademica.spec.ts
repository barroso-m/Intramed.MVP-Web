import { test, expect } from '@playwright/test';
import { OfertaAcademicaPage } from '../../pages/Intramed/OfertaAcademicaPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

test.describe('OfertaAcademica', () => {
  test('[IE-T61] OFA-001 - visualización general', { tag: '@oferta' }, async ({ page }) => {
    const ofertaPage = new OfertaAcademicaPage(page);

    await ofertaPage.goto();

    await expect(ofertaPage.pageHeading).toBeVisible();
    await expect(ofertaPage.misInscripcionesHeading).toBeVisible();
    await expect(ofertaPage.recomendadosHeading).toBeVisible();
    await expect(ofertaPage.explorarLink).toBeVisible();
  });

  test('[IE-T62] OFA-002 - carrusel Recomendados avanza', { tag: '@oferta' }, async ({ page }) => {
    const ofertaPage = new OfertaAcademicaPage(page);

    await ofertaPage.goto();

    await expect(ofertaPage.recomendadosNextArrow).toBeVisible({ timeout: 10000 });
    await ofertaPage.recomendadosNextArrow.click();
    await page.waitForTimeout(800);
  });

  test('[IE-T63] OFA-003 - curso inscripto con badge y acceso al aula', { tag: '@oferta' }, async ({ page }) => {
    const ofertaPage = new OfertaAcademicaPage(page);

    await ofertaPage.goto();

    await expect(ofertaPage.inscritoBadge).toBeVisible();
    await expect(ofertaPage.irAlAulaButton).toBeVisible();
  });

  test('[IE-T64] OFA-004 - Ver más navega al detalle del contenido', { tag: '@oferta' }, async ({ page }) => {
    const ofertaPage = new OfertaAcademicaPage(page);

    await ofertaPage.goto();

    await ofertaPage.firstVerMasButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/content\//);
  });

  test('[IE-T66] OFA-006 - Explorar toda la oferta abre el catálogo', { tag: '@oferta' }, async ({ page }) => {
    const ofertaPage = new OfertaAcademicaPage(page);

    await ofertaPage.goto();
    await ofertaPage.explorarLink.scrollIntoViewIfNeeded();
    await ofertaPage.explorarLink.click();

    await expect(page).toHaveURL(/\/sections\/academic-offer\/catalog/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(ofertaPage.catalogHeading).toBeVisible({ timeout: 10000 });

    await ofertaPage.firstVerMasButton.click();
    await expect(page).toHaveURL(/\/content\//, { timeout: 15000 });
  });
});
