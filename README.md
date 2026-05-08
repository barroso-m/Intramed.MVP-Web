# Intramed Web Automation

Proyecto de automatización E2E con **Playwright** para la plataforma Intramed QA.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Cómo Ejecutar los Tests](#cómo-ejecutar-los-tests)
- [Reportes](#reportes)
- [Guías de Referencia](#guías-de-referencia)

---

## Descripción General

Este proyecto cubre:
- Automatización de pruebas **E2E** con Playwright
- Generación de datos dinámicos con **Faker**
- Gestión segura de credenciales con variables de entorno (`.env`)
- Integración con reportes HTML, Allure y JUnit
- Reporte de resultados a **Zephyr Scale**

---

## Estructura del Proyecto

```
Intramed.Web.Automation/
│
├── README.md
├── package.json
├── playwright.config.ts
├── .env                               # Variables de entorno (no versionado)
├── .gitignore
│
├── contextfiles/
│   └── Best-Practices.md              # Estándares, convenciones y mejores prácticas
│
├── tests/
│   ├── specs/
│   │   └── E2E/                       # Tests E2E (E2E_xx_descripcion.spec.ts)
│   │       ├── E2E_01_Login.spec.ts
│   │       ├── E2E_02_Feed.spec.ts
│   │       └── E2E_03_Profile.spec.ts
│   │
│   ├── pages/
│   │   └── Intramed/                  # Page Objects del proyecto
│   │       ├── LoginPage-Intramed.ts
│   │       ├── FeedPage-Intramed.ts
│   │       └── ProfilePage-Intramed.ts
│   │
│   ├── setup/
│   │   └── auth.setup.ts              # Setup de autenticación con storageState
│   │
│   └── data/
│       ├── dataModelsReference.md     # Guía para generar datos dinámicos
│       └── fakerExamplePage.ts        # Ejemplo de uso de Faker
│
├── utils/
│   ├── secureFill.ts                  # Función para rellenar campos sensibles
│   ├── zephyr-report.js               # Reporte de resultados a Zephyr (JUnit)
│   └── zephyr-bulk-upload.js          # Integración alternativa con Zephyr
│
├── allure-results/                    # Resultados raw de Allure (generados al correr tests)
├── allure-report/                     # Reporte HTML de Allure (generado con allure:generate)
├── playwright-report/                 # Reporte HTML de Playwright
└── test-results/                      # Resultados y artefactos de tests
```

---

## Instalación y Configuración

### Requisitos
- **Node.js** >= 16.x
- **npm** >= 8.x

### Paso 1: Instalar Dependencias

```bash
npm install
```

### Paso 2: Configurar Variables de Entorno

Crear un archivo `.env` en la raíz con los siguientes valores:

```env
# Intramed Credentials
TEST_EMAIL=tu-email@conexa.ai
TEST_PASSWORD=tu_contraseña
TEST_INVALID_EMAIL=usuario.invalido@test.com
TEST_INVALID_PASSWORD=claveInvalida123

# URLs
BASE_URL=https://intramed-front-qa.conexa.ai
LOGIN_URL=https://intramed-login-qa.conexa.ai/login

# Zephyr config
ZEPHYR_PROJECT_KEY=IE
ZEPHYR_AUTH_TOKEN=tu_token_zephyr
ZEPHYR_FOLDER_ID=tu_folder_id
```

**IMPORTANTE:** Nunca commitear `.env`. Está incluido en `.gitignore`.

### Paso 3: Instalar Navegadores (primera vez)

```bash
npx playwright install
```

---

## Cómo Ejecutar los Tests

```bash
# Todos los tests (headless)
npm test

# Modo debug
npm run test:debug

# Con navegador visible
npm run test:headed

# UI interactiva
npm run test:ui

# Solo Chrome
npm run test:chrome

# Tests específicos por módulo
npm run test:login
npm run test:feed
npm run test:profile
```

---

## Reportes

### Playwright HTML
```bash
npm run test:report
```

### Allure
```bash
# Solo generar
npm run allure:generate

# Solo abrir (requiere haber generado antes)
npm run allure:open

# Generar y abrir
npm run allure:report

# Correr tests y ver reporte Allure completo
npm run test:allure
```

### Zephyr Scale
```bash
npm run zephyr:report     # Sube resultados a Zephyr Scale
npm run test:zephyr       # Corre tests y sube a Zephyr
```

---

## Guías de Referencia

| Tema | Archivo |
|------|---------|
| Estándares y Convenciones | [Best-Practices.md](contextfiles/Best-Practices.md) |
| Generación de Datos | [tests/data/dataModelsReference.md](tests/data/dataModelsReference.md) |
| Ejemplo Faker | [tests/data/fakerExamplePage.ts](tests/data/fakerExamplePage.ts) |

### Convenciones clave

**Nomenclatura:**
- Tests E2E: `E2E_xx_{descripcion}.spec.ts`
- Page Objects: `{NombrePagina}Page-{Cliente}.ts`

**Seguridad:**
- Usar `process.env` para todos los datos sensibles
- Usar `secureFill()` de `utils/secureFill.ts` para campos de contraseña
- Nunca hardcodear credenciales, tokens ni URLs en el código fuente

**Estructura de tests:**
- Un `test.describe()` por funcionalidad
- Un `test()` por caso de prueba — sin tests que hagan múltiples flujos

---

## Flujo de Trabajo Git

1. Crear rama desde `main`: `git checkout -b feature/nombre-del-ticket`
2. Desarrollar e iterar localmente
3. Validar: `npm test` antes del push
4. Push: `git push origin feature/nombre-del-ticket`
5. Pull Request hacia `main` (requiere aprobación)
6. Merge solo tras validar tests en CI/CD

---

**Versión 1.0.0** | Última actualización: Mayo 2026
