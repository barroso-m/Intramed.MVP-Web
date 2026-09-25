import { test, expect, Locator } from '@playwright/test';

export async function secureFill(locator: Locator, secretValue: string) {
  await test.step(`Fill ******`, async () => {
    // Reintentar si la app descarta el valor mientras hidrata. Se verifica que el
    // campo quedó no vacío en lugar de comparar contra el secreto, para no
    // filtrarlo en el mensaje de error de la assertion.
    await expect(async () => {
      await locator.fill(secretValue);
      await expect(locator).not.toHaveValue('', { timeout: 1000 });
    }).toPass({ timeout: 15000 });
  });
}
