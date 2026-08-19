const { google } = require('googleapis');
require('dotenv').config();

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error('Uso: node utils/gmail-get-refresh-token.js "<code>"');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.error('\nGoogle no devolvió un refresh_token.');
    console.error('Revocá el acceso en https://myaccount.google.com/permissions y repetí desde gmail-auth-url.js\n');
    process.exit(1);
  }

  console.log('\nRefresh token obtenido. Agregalo al .env como GMAIL_REFRESH_TOKEN:\n');
  console.log(tokens.refresh_token);
  console.log('');
}

main().catch(err => {
  console.error('\nError al intercambiar el code por el token:', err.message);
  console.error('Si el error es "invalid_grant", el code expiró (~1 min) - repetí desde gmail-auth-url.js\n');
  process.exit(1);
});
