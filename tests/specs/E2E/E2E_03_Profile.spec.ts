import { test, expect } from '@playwright/test';
import { ProfilePage } from '../../pages/Intramed/ProfilePage-Intramed';

test.use({ storageState: 'playwright/.auth/auth.json' });

test.describe('Profile', () => {
  test('[IE-T20] TC04 - navegar al perfil del usuario desde el feed', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

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

    await profilePage.backButton.click();
    await expect(profilePage.descriptionEditButton).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T24] TC08 - agregar educación en el perfil', { tag: '@profile' }, async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.gotoViaFeed();

    await profilePage.editSectionButton.click();
    await profilePage.closeSubPanelButton.click();
    await profilePage.educacionTab.click();
    await profilePage.addEducacionButton.click();

    await profilePage.educacionDropdown.click();
    await page.getByRole('option', { name: 'Terciario' }).click();
    await profilePage.institucionInput.fill('UBA');
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

    await profilePage.editSectionButton.click();
    await profilePage.closeSubPanelButton.click();
    await profilePage.educacionTab.click();

    await page.getByText('Agubau S.R.L').click();
    await profilePage.deleteEducacionButton.click();
    await profilePage.confirmDeleteButton.click();

    await expect(page.getByText('Agubau S.R.L')).not.toBeVisible({ timeout: 10000 });
  });
});
