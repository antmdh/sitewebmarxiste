const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface NewsletterRateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface NewsletterEnvironment {
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  GOOGLE_SHEET_ID?: string;
  GOOGLE_SHEET_RANGE?: string;
  NEWSLETTER_CONSENT_VERSION?: string;
  NEWSLETTER_HASH_SECRET?: string;
  NEWSLETTER_RATE_LIMITER?: NewsletterRateLimiter;
  TURNSTILE_SECRET_KEY?: string;
}

interface NewsletterSubscription {
  email: string;
  locale: string;
  submittedAt: string;
}

interface TurnstileResponse {
  action?: string;
  success?: boolean;
}

export type NewsletterStoreResult =
  { stored: true } | { stored: false; reason: 'not-configured' | 'provider-error' };

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(encoder.encode(value));
}

function pemToArrayBuffer(pem: string) {
  const normalized = pem
    .replaceAll('\\n', '\n')
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/gu, '');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function createServiceAccountAssertion(
  serviceAccountEmail: string,
  privateKey: string,
  now: number,
) {
  const issuedAt = Math.floor(now / 1_000);
  const header = textToBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = textToBase64Url(
    JSON.stringify({
      aud: GOOGLE_TOKEN_URL,
      exp: issuedAt + 3_600,
      iat: issuedAt,
      iss: serviceAccountEmail,
      scope: GOOGLE_SHEETS_SCOPE,
    }),
  );
  const unsignedToken = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(unsignedToken),
  );
  return `${unsignedToken}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

async function requestGoogleAccessToken(
  serviceAccountEmail: string,
  privateKey: string,
  fetcher: Fetcher,
) {
  const assertion = await createServiceAccountAssertion(
    serviceAccountEmail,
    privateKey,
    Date.now(),
  );
  const body = new URLSearchParams({
    assertion,
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  });
  const response = await fetcher(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error('Google OAuth token request failed');
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error('Google OAuth token is missing');
  return payload.access_token;
}

async function createSubscriberId(email: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(email));
  return `newsletter_${bytesToBase64Url(new Uint8Array(signature))}`;
}

export function normalizeNewsletterEmail(email: string) {
  return email.trim().normalize('NFKC').toLowerCase();
}

export async function verifyNewsletterTurnstile(
  token: string,
  secret: string,
  remoteIp?: string,
  fetcher: Fetcher = fetch,
) {
  if (!token || !secret) return false;
  try {
    const response = await fetcher(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        remoteip: remoteIp || undefined,
        response: token,
        secret,
      }),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResponse;
    return result.success === true && (!result.action || result.action === 'newsletter');
  } catch {
    return false;
  }
}

export async function storeNewsletterSubscription(
  subscription: NewsletterSubscription,
  env: NewsletterEnvironment,
  fetcher: Fetcher = fetch,
): Promise<NewsletterStoreResult> {
  const serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  const spreadsheetId = env.GOOGLE_SHEET_ID?.trim();
  const hashSecret = env.NEWSLETTER_HASH_SECRET?.trim();
  if (!serviceAccountEmail || !privateKey || !spreadsheetId || !hashSecret) {
    return { stored: false, reason: 'not-configured' };
  }

  try {
    const email = normalizeNewsletterEmail(subscription.email);
    const subscriberId = await createSubscriberId(email, hashSecret);
    const accessToken = await requestGoogleAccessToken(serviceAccountEmail, privateKey, fetcher);
    const range = env.GOOGLE_SHEET_RANGE?.trim() || 'subscriptions!A:G';
    const endpoint = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId,
      )}/values/${encodeURIComponent(range)}:append`,
    );
    endpoint.searchParams.set('includeValuesInResponse', 'false');
    endpoint.searchParams.set('insertDataOption', 'INSERT_ROWS');
    endpoint.searchParams.set('valueInputOption', 'RAW');

    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [
          [
            subscriberId,
            email,
            subscription.locale,
            subscription.submittedAt,
            env.NEWSLETTER_CONSENT_VERSION?.trim() || '2026-07-26',
            'website',
            'pending',
          ],
        ],
      }),
    });
    return response.ok ? { stored: true } : { stored: false, reason: 'provider-error' };
  } catch {
    return { stored: false, reason: 'provider-error' };
  }
}
