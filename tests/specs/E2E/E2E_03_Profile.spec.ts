import { test, expect } from '@playwright/test';
import { ProfilePage } from '../../pages/Intramed/ProfilePage-Intramed';
import { ConfigUserPage } from '../../pages/Intramed/ConfigUserPage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

test.describe('Profile', () => {
  test('[IE-T20] TC04 - navegar al perfil del usuario desde el feed', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await expect(page).toHaveURL(/\/profile\//);
    await expect(profilePage.descriptionEditButton).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T21] TC05 - editar descripción del perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.descriptionEditButton.click();
    await profilePage.descriptionInput.fill(`Descripcion automatizada 🤖`);
    await profilePage.saveChangesButton.click();

    await expect(page.getByText('Cambios guardados')).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T22] TC06 - validar error al ingresar letras en el campo teléfono', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.openUserEditModal();
    await profilePage.phoneInput.fill('idrandom');
    await profilePage.saveChangesButton.click();

    await expect(page.getByText('Invalid phone number')).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T23] TC07 - actualizar teléfono con número válido y volver al perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.openUserEditModal();
    const phone = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    await profilePage.phoneInput.fill(phone);
    await profilePage.saveChangesButton.click();

    await expect(page.getByText('Datos guardados correctamente')).toBeVisible({ timeout: 10000 });

    await profilePage.returnToProfile();
    await expect(page).toHaveURL(/\/profile\//);
    await expect(profilePage.descriptionEditButton).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T24] TC08 - agregar educación en el perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.addEducacionButton.click();

    await profilePage.educacionDropdown.click();
    await page.getByRole('option', { name: 'Terciario' }).click();
    await profilePage.institucionInput.fill('UBA');
    await page.getByText('Agubau S.R.L').waitFor({ state: 'visible', timeout: 20000 });
    await page.getByText('Agubau S.R.L').click();
    await profilePage.titleInput.fill('automation title');
    await profilePage.educacionDescriptionInput.fill('test');
    await profilePage.startDateInput.fill('2026-05-07');
    await profilePage.currentlyStudyingCheckbox.check();
    await profilePage.addButton.click();

    await expect(page.getByText('Educación creado con éxito')).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T25] TC09 - eliminar educación en el perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await page.getByText('Agubau S.R.L').first().waitFor({ state: 'visible', timeout: 20000 });
    await page.getByText('Agubau S.R.L').first().click();
    await profilePage.deleteEducacionButton.click();
    await profilePage.confirmDeleteButton.click();

    await expect(page.getByText('Agubau S.R.L')).not.toBeVisible({ timeout: 10000 });
  });

  test('[IE-T26] PRF-009 - cancelar edición de Sobre mí no persiste cambios', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);
    const unsavedText = `Texto que NO debe persistir ${Date.now()}`;

    await profilePage.gotoViaFeed();

    await profilePage.descriptionEditButton.click();
    await profilePage.descriptionInput.fill(unsavedText);
    await profilePage.cancelButton.click();

    await expect(profilePage.descriptionInput).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(unsavedText)).not.toBeVisible();
  });

  test('[IE-T27] PRF-008 - validaciones del modal Agregar educación', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();
    await profilePage.addEducacionButton.click();

    await expect(profilePage.modalHeadingAgregarEducacion).toBeVisible({ timeout: 10000 });
    await expect(profilePage.addButton).toBeDisabled();

    await profilePage.titleInput.fill('Solo título');
    await expect(profilePage.addButton).toBeDisabled();

    const longText = 'x'.repeat(250);
    await profilePage.educacionDescriptionInput.fill(longText);
    const enteredValue = await profilePage.educacionDescriptionInput.inputValue();
    expect(enteredValue.length).toBeLessThanOrEqual(180);

    await profilePage.currentlyStudyingCheckbox.check();
    await expect(profilePage.currentlyStudyingCheckbox).toBeChecked();

    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await expect(profilePage.modalHeadingAgregarEducacion).not.toBeVisible({ timeout: 5000 });
  });

  test('[IE-T28] PRF-005 - editar datos personales desde configuración', { tag: '@profile' }, async ({ page }) => {
    const configPage = new ConfigUserPage(page);

    await configPage.goto();
    await configPage.openDatosPersonales();

    const originalName = await configPage.firstNameInput.inputValue();
    const newFirstName = `Tincho${Date.now().toString().slice(-4)}`;

    await expect(configPage.saveChangesButton).toBeDisabled();

    await configPage.firstNameInput.fill(newFirstName);
    await expect(configPage.saveChangesButton).toBeEnabled();

    await configPage.saveChangesButton.click();
    await page.waitForLoadState('networkidle');

    await expect(configPage.firstNameInput).toHaveValue(newFirstName);

    await configPage.firstNameInput.fill(originalName);
    if (await configPage.saveChangesButton.isEnabled()) {
      await configPage.saveChangesButton.click();
    }
  });

  test('[IE-T29] PRF-006 - toggle switches de Newsletter y Preferencias', { tag: '@profile' }, async ({ page }) => {
    const configPage = new ConfigUserPage(page);

    await configPage.goto();
    await configPage.openNewsletter();

    const originalState = await configPage.newsletterCheckbox.isChecked();
    const flipped = !originalState;

    await configPage.setNewsletter(flipped);
    await expect(configPage.newsletterCheckbox).toBeChecked({ checked: flipped });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await configPage.openNewsletter();
    await expect(configPage.newsletterCheckbox).toBeChecked({ checked: flipped });

    await configPage.setNewsletter(originalState);
    await expect(configPage.newsletterCheckbox).toBeChecked({ checked: originalState });
    await page.waitForLoadState('networkidle');
  });

  test('[IE-T30] PRF-004 - ver más actividad y filtrar', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();
    await profilePage.activityMoreButton.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/profile\/[^/]+\/activity/);

    for (const filterName of ['Reposteos', 'Guardados', 'Reacciones', 'Comentarios', 'Publicaciones']) {
      const btn = profilePage.activityFilter(filterName);
      await expect(btn).toBeVisible({ timeout: 5000 });
      await btn.click();
      await page.waitForTimeout(400);
    }
  });

  test('[IE-T31] PRF-003 - abrir modal Agregar sección', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.addSectionButton.click();
    await expect(profilePage.addSectionModalHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('[IE-T32] PRF-010 - abrir Datos profesionales con Guardar cambios deshabilitado', { tag: '@profile' }, async ({ page }) => {
    const configPage = new ConfigUserPage(page);

    await configPage.goto();
    await configPage.openDatosProfesionales();

    await expect(page.locator('input#occupationCode')).toBeVisible();
    await expect(page.locator('input#studyCode')).toBeVisible();
    await expect(configPage.saveChangesButton).toBeDisabled();
  });

  test('[IE-T33] PRF-007 - toggle un switch de Notificaciones y persistir', { tag: '@profile' }, async ({ page }) => {
    const configPage = new ConfigUserPage(page);

    await configPage.goto();
    await configPage.openNotifications();

    const firstWebSwitch = configPage.firstWebNotificationSwitch;
    const original = await firstWebSwitch.isChecked();

    await configPage.setFirstWebNotification(!original);
    await expect(firstWebSwitch).toBeChecked({ checked: !original });
    await page.waitForTimeout(1500);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await configPage.openNotifications();
    await expect(firstWebSwitch).toBeChecked({ checked: !original });

    await configPage.setFirstWebNotification(original);
    await expect(firstWebSwitch).toBeChecked({ checked: original });
    await page.waitForTimeout(1500);
  });
});
