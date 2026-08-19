import { Page, Locator } from '@playwright/test';
import { secureFill } from '../../../utils/secureFill';

const SIGNUP_URL = process.env.SIGNUP_URL ?? 'https://intramed-login-qa.conexa.ai/signup';

export interface OnboardingPersonalData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  docType: string;
  docNumber: string;
  birthdate: string;
  gender: string;
}

export interface OnboardingContactData {
  country: string;
  state: string;
  city: string;
  phone: string;
}

export interface OnboardingProfessionalData {
  occupation: string;
  career: string;
  specialty: string;
  subSpecialty: string;
  licenceType: string;
  licenceNumber: string;
  discoverySource: string;
}

export class OnboardingPage {
  readonly titleCombobox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly docTypeCombobox: Locator;
  readonly docNumberInput: Locator;
  readonly birthdateInput: Locator;
  readonly genderCombobox: Locator;

  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly termsCheckboxStep2: Locator;

  readonly otpInputs: Locator;
  readonly resendEmailButton: Locator;

  readonly countryCombobox: Locator;
  readonly stateCombobox: Locator;
  readonly cityCombobox: Locator;
  readonly phoneInput: Locator;

  readonly occupationCombobox: Locator;
  readonly careerCombobox: Locator;
  readonly specialtyCombobox: Locator;
  readonly subSpecialtyCombobox: Locator;
  readonly licenceTypeCombobox: Locator;
  readonly licenceNumberInput: Locator;
  readonly discoverySourceCombobox: Locator;
  readonly termsCheckboxStep5: Locator;

  readonly nextButton: Locator;
  readonly backButton: Locator;

  readonly completeProfileButton: Locator;
  readonly skipButton: Locator;

  constructor(private readonly page: Page) {
    this.titleCombobox = page.locator('#titleCode');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.docTypeCombobox = page.locator('#docTypeCode');
    this.docNumberInput = page.locator('input[name="docNumber"]');
    this.birthdateInput = page.locator('input[name="birthdate"]');
    this.genderCombobox = page.locator('#gender');

    this.passwordInput = page.locator('input[name="password"]');
    this.passwordConfirmInput = page.locator('input[name="passwordConfirm"]');
    this.termsCheckboxStep2 = page.locator('input[name="termsAndConditions"]');

    this.otpInputs = page.locator('input[maxlength="1"]');
    this.resendEmailButton = page.getByRole('button', { name: 'Reenviar email' });

    this.countryCombobox = page.locator('#countryCode');
    this.stateCombobox = page.locator('#stateCode');
    this.cityCombobox = page.locator('#cityCode');
    this.phoneInput = page.locator('input[name="phone"]');

    this.occupationCombobox = page.locator('#occupationCode');
    this.careerCombobox = page.locator('#studyCode');
    this.specialtyCombobox = page.locator('#specialtyCodes');
    this.subSpecialtyCombobox = page.locator('#subSpecialtyCode');
    this.licenceTypeCombobox = page.locator('#licenceTypeCode');
    this.licenceNumberInput = page.getByPlaceholder('Número');
    this.discoverySourceCombobox = page.locator('#discoverySourceCode');
    this.termsCheckboxStep5 = page.locator('input[name="termsAndCondictions"]');

    this.nextButton = page.getByRole('button', { name: 'Siguiente', exact: true });
    this.backButton = page.getByRole('button', { name: /^(Atrás|Volver)$/ });

    this.completeProfileButton = page.getByRole('button', { name: 'Completar mi perfil' });
    this.skipButton = page.getByRole('button', { name: 'Omitir' });
  }

  async goto() {
    await this.page.goto(SIGNUP_URL, { waitUntil: 'domcontentloaded' });
  }

  async selectOption(combobox: Locator, text: string) {
    await combobox.click();
    await combobox.pressSequentially(text, { delay: 30 });
    const option = this.page.getByRole('option').first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  async fillPersonalData(data: OnboardingPersonalData) {
    await this.selectOption(this.titleCombobox, data.title);
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.selectOption(this.docTypeCombobox, data.docType);
    await this.docNumberInput.fill(data.docNumber);
    await this.birthdateInput.fill(data.birthdate);
    await this.selectOption(this.genderCombobox, data.gender);
  }

  async fillPassword(password: string) {
    await secureFill(this.passwordInput, password);
    await secureFill(this.passwordConfirmInput, password);
    await this.termsCheckboxStep2.check();
  }

  async fillOtpCode(code: string) {
    const digits = code.split('');
    for (let i = 0; i < digits.length; i++) {
      await this.otpInputs.nth(i).pressSequentially(digits[i]);
    }
    await this.page.waitForTimeout(500);
  }

  async fillContactData(data: OnboardingContactData) {
    await this.selectOption(this.countryCombobox, data.country);
    await this.selectOption(this.stateCombobox, data.state);
    await this.selectOption(this.cityCombobox, data.city);
    await this.phoneInput.fill(data.phone);
  }

  async fillProfessionalData(data: OnboardingProfessionalData) {
    await this.selectOption(this.occupationCombobox, data.occupation);
    await this.selectOption(this.careerCombobox, data.career);
    await this.selectOption(this.specialtyCombobox, data.specialty);
    await this.selectOption(this.subSpecialtyCombobox, data.subSpecialty);
    await this.selectOption(this.licenceTypeCombobox, data.licenceType);
    await this.licenceNumberInput.fill(data.licenceNumber);
    await this.selectOption(this.discoverySourceCombobox, data.discoverySource);
    await this.termsCheckboxStep5.check();
  }
}
