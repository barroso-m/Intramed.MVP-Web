import { test, expect } from '@playwright/test';
import path from 'path';
import { FeedPage } from '../../pages/Intramed/FeedPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

const VIDEO_FILE = path.resolve(process.cwd(), 'utils', 'video.mp4');

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

  test('[IE-T48] FEED-001 - abrir modal Repostear', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.openRepostModal();

    await expect(feedPage.repostModalHeading).toBeVisible();
    await expect(feedPage.repostSubmitButton).toBeDisabled();
  });

  test('[IE-T49] FEED-002 - guardar y desguardar una publicación', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await feedPage.revealFirstSaveButton();
    await feedPage.toggleFirstSave();
    await page.waitForTimeout(1500);
    await feedPage.toggleFirstSave();
    await page.waitForTimeout(1500);
  });

  test('[IE-T50] FEED-003 - abrir sección de comentarios', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.firstCommentButton.waitFor({ state: 'visible' });
    await feedPage.firstCommentButton.click();
    await expect(feedPage.commentSubmitButton).toBeVisible({ timeout: 20000 });
    await expect(feedPage.commentSubmitButton).toBeDisabled();
  });

  test('[IE-T52] FEED-005 - aplicar y limpiar filtros del feed', { tag: '@feed' }, async ({ page }) => {
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

  test('[IE-T54] FEED-007 - filtro Encuestas navega correctamente', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.filterEncuestas.waitFor({ state: 'visible', timeout: 20000 });
    await feedPage.filterEncuestas.scrollIntoViewIfNeeded().catch(() => {});
    // Retry the click if the URL doesn't reflect the filter; the button becomes
    // active on click but the URL param is set client-side on the same event.
    for (let attempt = 0; attempt < 3; attempt++) {
      await feedPage.filterEncuestas.click();
      try {
        await page.waitForURL(/ptc=survey/, { timeout: 8000 });
        break;
      } catch {
        await page.waitForTimeout(500);
      }
    }
    await expect(page).toHaveURL(/ptc=survey/, { timeout: 5000 });
  });

  test('[IE-T55] FEED-008 - visualización de módulos de la columna derecha', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await expect(feedPage.institucionesSugeridasHeading).toBeVisible({ timeout: 20000 });
    await expect(feedPage.personasSugeridasHeading).toBeVisible({ timeout: 20000 });
    // "Eventos destacados" se monta recién al entrar en viewport.
    await feedPage.scrollUntilVisible(feedPage.eventosDestacadosHeading, 10, 600);
    await expect(feedPage.eventosDestacadosHeading).toBeVisible({ timeout: 20000 });
  });

  test('[IE-T57] FEED-010 - visualización de la card de perfil en el feed', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();

    await expect(page.getByText('Ing. Tincho Barroso').first()).toBeVisible();
    await expect(feedPage.colegasLink).toBeVisible();
    await expect(feedPage.seguidosLink).toBeVisible();
    await expect(feedPage.seguidoresLink).toBeVisible();
  });

  test('[IE-T58] FEED-011 - validación de mínimo 50 caracteres en repost', { tag: '@feed' }, async ({ page }) => {
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

  test('[IE-T60] FEED-013 - dar y quitar like a una publicación', { tag: '@feed' }, async ({ page }) => {
    const feedPage = new FeedPage(page);

    await feedPage.goto();
    await feedPage.firstLikeButton.waitFor({ state: 'visible' });

    const readCount = async () =>
      parseInt((await feedPage.firstLikeCount.textContent())?.trim() || '0', 10);

    const before = await readCount();

    await feedPage.toggleFirstLike();
    await expect
      .poll(readCount, { timeout: 15000, intervals: [200, 500, 1000] })
      .toBe(before + 1);

    await feedPage.toggleFirstLike();
    await expect
      .poll(readCount, { timeout: 15000, intervals: [200, 500, 1000] })
      .toBe(before);
  });

  test('[IE-T148] FEED-014 - publicar una publicación con video', { tag: '@feed' }, async ({ page }) => {
    // Subir y procesar el video excede holgadamente el timeout por defecto.
    test.setTimeout(180_000);
    const feedPage = new FeedPage(page);
    const text = `Post automatizado con video ${Date.now()}`;

    await feedPage.goto();
    await feedPage.publishWithVideo(text, VIDEO_FILE);

    await expect(page.getByText(text).first()).toBeVisible({ timeout: 30000 });
  });
});
