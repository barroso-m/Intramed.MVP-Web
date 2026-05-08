import { test, Locator } from '@playwright/test';

export async function secureFill(locator: Locator, secretValue: string) {
  await test.step(`Fill ******`, async () => {
    await locator.fill(secretValue);
  });
}
