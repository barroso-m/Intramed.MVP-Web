import { expect, Locator } from '@playwright/test';

/**
 * La app (Next.js) sirve el HTML del formulario antes de que React lo hidrate.
 * En esa ventana los campos ya son visibles y hasta aceptan texto, pero React
 * todavía no tomó el control, así que:
 *   - lo que se escriba se pierde cuando React re-renderiza con su estado vacío, y
 *   - el submit se procesa de forma nativa (GET con las credenciales en la query
 *     string) en lugar de llamar a la API de login.
 *
 * React marca los nodos que ya hidrató con propiedades internas `__reactProps$…`
 * / `__reactFiber$…`, así que esperamos a que aparezcan sobre el propio elemento
 * con el que vamos a interactuar. Esperar a `visible` o a `networkidle` no
 * alcanza: lo primero ocurre antes de la hidratación y lo segundo no la garantiza.
 */
export async function waitForHydration(target: Locator, timeout = 30000) {
  await expect
    .poll(
      () => target.evaluate(el => Object.keys(el).some(k => k.startsWith('__react'))).catch(() => false),
      { timeout, message: 'React nunca hidrató el formulario' }
    )
    .toBe(true);
}

/**
 * Rellena un campo y verifica que el valor haya quedado, reintentando si la app
 * lo descarta. Usar donde un valor perdido rompe el test en silencio.
 */
export async function fillStable(locator: Locator, value: string, timeout = 15000) {
  await expect(async () => {
    await locator.fill(value);
    await expect(locator).toHaveValue(value, { timeout: 1000 });
  }).toPass({ timeout });
}
