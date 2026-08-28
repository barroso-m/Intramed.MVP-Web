import { test, expect } from '@playwright/test';
import path from 'path';
import { InstitutionPage } from '../../pages/Intramed/InstitutionPage-Intramed';
import { FeedPage } from '../../pages/Intramed/FeedPage-Intramed';
import { ProfilePage } from '../../pages/Intramed/ProfilePage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

const COVER_IMAGE = path.resolve(process.cwd(), 'utils', 'cover image.jpg');
const OWNED_INSTITUTION_SLUG = 'test-testtest';
const FOLLOW_USER_HANDLE = 'tqaonboarding';
const INSTITUTION_NAME_FOR_POST = /test test|testurl/i;

test.describe('Institution', () => {
  test('[IE-T142] INST-001 - alta de una institución desde el menú del avatar', { tag: '@institution' }, async ({ page }) => {
    const inst = new InstitutionPage(page);

    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await inst.openUserMenu();
    await expect(inst.userMenuCrearInstitucion).toBeVisible();

    await inst.userMenuCrearInstitucion.click();
    await expect(inst.createModalHeading).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('[IE-T143] INST-002 - agregar imagen de portada a una institución', { tag: '@institution' }, async ({ page }) => {
    const inst = new InstitutionPage(page);

    await inst.gotoInstitution(OWNED_INSTITUTION_SLUG);

    const portadaButton = page.getByRole('button', { name: 'Portada', exact: true }).filter({ visible: true }).first();
    await portadaButton.click();
    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]').last();
    await fileInput.setInputFiles(COVER_IMAGE);
    await page.waitForTimeout(3000);

    const toast = page.getByText(/portada|imagen|cambios|actualizad|éxito/i).filter({ visible: true }).first();
    await expect(toast).toBeVisible({ timeout: 15000 });
  });

  test('[IE-T144] INST-003 - abrir gestión de permisos de una institución', { tag: '@institution' }, async ({ page }) => {
    const inst = new InstitutionPage(page);

    await inst.gotoInstitution(OWNED_INSTITUTION_SLUG);

    const gestionLink = page.getByText(/gestion de permisos|gestión de permisos/i).filter({ visible: true }).first();
    await gestionLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const addUserBtn = page.getByRole('button', { name: /agregar|invitar|nuevo/i }).filter({ visible: true }).first();
    await expect(addUserBtn).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T145] INST-004 - publicar una publicación a nombre de una institución', { tag: '@institution' }, async ({ page }) => {
    const feedPage = new FeedPage(page);
    const text = `Post automatizado a nombre de institución ${Date.now()}`;

    await feedPage.goto();
    await feedPage.publishAsInstitution(text, INSTITUTION_NAME_FOR_POST);

    await expect(page.getByText(text).first()).toBeVisible({ timeout: 20000 });
  });

  test('[IE-T146] INST-005 - seguir una institución sugerida desde el feed', { tag: '@institution' }, async ({ page }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Scope to the Instituciones sugeridas panel; the follow icon buttons live inside it
    const heading = page.getByText('Instituciones sugeridas', { exact: true }).filter({ visible: true }).first();
    await heading.waitFor({ state: 'visible', timeout: 15000 });

    const panel = heading.locator('xpath=ancestor::*[.//button][1]');
    // The follow icon-button uses an SVG (person+); pick the first non-follow button in the panel
    const followIconBtn = panel.locator('button').filter({ hasNot: page.getByText(/ver más|más/i) }).first();
    await followIconBtn.waitFor({ state: 'visible', timeout: 10000 });

    await followIconBtn.click();

    // Confirmation: either a toast "Seguido exitosamente" or the button's icon changes (aria-pressed / svg)
    const toast = page.getByText(/seguido exitosamente|seguid|success/i).filter({ visible: true }).first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Follow user', () => {
  test('[IE-T147] USR-001 - seguir a un usuario desde su perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoOtherProfile(FOLLOW_USER_HANDLE);

    const isAlreadyFollowing = await profilePage.followingButton.isVisible().catch(() => false);
    if (isAlreadyFollowing) {
      test.info().annotations.push({ type: 'note', description: 'usuario ya seguido, se saltea el toggle' });
      await expect(profilePage.followingButton).toBeVisible();
      return;
    }

    await expect(profilePage.followButton).toBeVisible({ timeout: 10000 });
    await profilePage.followButton.click();
    await expect(profilePage.followingButton).toBeVisible({ timeout: 10000 });
  });
});
