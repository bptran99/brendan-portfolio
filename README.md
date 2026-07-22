# Brendan Tran Portfolio

A portfolio site built from the Sonic Archive design system, with a server-side Spotify listening status powered by a Vercel Function.

## Preview locally

The static pages can be previewed with a basic server, but the Spotify endpoint requires Vercel's local runtime:

```bash
vercel dev
```

The component makes one request to `/api/spotify` when the homepage loads. It does not poll or refresh again during that page visit.

## Spotify setup

The Spotify integration uses the Authorization Code flow for Brendan's account only. Visitors never authenticate, and all credentials remain server-side.

### 1. Create the Spotify app

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. In the app settings, add this redirect URI exactly:

   ```text
   http://127.0.0.1:8888/callback
   ```

   Spotify permits HTTP only for explicit loopback IP addresses and does not allow `localhost`. The authorization request and token exchange must use this exact same value.
3. Copy the app's Client ID and Client Secret.

### 2. Add local setup credentials

Create an uncommitted `.env.local` file containing:

```dotenv
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REFRESH_TOKEN=
```

The file is ignored by Git.

### 3. Authenticate Brendan's Spotify account

Run the local authorization helper from the portfolio directory:

```bash
node scripts/spotify-auth.mjs
```

Open the authorization URL printed in the terminal, sign in to Brendan's Spotify account, and approve the two read-only scopes. Spotify returns to the local helper, which verifies the OAuth state and exchanges the authorization code server-side. The browser receives only a success or error message; the refresh token is printed only in the terminal.

Spotify refresh tokens issued through the Developer Dashboard currently expire after six months, so repeat this flow when needed.

### 4. Add environment variables

Update the same uncommitted `.env.local` file with the refresh token printed by the helper:

```dotenv
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REFRESH_TOKEN=your-refresh-token
```

The file is ignored by Git. You can also use `vercel env pull .env.local` after linking the project.

For Vercel, open the project and go to **Settings → Environment Variables**. Add all three variables to Development, Preview, and Production as appropriate:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

Redeploy after adding or changing variables. Existing deployments do not receive updated environment values.

### Security and caching

- The client secret and refresh token are read only by server-side code and are never returned to the browser.
- The local OAuth helper verifies a cryptographically random state value, exchanges the authorization code server-side, and prints the refresh token only in the local terminal.
- The endpoint returns only the track title, artist names, album artwork URL, Spotify URL, and playback state.
- The endpoint keeps a short in-memory cache and sends short shared-cache headers so visitors arriving close together do not create redundant Spotify requests.
- Missing credentials, expired authorization, and Spotify outages return a safe empty state.

## Customize

- Replace the name, introduction, email address, and project copy in `index.html`.
- Point each `.project-link` to a case-study page when those pages are ready.
- Design tokens and responsive styles live at the top of `styles.css`.
- Hero and favicon assets live in `assets/`.
