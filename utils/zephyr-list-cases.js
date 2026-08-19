const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TOKEN = process.env.ZEPHYR_AUTH_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;
const BASE = 'https://prod-api.zephyr4jiracloud.com/v2';

if (!TOKEN || !PROJECT_KEY) {
  console.error('Missing ZEPHYR_AUTH_TOKEN or ZEPHYR_PROJECT_KEY in .env');
  process.exit(1);
}

async function listAll() {
  const all = [];
  let startAt = 0;
  const maxResults = 100;
  while (true) {
    const url = `${BASE}/testcases?projectKey=${PROJECT_KEY}&startAt=${startAt}&maxResults=${maxResults}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) {
      console.error('HTTP', res.status, await res.text());
      process.exit(2);
    }
    const data = await res.json();
    all.push(...(data.values || []));
    if (!data.next || (data.values || []).length < maxResults) break;
    startAt += maxResults;
  }
  return all;
}

(async () => {
  const cases = await listAll();
  console.log(`Total test cases: ${cases.length}\n`);
  cases
    .sort((a, b) => {
      const na = parseInt((a.key || '').replace(/[^0-9]/g, ''), 10) || 0;
      const nb = parseInt((b.key || '').replace(/[^0-9]/g, ''), 10) || 0;
      return na - nb;
    })
    .forEach(tc => {
      const folder = tc.folder?.name || tc.folder?.id || '';
      console.log(`${tc.key}\t${tc.name}\t[${folder}]`);
    });
})().catch(err => {
  console.error(err);
  process.exit(3);
});
