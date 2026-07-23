# Case Study Access

The case-study routes are protected by Vercel Routing Middleware and a shared
server-side password.

## Required environment variables

- `CASE_STUDY_PASSWORD`: the shared password visitors enter.
- `CASE_STUDY_SESSION_SECRET`: a long random value used only to sign access
  cookies. Use at least 32 random bytes.

Add both variables to the Vercel project for Production and Preview. Keep them
out of source control and browser JavaScript.

## Session behavior

- A successful password entry creates an `HttpOnly`, `Secure`, `SameSite=Lax`
  cookie.
- One successful entry unlocks all case-study pages in that browser.
- The cookie has a fixed seven-day lifetime. Visiting a case study does not
  extend it.
- The visitor must enter the password again after seven days, after clearing
  site cookies, in another browser/device, or in a new private-browsing session.
- Changing `CASE_STUDY_PASSWORD` affects new sign-ins but does not invalidate an
  existing signed cookie. Rotate `CASE_STUDY_SESSION_SECRET` to invalidate every
  active session immediately.

## Security notes

The password and signing secret are never included in HTML or browser
JavaScript. Middleware validates the signed cookie before Vercel serves a case
study, and protected responses are marked private and non-cacheable.

This is shared-password access, not per-person identity or authorization. Anyone
who knows the password can share it. If the repository is public, committed case
study content can also be read through the repository even though the deployed
routes are protected. Sensitive client material should live in a private
repository or private server-side content store.
