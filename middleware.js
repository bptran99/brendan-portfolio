import { next } from '@vercel/functions';
import {
  CASE_STUDY_COOKIE,
  readCookie,
  verifySessionToken,
} from './lib/case-study-session.js';

const LOGIN_PATHS = new Set(['/work/login', '/work/login/index.html']);

export const config = {
  matcher: '/work/:path*',
};

export default async function protectCaseStudies(request) {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';

  if (LOGIN_PATHS.has(normalizedPath)) {
    return next();
  }

  const secret = process.env.CASE_STUDY_SESSION_SECRET;
  const token = readCookie(request.headers.get('cookie'), CASE_STUDY_COOKIE);

  if (secret && await verifySessionToken(token, secret)) {
    return next({
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const loginUrl = new URL('/work/login', request.url);
  loginUrl.searchParams.set('next', `${url.pathname}${url.search}`);

  return new Response(null, {
    status: 307,
    headers: {
      'Cache-Control': 'private, no-store',
      Location: loginUrl.toString(),
    },
  });
}
