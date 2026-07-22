const CACHE_TTL_MS = 30_000;
const RESPONSE_HEADERS = {
  'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=60',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

let cachedPayload = null;
let cacheExpiresAt = 0;
let pendingPayload = null;

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...RESPONSE_HEADERS, ...extraHeaders },
  });
}

async function fetchWithTimeout(url, options = {}, timeout = 6_000) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(timeout) });
}

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetchWithTimeout('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) throw new Error(`Spotify token refresh failed: ${response.status}`);

  const payload = await response.json();
  if (!payload.access_token) throw new Error('Spotify token response did not include an access token');
  return payload.access_token;
}

function normalizeTrack(track, isPlaying) {
  if (!track?.name || !track?.external_urls?.spotify) return null;

  const images = track.album?.images || [];
  const artwork = images.length ? images[images.length - 1].url : null;

  return {
    title: track.name,
    artists: (track.artists || []).map((artist) => artist.name).filter(Boolean).join(', '),
    albumArtworkUrl: artwork,
    spotifyUrl: track.external_urls.spotify,
    isPlaying,
  };
}

async function getSpotifyTrack(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const currentResponse = await fetchWithTimeout(
    'https://api.spotify.com/v1/me/player/currently-playing',
    { headers },
  );

  if (currentResponse.status !== 204) {
    if (!currentResponse.ok) {
      throw new Error(`Spotify currently-playing request failed: ${currentResponse.status}`);
    }

    const current = await currentResponse.json();
    if (current.is_playing && current.currently_playing_type === 'track') {
      const playingTrack = normalizeTrack(current.item, true);
      if (playingTrack) return playingTrack;
    }
  }

  const recentResponse = await fetchWithTimeout(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    { headers },
  );

  if (!recentResponse.ok) {
    throw new Error(`Spotify recently-played request failed: ${recentResponse.status}`);
  }

  const recent = await recentResponse.json();
  return normalizeTrack(recent.items?.[0]?.track, false);
}

async function spotifyHandler(request) {
  if (request.method !== 'GET') {
    return jsonResponse({ track: null }, 405, { Allow: 'GET' });
  }

  if (cachedPayload && Date.now() < cacheExpiresAt) {
    return jsonResponse(cachedPayload);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return jsonResponse({ track: null });
  }

  try {
    if (!pendingPayload) {
      pendingPayload = (async () => {
        const accessToken = await refreshAccessToken(clientId, clientSecret, refreshToken);
        const track = await getSpotifyTrack(accessToken);
        return { track };
      })();
    }

    cachedPayload = await pendingPayload;
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return jsonResponse(cachedPayload);
  } catch (error) {
    console.error('Spotify listening status is unavailable:', error.message);
    cachedPayload = { track: null };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return jsonResponse(cachedPayload);
  } finally {
    pendingPayload = null;
  }
}

export default { fetch: spotifyHandler };
