const fs = require('fs');
const path = require('path');

const JUNIT_FILE = path.resolve(__dirname, '..', 'results', 'junit-results.xml');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const ZEPHYR_TOKEN = process.env.ZEPHYR_AUTH_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;

if (!ZEPHYR_TOKEN || !PROJECT_KEY) {
  console.error('Faltan variables de entorno: ZEPHYR_AUTH_TOKEN y/o ZEPHYR_PROJECT_KEY');
  process.exit(1);
}

function parseJunitResults(xmlContent) {
  const results = [];
  const testCaseRegex = /<testcase\s+([^>]*)>([\s\S]*?)<\/testcase>|<testcase\s+([^>]*)\/>/g;
  let match;

  while ((match = testCaseRegex.exec(xmlContent)) !== null) {
    const attrs = match[1] || match[3];
    const body = match[2] || '';

    const nameMatch = attrs.match(/name="([^"]*)"/);
    const timeMatch = attrs.match(/time="([^"]*)"/);

    if (!nameMatch) continue;

    const testName = nameMatch[1];
    const duration = timeMatch ? parseFloat(timeMatch[1]) * 1000 : 0;

    const keyMatch = testName.match(/\[([A-Z]+-T\d+)\]/);
    if (!keyMatch) continue;

    const zephyrKey = keyMatch[1];
    const hasFailed = body.includes('<failure');
    const hasSkipped = body.includes('<skipped');

    let status;
    if (hasSkipped) status = 'NOT EXECUTED';
    else if (hasFailed) status = 'FAIL';
    else status = 'PASS';

    results.push({ zephyrKey, testName, status, durationMs: Math.round(duration) });
  }

  return results;
}

async function createTestCycleAndExecutions(results) {
  const baseUrl = 'https://prod-api.zephyr4jiracloud.com/v2';
  const headers = {
    'Authorization': `Bearer ${ZEPHYR_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const now = new Date();
  const cycleName = `Playwright Run - ${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR')}`;

  console.log(`\nCreando ciclo de pruebas: "${cycleName}"`);
  console.log(`Tests encontrados: ${results.length}\n`);

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'NOT EXECUTED').length;

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`  ${icon} ${r.zephyrKey} - ${r.status} (${(r.durationMs / 1000).toFixed(1)}s)`);
  });

  console.log(`\nResumen: ${passed} pasados, ${failed} fallados, ${skipped} omitidos`);

  const automationUrl = `${baseUrl}/automations/executions/custom?projectKey=${PROJECT_KEY}&autoCreateTestCases=false`;
  const zephyrResults = {
    version: 1,
    executions: results.map(r => ({
      source: r.testName,
      testCase: { key: r.zephyrKey },
      result: r.status,
      executionTime: r.durationMs,
      comment: `Ejecución automatizada con Playwright - ${now.toISOString()}`,
    })),
  };

  try {
    const formData = new FormData();
    const resultsBlob = new Blob([JSON.stringify(zephyrResults)], { type: 'application/json' });
    formData.append('file', resultsBlob, 'playwright-results.json');

    const response = await fetch(automationUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ZEPHYR_TOKEN}` },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`\nResultados subidos exitosamente a Zephyr Essential!`);
      if (data.testCycle) console.log(`Ciclo de pruebas: ${data.testCycle.key}`);
      return;
    }

    const errorText = await response.text();
    console.log(`\nAPI de automación respondió con status ${response.status}: ${errorText}`);
    console.log('Intentando con endpoint alternativo...\n');
  } catch (err) {
    console.log(`Error con API de automación: ${err.message}`);
    console.log('Intentando con endpoint alternativo...\n');
  }

  try {
    const testCyclePayload = {
      projectKey: PROJECT_KEY,
      name: cycleName,
      description: `Ejecución automatizada de Playwright - ${now.toISOString()}`,
    };

    const cycleResponse = await fetch(`${baseUrl}/testcycles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testCyclePayload),
    });

    if (cycleResponse.ok) {
      const cycleData = await cycleResponse.json();
      const cycleKey = cycleData.key;
      console.log(`Ciclo creado: ${cycleKey}`);

      for (const result of results) {
        const executionPayload = {
          projectKey: PROJECT_KEY,
          testCaseKey: result.zephyrKey,
          testCycleKey: cycleKey,
          statusName: result.status,
          executionTime: result.durationMs,
          comment: `Ejecución automatizada - ${result.status} en ${(result.durationMs / 1000).toFixed(1)}s`,
        };

        const execResponse = await fetch(`${baseUrl}/testexecutions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(executionPayload),
        });

        const icon = execResponse.ok ? (result.status === 'PASS' ? '✅' : '❌') : '⚠️';
        const detail = execResponse.ok ? result.status : await execResponse.text();
        console.log(`  ${icon} ${result.zephyrKey}: ${detail}`);
      }

      console.log(`\nReporte de Zephyr completado!`);
    } else {
      const errText = await cycleResponse.text();
      console.error(`\nError al crear el ciclo de pruebas (${cycleResponse.status}): ${errText}`);
    }
  } catch (err) {
    console.error(`\nError de conexión: ${err.message}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Zephyr Essential - Reporte de Automatización');
  console.log('═══════════════════════════════════════════════════');

  if (!fs.existsSync(JUNIT_FILE)) {
    console.error(`\nNo se encontró el archivo de resultados: ${JUNIT_FILE}`);
    console.error('   Primero ejecuta los tests con: npm run test');
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(JUNIT_FILE, 'utf-8');
  const results = parseJunitResults(xmlContent);

  if (results.length === 0) {
    console.error('\nNo se encontraron test cases mapeados a Zephyr (con formato [XX-Tnn])');
    process.exit(1);
  }

  await createTestCycleAndExecutions(results);
}

main().catch(console.error);
