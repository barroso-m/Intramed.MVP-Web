import { test, expect } from '@playwright/test';
import { FeedPage } from '../../pages/Intramed/FeedPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

test.describe('Feed', () => {
  test('[IE-T19] TC03 - crear publicación con texto y emoji', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    const postContent = `Post automatizado ${Date.now()}`;
    await feedPage.openCreatePostModal();
    await feedPage.typePostContent(postContent);
    await feedPage.addEmoji('💪');
    await feedPage.submitPost();

    await expect(page.getByText(postContent).first()).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T34] FEED-001 - abrir modal Repostear', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.openRepostModal();

    await expect(feedPage.repostModalHeading).toBeVisible();
    await expect(feedPage.repostSubmitButton).toBeDisabled();
  });

  test('[IE-T35] FEED-002 - guardar y desguardar una publicación', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await feedPage.firstSaveButton.waitFor({ state: 'visible' });
    await feedPage.toggleFirstSave();
    await page.waitForTimeout(1500);
    await feedPage.toggleFirstSave();
    await page.waitForTimeout(1500);
  });

  test('[IE-T36] FEED-003 - abrir sección de comentarios', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.firstCommentButton.click();
    await expect(feedPage.commentSubmitButton).toBeVisible({ timeout: 10000 });
    await expect(feedPage.commentSubmitButton).toBeDisabled();
  });

  test('[IE-T37] FEED-005 - aplicar y limpiar filtros del feed', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await expect(page).toHaveURL(/\/feed$/);

    await feedPage.filterPersonas.click();
    await expect(page).toHaveURL(/pb=people/);

    await feedPage.filterArticulos.click();
    await expect(page).toHaveURL(/ptc=/);

    await feedPage.filterLimpiar.click();
    await expect(page).toHaveURL(/\/feed$/);
  });

  test('[IE-T38] FEED-007 - filtro Encuestas navega correctamente', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.filterEncuestas.click();
    await expect(page).toHaveURL(/ptc=survey/, { timeout: 10000 });
  });

  test('[IE-T39] FEED-008 - visualización de módulos de la columna derecha', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await expect(feedPage.institucionesSugeridasHeading).toBeVisible();
    await expect(feedPage.personasSugeridasHeading).toBeVisible();
    await expect(feedPage.eventosDestacadosHeading).toBeVisible();
  });

  test('[IE-T40] FEED-010 - visualización de la card de perfil en el feed', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await expect(page.getByText('Ing. Tincho Barroso').first()).toBeVisible();
    await expect(feedPage.colegasLink).toBeVisible();
    await expect(feedPage.seguidosLink).toBeVisible();
    await expect(feedPage.seguidoresLink).toBeVisible();
  });

  test('[IE-T41] FEED-011 - validación de mínimo 50 caracteres en repost', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.openRepostModal();

    await expect(feedPage.repostSubmitButton).toBeDisabled();

    await feedPage.repostEditor.click();
    await feedPage.repostEditor.fill('Texto corto');
    await expect(feedPage.repostSubmitButton).toBeDisabled();

    await feedPage.repostEditor.fill('x'.repeat(60));
    await expect(feedPage.repostSubmitButton).toBeEnabled({ timeout: 5000 });

    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await expect(feedPage.repostModalHeading).not.toBeVisible({ timeout: 5000 });
  });

  test('[IE-T42] FEED-013 - dar y quitar like a una publicación', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.firstLikeButton.waitFor({ state: 'visible' });

    const readCount = async () =>
      parseInt((await feedPage.firstLikeCount.textContent())?.trim() || '0', 10);

    const before = await readCount();

    await feedPage.toggleFirstLike();
    await expect
      .poll(readCount, { timeout: 5000 })
      .toBe(before + 1);

    await feedPage.toggleFirstLike();
    await expect
      .poll(readCount, { timeout: 5000 })
      .toBe(before);
  });
});
