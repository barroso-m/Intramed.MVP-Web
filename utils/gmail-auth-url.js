const { google } = require('googleapis');
require('dotenv').config();

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  REDIRECT_URI
);

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/gmail.readonly'],
});

console.log('\nAbrí esta URL, logueate con automationintramed@gmail.com y aceptá los permisos:\n');
console.log(url);
console.log('\nDespués de aceptar vas a ver un error de conexión en localhost:3000 (es esperado).');
console.log('Copiá el valor de "code" de la barra de direcciones y corré:');
console.log('  node utils/gmail-get-refresh-token.js "<code>"\n');
