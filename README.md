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

   Spotify requires HTTPS except for explicit loopback IP addresses. Do not substitute `localhost`.
3. Copy the app's Client ID and Client Secret.

### 2. Authorize the account

Open the following URL after replacing `YOUR_CLIENT_ID`. The two scopes allow the server to read the active track and the most recently played track:

```text
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=user-read-currently-playing%20user-read-recently-played
```

Approve the app. The loopback page does not need to load successfully; copy the `code` value from the redirected browser URL. The code is short-lived and can be used only once.

### 3. Exchange the code for a refresh token

Set temporary shell variables, then exchange the code. The `redirect_uri` must exactly match the one used above.

```bash
export SPOTIFY_CLIENT_ID="your-client-id"
export SPOTIFY_CLIENT_SECRET="your-client-secret"
export SPOTIFY_REDIRECT_URI="http://127.0.0.1:8888/callback"

curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Authorization: Basic $(printf '%s:%s' "$SPOTIFY_CLIENT_ID" "$SPOTIFY_CLIENT_SECRET" | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=PASTE_THE_CODE_HERE" \
  --data-urlencode "redirect_uri=$SPOTIFY_REDIRECT_URI"
```

Copy the `refresh_token` from the JSON response. Spotify refresh tokens issued through the Developer Dashboard currently expire after six months, so repeat the authorization process when needed.

### 4. Add environment variables

Create an uncommitted `.env.local` file in the project root for local development:

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

- The client secret and refresh token are read only inside `api/spotify.js` and are never returned to the browser.
- The endpoint returns only the track title, artist names, album artwork URL, Spotify URL, and playback state.
- The endpoint keeps a short in-memory cache and sends short shared-cache headers so visitors arriving close together do not create redundant Spotify requests.
- Missing credentials, expired authorization, and Spotify outages return a safe empty state.

## Customize

- Replace the name, introduction, email address, and project copy in `index.html`.
- Point each `.project-link` to a case-study page when those pages are ready.
- Design tokens and responsive styles live at the top of `styles.css`.
- Hero and favicon assets live in `assets/`.
