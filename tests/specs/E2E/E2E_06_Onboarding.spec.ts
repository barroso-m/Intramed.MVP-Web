import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { OnboardingPage, OnboardingPersonalData, OnboardingContactData, OnboardingProfessionalData } from '../../pages/Intramed/OnboardingPage-Intramed';
import { LoginPage } from '../../pages/Intramed/LoginPage-Intramed';
import { ConfigUserPage } from '../../pages/Intramed/ConfigUserPage-Intramed';
import { getOtpCode, buildOnboardingTestEmail } from '../../../utils/gmail-otp';

const PASSWORD = 'Conexa123!';
const PROTECTED_EMAILS = [process.env.TEST_EMAIL, process.env.CHAT_USER2_EMAIL].filter(Boolean);

const createdAccounts: { email: string; password: string }[] = [];

const onlyLettersAndAccents = (raw: string) =>
  raw.normalize('NFC').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').trim() || 'Test';

function buildPersonalData(overrides: Partial<OnboardingPersonalData> = {}): OnboardingPersonalData {
  return {
    title: 'Dr.',
    firstName: onlyLettersAndAccents(faker.person.firstName()),
    lastName: onlyLettersAndAccents(faker.person.lastName()),
    email: buildOnboardingTestEmail('onb'),
    docType: 'DNI',
    docNumber: faker.number.int({ min: 20000000, max: 45000000 }).toString(),
    birthdate: '1990-05-15',
    gender: 'Masculino',
    ...overrides,
  };
}

const CONTACT_DATA: OnboardingContactData = {
  country: 'Argentina',
  state: 'Buenos Aires',
  city: '25 de Mayo',
  phone: '1155555555',
};

const PROFESSIONAL_DATA: OnboardingProfessionalData = {
  occupation: 'Profesional de salud',
  career: 'Medicina',
  specialty: 'Cardiologia',
  subSpecialty: 'No tengo subespecialidad',
  licenceType: 'Matricula Nacional',
  licenceNumber: '123456',
  discoverySource: 'Articulo o contenido cientifico',
};

async function completeWizardThroughVerification(onboardingPage: OnboardingPage, page: import('@playwright/test').Page, personalData: OnboardingPersonalData) {
  await onboardingPage.goto();
  await onboardingPage.fillPersonalData(personalData);
  await onboardingPage.nextButton.click();

  await onboardingPage.fillPassword(PASSWORD);
  await onboardingPage.nextButton.click();

  const code = await getOtpCode(personalData.email);
  await onboardingPage.fillOtpCode(code);
  await expect(page.getByText('¡Su email ha sido verificado!')).toBeVisible({ timeout: 10000 });
}

