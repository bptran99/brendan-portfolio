export const CASE_STUDY_COOKIE = 'case_study_session';
export const CASE_STUDY_SESSION_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function readCookie(cookieHeader, name) {
  if (!cookieHeader) return '';

  const prefix = `${name}=`;
  const entry = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
}

export async function createSessionToken(secret, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + CASE_STUDY_SESSION_SECONDS;
  const signature = await sign(String(expiresAt), secret);
  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(token, secret, now = Date.now()) {
  if (!token || !secret) return false;

  const [expiresAtValue, suppliedSignature, extra] = token.split('.');
  const expiresAt = Number(expiresAtValue);
  if (extra || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) {
    return false;
  }

  const expectedSignature = await sign(expiresAtValue, secret);
  return constantTimeEqual(suppliedSignature || '', expectedSignature);
}
