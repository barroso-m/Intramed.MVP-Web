# Generación de datos de prueba en `tests/data`

Este documento explica cómo generar data dinámica con la librería `@faker-js/faker` y cómo cargar archivos de datos en distintos formatos (`.csv`, `.json`, `.yaml`, etc.) en tu automatización.

## 1. Generar data con faker (TypeScript)

### 1.1 Instalación

```bash
npm install @faker-js/faker --save-dev
```

### 1.2 Ejemplo básico de uso

```ts
import { faker } from '@faker-js/faker';

export interface User { 
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
}

export function createRandomUser(): User {
  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`
  };
}

// Uso:
const user = createRandomUser();
console.log(user);
```

### 1.3 Generar lista de datos

```ts
export function createRandomUsers(count: number): User[] {
  return Array.from({ length: count }, () => createRandomUser());
}

// Uso:
const users = createRandomUsers(10);
console.log(users);
```

## 2. Leer datos de archivo CSV

### 2.1 Dependencia recomendada

```bash
npm install csv-parse fs --save-dev
```

### 2.2 Ejemplo de archivo `tests/data/users.csv`

```csv
id,firstName,lastName,email,age
1,Lucia,Martinez,lucia.martinez@email.com,29
2,Martin,Rodriguez,martin.rodriguez@email.com,35
```

### 2.3 Leer CSV en TypeScript

```ts
import fs from 'fs';
import parse from 'csv-parse/lib/sync';

const csvData = fs.readFileSync('tests/data/users.csv', 'utf8');
const records = parse(csvData, { columns: true, skip_empty_lines: true });
console.log(records);
```

## 3. Leer datos de archivo JSON

### 3.1 Ejemplo de archivo `tests/data/users.json`

```json
[
  { "id": "1", "firstName": "Lucia", "lastName": "Martinez", "email": "lucia.martinez@email.com", "age": 29 },
  { "id": "2", "firstName": "Martin", "lastName": "Rodriguez", "email": "martin.rodriguez@email.com", "age": 35 }
]
```

### 3.2 Leer JSON en TypeScript

```ts
import fs from 'fs';

const jsonData = fs.readFileSync('tests/data/users.json', 'utf8');
const users = JSON.parse(jsonData);
console.log(users);
```

## 4. Leer datos de archivo YAML

### 4.1 Dependencia recomendada

```bash
npm install js-yaml --save-dev
```

### 4.2 Ejemplo de archivo `tests/data/users.yaml`

```yaml
- id: 1
  firstName: Lucia
  lastName: Martinez
  email: lucia.martinez@email.com
  age: 29
- id: 2
  firstName: Martin
  lastName: Rodriguez
  email: martin.rodriguez@email.com
  age: 35
```

### 4.3 Leer YAML en TypeScript

```ts
import fs from 'fs';
import yaml from 'js-yaml';

const yamlData = fs.readFileSync('tests/data/users.yaml', 'utf8');
const users = yaml.load(yamlData);
console.log(users);
```

## 5. Mezclar datos faker con archivos estáticos

- Usa `faker` para generación random cuando necesites pruebas con datos frescos.
- Carga JSON/CSV/YAML para pruebas de borde o con datos de referencia.
- Combina ambos para test cases más robustos.

## 6. Buenas prácticas

- Mantén plantillas de datos (`.json`, `.csv`, `.yaml`) en `tests/data`.
- Evita hardcodear datos en pruebas; usa fachadas o factories.
- Versiona archivos de datos de ejemplo en repositorio y no datos sensibles reales.