const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const themeToggle = document.querySelector('.theme-toggle');
const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (window.location.protocol === 'file:') {
  document.querySelectorAll('[data-local-href]').forEach((link) => {
    link.setAttribute('href', link.dataset.localHref);
  });
}

const spotifyListening = document.querySelector('[data-spotify-listening]');

function showSpotifyEmpty(message) {
  if (!spotifyListening) return;

  spotifyListening.querySelector('[data-spotify-label]').hidden = true;
  spotifyListening.querySelector('[data-spotify-loading]').hidden = true;
  spotifyListening.querySelector('[data-spotify-track]').hidden = true;
  spotifyListening.querySelector('[data-spotify-indicator]').hidden = true;
  spotifyListening.querySelector('[data-spotify-album]').hidden = true;

  const emptyState = spotifyListening.querySelector('[data-spotify-empty]');
  emptyState.textContent = message;
  emptyState.hidden = false;
  spotifyListening.setAttribute('aria-busy', 'false');
}

function showSpotifyTrack(track) {
  if (!spotifyListening) return;

  const label = spotifyListening.querySelector('[data-spotify-label]');
  const trackLink = spotifyListening.querySelector('[data-spotify-track]');
  const album = spotifyListening.querySelector('[data-spotify-album]');
  const indicator = spotifyListening.querySelector('[data-spotify-indicator]');

  label.textContent = track.isPlaying
    ? 'Brendan is listening to:'
    : 'Brendan last listened to:';
  spotifyListening.querySelector('[data-spotify-title]').textContent = track.title;
  spotifyListening.querySelector('[data-spotify-artists]').textContent = track.artists;
  spotifyListening.querySelector('[data-spotify-loading]').hidden = true;
  spotifyListening.querySelector('[data-spotify-empty]').hidden = true;

  trackLink.href = track.spotifyUrl;
  trackLink.setAttribute('aria-label', `Open ${track.title} by ${track.artists} on Spotify`);
  trackLink.hidden = false;
  indicator.hidden = !track.isPlaying;

  if (track.albumArtworkUrl) {
    album.src = track.albumArtworkUrl;
    album.alt = `Album artwork for ${track.title} by ${track.artists}`;
    album.hidden = false;
  } else {
    album.hidden = true;
  }

  spotifyListening.setAttribute('aria-busy', 'false');
}

async function loadSpotifyOnce() {
  if (!spotifyListening) return;

  try {
    const response = await fetch('/api/spotify', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error(`Spotify endpoint returned ${response.status}`);

    const payload = await response.json();
    if (payload.track) {
      showSpotifyTrack(payload.track);
    } else {
      showSpotifyEmpty('Spotify listening activity is unavailable right now.');
    }
  } catch {
    showSpotifyEmpty('Unable to load Spotify listening activity.');
  }
}

spotifyListening?.querySelector('[data-spotify-album]')?.addEventListener('error', (event) => {
  event.currentTarget.hidden = true;
}, { once: true });

loadSpotifyOnce();

let vhsPlaybackRate = 1;
let vhsRateFrame;

function parseTime(value, fallback = 800) {
  const time = value.trim();
  if (time.endsWith('ms')) return Number.parseFloat(time);
  if (time.endsWith('s')) return Number.parseFloat(time) * 1000;
  return fallback;
}

function getVhsAnimations() {
  if (!hero) return [];

  return [...hero.querySelectorAll('.hero-vhs-bright, .hero-vhs-dark, .hero-vhs-tracking, .hero-vhs-band')]
    .flatMap((layer) => layer.getAnimations());
}

function setVhsPlaybackRate(rate) {
  vhsPlaybackRate = rate;

  getVhsAnimations().forEach((animation) => {
    if (typeof animation.updatePlaybackRate === 'function') {
      animation.updatePlaybackRate(rate);
    } else {
      animation.playbackRate = rate;
    }
  });
}

function transitionVhsPlayback(targetRate) {
  if (!hero || reducedMotion.matches || !precisePointer.matches) return;

  cancelAnimationFrame(vhsRateFrame);

  const startRate = vhsPlaybackRate;
  const duration = parseTime(
    getComputedStyle(hero).getPropertyValue('--vhs-settle-duration'),
  );
  const startTime = performance.now();

  function updateRate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const nextRate = startRate + (targetRate - startRate) * eased;

    setVhsPlaybackRate(nextRate);

    if (progress < 1) {
      vhsRateFrame = requestAnimationFrame(updateRate);
    } else {
      setVhsPlaybackRate(targetRate);
    }
  }

  vhsRateFrame = requestAnimationFrame(updateRate);
}

hero?.addEventListener('pointerenter', () => transitionVhsPlayback(0));
hero?.addEventListener('pointerleave', () => transitionVhsPlayback(1));

reducedMotion.addEventListener('change', (event) => {
  cancelAnimationFrame(vhsRateFrame);
  vhsPlaybackRate = event.matches ? 0 : 1;

  if (!event.matches) {
    requestAnimationFrame(() => setVhsPlaybackRate(1));
  }
});

function applyTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle?.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);

  if (persist) {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  }
}

applyTheme(document.documentElement.dataset.theme || 'light');

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  mobileMenu.hidden = isOpen;
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    mobileMenu.hidden = true;
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
