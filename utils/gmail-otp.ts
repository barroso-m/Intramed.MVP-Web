import { google, gmail_v1 } from 'googleapis';

const OTP_SENDER = 'info@intramed.net';
const CODE_REGEX = /c[oó]digo de verificaci[oó]n:[\s\S]{0,400}?(?<![#\d])(\d{6})(?!\d)/i;

function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

function extractBody(part: gmail_v1.Schema$MessagePart | undefined): string {
  if (!part) return '';
  if (part.body?.data) return Buffer.from(part.body.data, 'base64').toString('utf-8');
  if (part.parts) return part.parts.map(extractBody).join('\n');
  return '';
}

export interface GetOtpCodeOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
  sentAfter?: Date;
}

export async function getOtpCode(recipientEmail: string, options: GetOtpCodeOptions = {}): Promise<string> {
  const { timeoutMs = 60000, pollIntervalMs = 3000, sentAfter } = options;
  const gmail = getGmailClient();
  const deadline = Date.now() + timeoutMs;

  const afterQuery = sentAfter ? ` after:${Math.floor(sentAfter.getTime() / 1000)}` : '';
  const query = `to:${recipientEmail} from:${OTP_SENDER}${afterQuery}`;

  while (Date.now() < deadline) {
    const list = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 5 });

    for (const { id } of list.data.messages ?? []) {
      if (!id) continue;
      const message = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
      const match = extractBody(message.data.payload ?? undefined).match(CODE_REGEX);
      if (match) return match[1];
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`No se encontró el código OTP para ${recipientEmail} dentro de ${timeoutMs}ms`);
}

export function buildOnboardingTestEmail(label: string): string {
  const inbox = process.env.GMAIL_TEST_INBOX ?? 'automationintramed@gmail.com';
  const [user, domain] = inbox.split('@');
  return `${user}+${label}${Date.now()}@${domain}`;
}
