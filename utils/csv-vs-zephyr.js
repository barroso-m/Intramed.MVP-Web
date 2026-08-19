const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TOKEN = process.env.ZEPHYR_AUTH_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;
const BASE = 'https://prod-api.zephyr4jiracloud.com/v2';

const CSV_DIR = 'C:\\Users\\marti\\OneDrive\\Desktop\\Automation\\Zephyr web intra';
const WEB_FOLDER_ID = 42071331;

function parseCsvNames(file) {
  const raw = fs.readFileSync(file, 'utf-8');
  const rows = raw.split(/\r?\n/);
  const names = [];
  for (const row of rows) {
    const m = row.match(/^([A-Z]+-\d+)\s*-\s*([^,]+)/);
    if (m) names.push({ code: m[1], name: `${m[1]} - ${m[2].trim()}` });
  }
  return names;
}

async function listAllZephyr() {
  const all = [];
  let startAt = 0;
  const maxResults = 100;
  while (true) {
    const url = `${BASE}/testcases?projectKey=${PROJECT_KEY}&startAt=${startAt}&maxResults=${maxResults}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    all.push(...(data.values || []));
    if ((data.values || []).length < maxResults) break;
    startAt += maxResults;
  }
  return all;
}

function extractCode(name) {
  const m = name.match(/^([A-Z]+-?\d+)/);
  return m ? m[1] : null;
}

(async () => {
  const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
  const csvByFile = {};
  const allCsvCodes = new Set();
  const csvCodeToName = {};
  for (const f of files) {
    const items = parseCsvNames(path.join(CSV_DIR, f));
    csvByFile[f] = items;
    items.forEach(i => {
      allCsvCodes.add(i.code);
      csvCodeToName[i.code] = i.name;
    });
  }

  const zephyr = await listAllZephyr();
  const webCases = zephyr.filter(tc => {
    const fid = tc.folder?.id ?? tc.folder;
    return fid == WEB_FOLDER_ID;
  });

  const zephyrCodeToCase = {};
  webCases.forEach(tc => {
    const code = extractCode(tc.name);
    if (code) zephyrCodeToCase[code] = { key: tc.key, name: tc.name };
  });

  console.log('=== CSV files parsed ===');
  for (const f of files) {
    console.log(`  ${f}: ${csvByFile[f].length} casos`);
  }
  console.log(`  TOTAL únicos en CSVs: ${allCsvCodes.size}`);
  console.log(`  TOTAL Web en Zephyr (folder ${WEB_FOLDER_ID}): ${webCases.length}\n`);

  const inCsvNotInZephyr = [...allCsvCodes].filter(c => !zephyrCodeToCase[c]).sort();
  const inZephyrNotInCsv = Object.keys(zephyrCodeToCase).filter(c => !allCsvCodes.has(c)).sort();

  console.log('=== En CSVs pero NO en Zephyr Web (faltan subir) ===');
  if (inCsvNotInZephyr.length === 0) console.log('  (ninguno)');
  else inCsvNotInZephyr.forEach(c => console.log(`  ${c} - ${csvCodeToName[c]}`));

  console.log('\n=== En Zephyr Web pero NO en CSVs (posiblemente viejos / a limpiar) ===');
  if (inZephyrNotInCsv.length === 0) console.log('  (ninguno)');
  else inZephyrNotInCsv.forEach(c => {
    const tc = zephyrCodeToCase[c];
    console.log(`  ${tc.key} - ${tc.name}`);
  });

  console.log('\n=== Discrepancias de nombre (mismo código, nombre distinto) ===');
  let mismatches = 0;
  [...allCsvCodes].sort().forEach(c => {
    if (zephyrCodeToCase[c] && csvCodeToName[c] !== zephyrCodeToCase[c].name) {
      const zn = zephyrCodeToCase[c].name;
      const cn = csvCodeToName[c];
      if (zn.toLowerCase() !== cn.toLowerCase()) {
        console.log(`  ${c}:`);
        console.log(`    CSV:    ${cn}`);
        console.log(`    Zephyr: ${zn} (${zephyrCodeToCase[c].key})`);
        mismatches++;
      }
    }
  });
  if (mismatches === 0) console.log('  (ninguna)');
})().catch(err => { console.error(err); process.exit(1); });
