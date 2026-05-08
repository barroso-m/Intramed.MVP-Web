import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CONFIG = {
  accessKey: process.env.ZEPHYR_ACCESS_KEY,
  authorization: process.env.ZEPHYR_AUTH_TOKEN,
  accountId: process.env.ZEPHYR_USER_ID,
  projectKey: process.env.ZEPHYR_PROJECT_KEY,
  projectId: process.env.ZEPHYR_PROJECT_ID,
  versionId: process.env.ZEPHYR_VERSION_ID || -1,
  folderId: process.env.ZEPHYR_FOLDER_ID,
  baseUrl: 'https://prod-api.zephyr4jiracloud.com/v2'
};

const REPORT_PATH = path.resolve(__dirname, '../results.xml');
if (!fs.existsSync(REPORT_PATH)) {
  console.error('❌ No se encontró results.xml. Ejecuta los tests primero.');
  process.exit(1);
}

async function main() {
  console.log('🚀 Iniciando proceso de reporte a Zephyr Squad...');

  try {
    const uploadPath = '/automations/executions/junit';
    const contentLength = fs.statSync(REPORT_PATH).size;
    const queryParams = `?projectKey=${CONFIG.projectKey}&autoCreateTestCases=false&content-length=${contentLength}`;
    const fullPath = `${uploadPath}${queryParams}`;

    const testCycleJson = {
      name: `Automated Run ${new Date().toISOString().split('T')[0]}`,
      description: "Subida automática desde Playwright",
      jiraProjectVersion: CONFIG.versionId,
      folderId: CONFIG.folderId,
      customFields: {}
    };

    const form = new FormData();
    form.append('file', fs.createReadStream(REPORT_PATH));
    form.append('testCycle', JSON.stringify(testCycleJson), {
      contentType: 'application/json'
    });

    const uploadRes = await axios.post(`${CONFIG.baseUrl}${fullPath}`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': CONFIG.authorization,
      }
    });

    console.log('🎉 ¡REPORTE EXITOSO!');
    console.log('📄 Respuesta de Zephyr:', uploadRes.data);

  } catch (error) {
    console.error('❌ Error en el proceso:', error.response?.status);
    console.error('Detalle:', JSON.stringify(error.response?.data, null, 2));

    if (error.response?.data?.errorCode === 104) {
      console.error('⚠️ PISTA: El error 104 suele indicar credenciales inválidas para escritura. Verifica tu Secret Key.');
    }
  }
}

main();