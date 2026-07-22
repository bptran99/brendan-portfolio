import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const HOST = '127.0.0.1';
const PORT = 8888;
const REDIRECT_URI = `http://${HOST}:${PORT}/callback`;
const SCOPES = 'user-read-currently-playing user-read-recently-played';
const BROWSER_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  'Content-Type': 'text/html; charset=utf-8',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function loadLocalEnvironment() {
  try {
    const file = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    file.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) return;
      process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    });
  } catch {
    // Environment variables may also be supplied directly by the shell.
  }
}

function browserPage(title, message, status = 200) {
  return {
    status,
    body: `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Brendan Tran</title><style>:root{color-scheme:light dark;font-family:Arial,sans-serif}body{display:grid;min-height:100vh;margin:0;place-items:center;background:Canvas;color:CanvasText}main{width:min(560px,calc(100% - 32px))}h1{font-size:clamp(40px,8vw,72px);line-height:.95;text-transform:uppercase}p{line-height:1.6}</style></head><body><main><h1>${title}</h1><p>${message}</p></main></body></html>`,
  };
}

loadLocalEnvironment();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local before continuing.');
  process.exit(1);
}

const state = randomBytes(32).toString('hex');
const authorizationUrl = new URL('https://accounts.spotify.com/authorize');
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
  state,
  show_dialog: 'true',
});

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, REDIRECT_URI);
  if (requestUrl.pathname !== '/callback') {
    response.writeHead(404).end('Not found');
    return;
  }

  const returnedState = requestUrl.searchParams.get('state');
  const code = requestUrl.searchParams.get('code');
  const authorizationError = requestUrl.searchParams.get('error');

  if (authorizationError || returnedState !== state || !code) {
    const page = browserPage('Authorization failed', 'Return to the terminal and run the setup again.', 400);
    response.writeHead(page.status, BROWSER_HEADERS).end(page.body);
    server.close();
    return;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.refresh_token) {
      throw new Error(tokenPayload.error_description || 'Spotify did not return a refresh token');
    }

    const page = browserPage('Spotify connected', 'Authentication is complete. Return to the terminal to finish setup.');
    response.writeHead(page.status, BROWSER_HEADERS).end(page.body);
    console.log('\nAdd this value to Vercel, then redeploy:\n');
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokenPayload.refresh_token}\n`);
  } catch (error) {
    const page = browserPage('Token exchange failed', 'Return to the terminal for details and try again.', 500);
    response.writeHead(page.status, BROWSER_HEADERS).end(page.body);
    console.error(`Spotify token exchange failed: ${error.message}`);
  } finally {
    server.close();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\nOpen this URL to authenticate Brendan's Spotify account:\n\n${authorizationUrl}\n`);
  console.log(`Waiting for Spotify at ${REDIRECT_URI} ...\n`);
});
