# Archivo de Buenas Prácticas (`BEST_PRACTICES.md`)

Este documento sirve como guía de estilo y normativa para mantener la calidad del código en el equipo.

# Estándares de Automatización y Buenas Prácticas

Este documento define las reglas para la creación, mantenimiento y ejecución de pruebas automatizadas en la integración Tiendanube-OCA.

## 1. Nomenclatura de Archivos

Es mandatorio seguir estrictamente las siguientes convenciones de nombres para mantener el orden en el repositorio:

### Archivos de Test (`/tests/test`)
Deben indicar claramente el tipo de prueba, un identificador numérico y una descripción breve.
* **API:** `API-xx_{descripcion}.spec.ts`
  * *Ejemplo:* `API-01_AuthToken.spec.ts`
* **E2E:** `E2E-xx_{descripcion}.spec.ts`
  * *Ejemplo:* `E2E-05_CheckoutEnvio.spec.ts`

### Page Objects (`/tests/pages`)
Deben indicar el nombre de la página y el cliente al que pertenecen (commerce o Shipper).
* **Formato:** `{NombrePagina}Page-{Cliente}.ts`
  * *Ejemplo:* `LoginPage-OCA.ts`
  * *Ejemplo:* `DashboardPage-Tiendanube.ts`

## 2. Estructura de los Casos de Prueba

Para facilitar la legibilidad y el reporte de errores, los pasos lógicos de un caso de prueba deben separarse en bloques `test` individuales dentro del archivo `.spec.ts`.

**Ejemplo Incorrecto:**
Un solo test gigante que hace Login, Busca Producto y Paga.

**Ejemplo Correcto:**
test.describe('Flujo de Compra Simple', () => {
    
    test('Paso 1: El usuario realiza el login en Tiendanube', async ({ page }) => {
        // Código del login
    });

    test('Paso 2: El usuario selecciona la integración de OCA', async ({ page }) => {
        // Código de selección
    });

    test('Paso 3: El usuario genera la etiqueta de envío', async ({ page }) => {
        // Código de generación
    });
});

## 3. Calidad de Código y Limpieza
Sin Comentarios: El código debe ser autodescriptivo. Las variables y funciones deben tener nombres claros que expliquen su propósito. No se permiten comentarios explicando "qué hace el código".

Código Sencillo: Evitar lógica compleja dentro de los tests. La lógica pesada debe ir a la carpeta /utils o encapsulada en los Page Objects.

## 4. Seguridad y Configuración
Cero Hardcoding: Está estrictamente prohibido incluir credenciales, tokens, contraseñas o URLs fijas dentro del código fuente.

Variables de Entorno: Todos los datos sensibles o configurables deben ser llamados desde process.env.

Bien: await page.secureFill('#password', process.env.OCA_PASSWORD);

Mal: await page.secureFill('#password', '123456');

## 5. Flujo de Trabajo (Git Workflow)
Branching: Nunca trabajar directamente sobre la rama main.

Creación de Rama: Crear una rama a partir de main con el formato feature/nombre-del-ticket.

Push: Crear la rama en el origen (remoto) antes de finalizar.

Merge: Una vez probada la integración localmente, crear un Pull Request (PR) hacia main. El merge solo se realiza tras la aprobación y validación de los tests.

### 6. Documentación
Cualquier documento funcional, planes de prueba (Test Plans) o diagramas técnicos deben alojarse únicamente en la carpeta /specs.