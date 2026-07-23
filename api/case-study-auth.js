import {
  CASE_STUDY_COOKIE,
  CASE_STUDY_SESSION_SECONDS,
  createSessionToken,
} from '../lib/case-study-session.js';

const ALLOWED_TARGETS = new Set([
  '/work/orange-rockland',
  '/work/orange-rockland/index.html',
  '/work/aca-group',
  '/work/aca-group/index.html',
  '/work/national-grid',
  '/work/national-grid/index.html',
  '/work/delta-dental-california',
  '/work/delta-dental-california/index.html',
]);

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...RESPONSE_HEADERS, ...extraHeaders },
  });
}

function normalizeTarget(target) {
  return typeof target === 'string' && ALLOWED_TARGETS.has(target)
    ? target
    : '/work/orange-rockland';
}

async function passwordMatches(suppliedPassword, expectedPassword) {
  const encoder = new TextEncoder();
  const [suppliedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(suppliedPassword)),
    crypto.subtle.digest('SHA-256', encoder.encode(expectedPassword)),
  ]);
  const suppliedBytes = new Uint8Array(suppliedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;

  for (let index = 0; index < suppliedBytes.length; index += 1) {
    difference |= suppliedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

async function caseStudyAuthHandler(request) {
  if (request.method !== 'POST') {
    return json({ ok: false, message: 'Method not allowed.' }, 405, { Allow: 'POST' });
  }

  const expectedPassword = process.env.CASE_STUDY_PASSWORD;
  const sessionSecret = process.env.CASE_STUDY_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    return json(
      { ok: false, message: 'Case-study access is not configured yet.' },
      503,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: 'Enter the shared password.' }, 400);
  }

  const suppliedPassword = typeof body?.password === 'string' ? body.password : '';
  const target = normalizeTarget(body?.next);

  if (!suppliedPassword || !await passwordMatches(suppliedPassword, expectedPassword)) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return json({ ok: false, message: 'That password is not correct.' }, 401);
  }

  const token = await createSessionToken(sessionSecret);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const cookie = [
    `${CASE_STUDY_COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${CASE_STUDY_SESSION_SECONDS}`,
  ].join('; ') + secure;

  return json(
    { ok: true, next: target },
    200,
    { 'Set-Cookie': cookie },
  );
}

export default { fetch: caseStudyAuthHandler };