test.describe('Onboarding', () => {
  test('[IE-T31] ONB-001 - Registro exitoso con opción Completar mi perfil', { tag: '@onboarding' }, async ({ page }) => {
    test.setTimeout(180_000);
    const onboardingPage = new OnboardingPage(page);
    const personalData = buildPersonalData();

    await completeWizardThroughVerification(onboardingPage, page, personalData);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillContactData(CONTACT_DATA);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillProfessionalData(PROFESSIONAL_DATA);
    await onboardingPage.nextButton.click();

    await expect(page.getByText('¡Tu cuenta fue creada con éxito!')).toBeVisible({ timeout: 15000 });
    createdAccounts.push({ email: personalData.email, password: PASSWORD });

    await onboardingPage.completeProfileButton.click();
    await expect(page).not.toHaveURL(/step=success/, { timeout: 15000 });
  });

  test('[IE-T32] ONB-002 - Registro exitoso con opción Omitir (ir al feed)', { tag: '@onboarding' }, async ({ page }) => {
    test.setTimeout(180_000);
    const onboardingPage = new OnboardingPage(page);
    const personalData = buildPersonalData();

    await completeWizardThroughVerification(onboardingPage, page, personalData);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillContactData(CONTACT_DATA);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillProfessionalData(PROFESSIONAL_DATA);
    await onboardingPage.nextButton.click();

    await expect(page.getByText('¡Tu cuenta fue creada con éxito!')).toBeVisible({ timeout: 15000 });
    createdAccounts.push({ email: personalData.email, password: PASSWORD });

    await onboardingPage.skipButton.click();
    await expect(page).toHaveURL(/\/feed/, { timeout: 20000 });
    await expect(page.getByText('0 Seguidores')).toBeVisible({ timeout: 10000 });
  });

  test('[IE-T33] ONB-003 - Registro fallido con email ya registrado', { tag: '@onboarding' }, async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    const personalData = buildPersonalData({ email: process.env.TEST_EMAIL! });

    await onboardingPage.goto();
    await onboardingPage.fillPersonalData(personalData);
    await onboardingPage.nextButton.click();

    await expect(page.getByRole('heading', { name: '¿Desea ingresar?' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/ya está registrado en IntraMed/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recuperar contraseña' })).toBeVisible();
    await expect(page.getByText('Crear cuenta')).toBeVisible();
  });

  test('[IE-T34] ONB-004 - Validación de email con formato inválido', { tag: '@onboarding' }, async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.goto();

    for (const invalidEmail of ['test@', 'test.com', '@dominio.com']) {
      await onboardingPage.emailInput.fill(invalidEmail);
      await onboardingPage.emailInput.press('Tab');
      await expect(onboardingPage.emailInput).toHaveJSProperty('validity.valid', false);
      await expect(onboardingPage.nextButton).toBeDisabled();
    }

    await onboardingPage.emailInput.fill('');
    await onboardingPage.emailInput.press('Tab');
    await expect(onboardingPage.nextButton).toBeDisabled();
  });

  test('[IE-T35] ONB-005 - Verificación fallida con código incorrecto', { tag: '@onboarding' }, async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    const personalData = buildPersonalData();

    await onboardingPage.goto();
    await onboardingPage.fillPersonalData(personalData);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillPassword(PASSWORD);
    await onboardingPage.nextButton.click();

    await onboardingPage.fillOtpCode('000000');
    await expect(page.getByText('¡Código incorrecto!')).toBeVisible({ timeout: 10000 });

    const code = await getOtpCode(personalData.email);
    await onboardingPage.fillOtpCode(code);
    await expect(page.getByText('¡Su email ha sido verificado!')).toBeVisible({ timeout: 10000 });
    await expect(onboardingPage.nextButton).toBeEnabled();
  });

  test('[IE-T36] ONB-006 - Validación de campos obligatorios por paso', { tag: '@onboarding' }, async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    const personalData = buildPersonalData();

    await onboardingPage.goto();
    await onboardingPage.firstNameInput.fill(personalData.firstName);
    await onboardingPage.lastNameInput.fill(personalData.lastName);
    await onboardingPage.emailInput.fill(personalData.email);
    await onboardingPage.selectOption(onboardingPage.docTypeCombobox, personalData.docType);
    await onboardingPage.docNumberInput.fill(personalData.docNumber);
    await onboardingPage.birthdateInput.fill(personalData.birthdate);
    await onboardingPage.selectOption(onboardingPage.genderCombobox, personalData.gender);
    await expect(onboardingPage.nextButton).toBeDisabled();

    await onboardingPage.selectOption(onboardingPage.titleCombobox, personalData.title);
    await expect(onboardingPage.nextButton).toBeEnabled();
    await onboardingPage.nextButton.click();

    await onboardingPage.passwordInput.fill(PASSWORD);
    await expect(onboardingPage.nextButton).toBeDisabled();
    await onboardingPage.passwordConfirmInput.fill(PASSWORD);
    await expect(onboardingPage.nextButton).toBeDisabled();
    await onboardingPage.termsCheckboxStep2.check();
    await expect(onboardingPage.nextButton).toBeEnabled();
    await onboardingPage.nextButton.click();

    const code = await getOtpCode(personalData.email);
    await onboardingPage.fillOtpCode(code);
    await expect(page.getByText('¡Su email ha sido verificado!')).toBeVisible({ timeout: 10000 });
    await onboardingPage.nextButton.click();

    await onboardingPage.fillContactData({ ...CONTACT_DATA, phone: '' });
    await expect(onboardingPage.nextButton).toBeDisabled();
    await onboardingPage.phoneInput.fill(CONTACT_DATA.phone);
    await expect(onboardingPage.nextButton).toBeEnabled();
    await onboardingPage.nextButton.click();

    await onboardingPage.selectOption(onboardingPage.occupationCombobox, PROFESSIONAL_DATA.occupation);
    await onboardingPage.selectOption(onboardingPage.careerCombobox, PROFESSIONAL_DATA.career);
    await expect(onboardingPage.nextButton).toBeDisabled();
    await expect(onboardingPage.specialtyCombobox).toBeVisible();
    await expect(onboardingPage.licenceTypeCombobox).toBeVisible();

    await onboardingPage.selectOption(onboardingPage.specialtyCombobox, PROFESSIONAL_DATA.specialty);
    await onboardingPage.selectOption(onboardingPage.subSpecialtyCombobox, PROFESSIONAL_DATA.subSpecialty);
    await onboardingPage.selectOption(onboardingPage.licenceTypeCombobox, PROFESSIONAL_DATA.licenceType);
    await onboardingPage.licenceNumberInput.fill(PROFESSIONAL_DATA.licenceNumber);
    await onboardingPage.selectOption(onboardingPage.discoverySourceCombobox, PROFESSIONAL_DATA.discoverySource);
    await expect(onboardingPage.nextButton).toBeDisabled();

    await onboardingPage.termsCheckboxStep5.check();
    await expect(onboardingPage.nextButton).toBeEnabled();
  });

  test('[ONB-007] TC07 - Eliminar cuentas de prueba creadas en la suite de Onboarding', { tag: '@onboarding' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const configPage = new ConfigUserPage(page);

    for (const account of createdAccounts) {
      if (PROTECTED_EMAILS.includes(account.email)) {
        throw new Error(`Intento de eliminar una cuenta protegida: ${account.email}`);
      }

      await loginPage.goto();
      await loginPage.login(account.email, account.password);
      await page.waitForURL('**/feed**', { timeout: 20000 });

      await configPage.goto();
      await configPage.openGestionDeCuenta();
      await configPage.deleteAccount();

      await loginPage.goto();
      await loginPage.login(account.email, account.password);
      await expect(page.getByText('El usuario/email y/o contraseña no son válidos.')).toBeVisible({ timeout: 10000 });
    }
  });
});
