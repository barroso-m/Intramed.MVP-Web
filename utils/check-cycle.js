const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const TOKEN = process.env.ZEPHYR_AUTH_TOKEN;
const PROJECT_KEY = process.env.ZEPHYR_PROJECT_KEY;
const BASE = 'https://prod-api.zephyr4jiracloud.com/v2';
const CYCLE_KEY = process.argv[2] || 'IE-R38';

async function listExecutions() {
  const all = [];
  let startAt = 0;
  const maxResults = 100;
  while (true) {
    const url = `${BASE}/testexecutions?projectKey=${PROJECT_KEY}&testCycle=${CYCLE_KEY}&startAt=${startAt}&maxResults=${maxResults}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) {
      console.error('HTTP', res.status, await res.text());
      process.exit(2);
    }
    const data = await res.json();
    all.push(...(data.values || []));
    if ((data.values || []).length < maxResults) break;
    startAt += maxResults;
  }
  return all;
}

async function getTestCaseByRef(ref) {
  const res = await fetch(ref, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) return null;
  return await res.json();
}

async function getStatusByRef(ref) {
  const res = await fetch(ref, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) return null;
  return await res.json();
}

(async () => {
  const execs = await listExecutions();
  console.log(`Executions in ${CYCLE_KEY}: ${execs.length}\n`);

  const rows = [];
  for (const e of execs) {
    let key = e.testCase?.key || null;
    let name = '?';
    if (e.testCase?.self) {
      const tc = await getTestCaseByRef(e.testCase.self);
      if (tc) { key = tc.key; name = tc.name; }
    }
    let status = '?';
    if (e.testExecutionStatus?.self) {
      const st = await getStatusByRef(e.testExecutionStatus.self);
      if (st) status = st.name;
    }
    rows.push({ key: key || '?', name, status });
  }

  rows.sort((a, b) => {
    const na = parseInt((a.key || '').replace(/[^0-9]/g, ''), 10) || 0;
    const nb = parseInt((b.key || '').replace(/[^0-9]/g, ''), 10) || 0;
    return na - nb;
  });

  for (const r of rows) console.log(`${r.key}\t${r.status}\t${r.name}`);
})().catch(e => { console.error(e); process.exit(3); });
