const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const themeToggle = document.querySelector('.theme-toggle');
const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

// GlitchTypewriterText timing controls.
const TYPING_INTERVAL = 50;
const GLITCH_COUNT = 4;
const GLITCH_MIN_DURATION = 40;
const GLITCH_MAX_DURATION = 80;
const CURSOR_BLINK_INTERVAL = 500;
const CURSOR_HOLD_AFTER_COMPLETE = 1000;
const CURSOR_FADE_DURATION = 160;
const GLITCH_GLYPHS = '#%&@?*/+=<>[]{}01';

if (window.location.protocol === 'file:') {
  document.querySelectorAll('[data-local-href]').forEach((link) => {
    link.setAttribute('href', link.dataset.localHref);
  });
}

function initTypewriterText(element) {
  if (!element || element.dataset.typewriterStarted === 'true') return;

  const output = element.querySelector('[data-typewriter-output]');
  const cursor = element.querySelector('[data-typewriter-cursor]');
  const fullText = element.dataset.typewriterText;
  if (!output || !cursor || !fullText) return;

  let characterIndex = 0;
  let typingTimer;
  let cursorTimer;
  let glitchTimer;
  let cursorHoldTimer;
  let cursorFadeTimer;
  let observer;
  const glitchTriggers = createGlitchTriggers(fullText.length);
  const usedGlitchTriggers = new Set();

  function clearTimers() {
    window.clearTimeout(typingTimer);
    window.clearInterval(cursorTimer);
    window.clearTimeout(glitchTimer);
    window.clearTimeout(cursorHoldTimer);
    window.clearTimeout(cursorFadeTimer);
  }

  function createGlitchTriggers(textLength) {
    const minimumIndex = Math.min(18, Math.max(2, textLength - GLITCH_COUNT));
    const maximumIndex = Math.max(minimumIndex, textLength - 5);
    const triggers = [];
    let attempts = 0;

    while (triggers.length < GLITCH_COUNT && attempts < 100) {
      const candidate = Math.floor(
        minimumIndex + Math.random() * (maximumIndex - minimumIndex + 1),
      );

      if (triggers.every((trigger) => Math.abs(trigger - candidate) >= 6)) {
        triggers.push(candidate);
      }
      attempts += 1;
    }

    while (triggers.length < GLITCH_COUNT) {
      const fallback = Math.round(
        minimumIndex
          + ((maximumIndex - minimumIndex) * (triggers.length + 1)) / (GLITCH_COUNT + 1),
      );
      if (!triggers.includes(fallback)) triggers.push(fallback);
      else triggers.push(Math.min(maximumIndex, fallback + triggers.length));
    }

    return triggers.sort((a, b) => a - b);
  }

  function randomInteger(minimum, maximum) {
    return Math.floor(minimum + Math.random() * (maximum - minimum + 1));
  }

  function shuffled(values) {
    return [...values].sort(() => Math.random() - 0.5);
  }

  function renderGlitch(visibleText) {
    const eligibleIndices = [...visibleText]
      .map((character, index) => ({ character, index }))
      .filter(({ character }) => !/\s/.test(character))
      .map(({ index }) => index);
    const maximumCorruption = Math.min(5, Math.max(2, Math.floor(eligibleIndices.length * 0.12)));
    const corruptionCount = randomInteger(2, maximumCorruption);
    const start = randomInteger(0, Math.max(0, eligibleIndices.length - corruptionCount));
    const corruptIndices = eligibleIndices.slice(start, start + corruptionCount);
    const offsetIndices = new Set(shuffled(corruptIndices).slice(0, Math.min(2, corruptIndices.length)));
    const blockIndices = new Set(shuffled(corruptIndices).slice(0, randomInteger(1, Math.min(2, corruptIndices.length))));
    const corruptIndexSet = new Set(corruptIndices);
    const fragment = document.createDocumentFragment();
    let sourceIndex = 0;

    visibleText.split(/(\s+)/).forEach((segment) => {
      if (!segment) return;
      if (/^\s+$/.test(segment)) {
        fragment.append(document.createTextNode(segment));
        sourceIndex += segment.length;
        return;
      }

      const word = document.createElement('span');
      word.className = 'typewriter-word';

      [...segment].forEach((character) => {
        if (!corruptIndexSet.has(sourceIndex)) {
          word.append(document.createTextNode(character));
          sourceIndex += 1;
          return;
        }

        const glyph = document.createElement('span');
        glyph.className = 'typewriter-glyph';
        glyph.textContent = character;
        glyph.dataset.glitch = GLITCH_GLYPHS[randomInteger(0, GLITCH_GLYPHS.length - 1)];

        if (offsetIndices.has(sourceIndex)) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          glyph.classList.add('is-offset');
          glyph.style.setProperty('--glitch-offset', `${direction * randomInteger(1, 3)}px`);
        }
        if (blockIndices.has(sourceIndex)) glyph.classList.add('has-block');

        word.append(glyph);
        sourceIndex += 1;
      });

      fragment.append(word);
    });

    output.replaceChildren(fragment);
  }

  function finishImmediately() {
    clearTimers();
    output.textContent = fullText;
    cursor.hidden = true;
    cursor.classList.remove('is-invisible', 'is-fading');
    observer?.disconnect();
    reducedMotion.removeEventListener('change', handleReducedMotion);
  }

  function handleReducedMotion(event) {
    if (event.matches) finishImmediately();
  }

  function finishTyping() {
    cursorHoldTimer = window.setTimeout(() => {
      window.clearInterval(cursorTimer);
      cursor.classList.remove('is-invisible');
      cursor.classList.add('is-fading');

      cursorFadeTimer = window.setTimeout(() => {
        cursor.hidden = true;
        cursor.classList.remove('is-fading');
        reducedMotion.removeEventListener('change', handleReducedMotion);
      }, CURSOR_FADE_DURATION);
    }, CURSOR_HOLD_AFTER_COMPLETE);
  }

  function typeNextCharacter() {
    characterIndex += 1;
    const visibleText = fullText.slice(0, characterIndex);
    output.textContent = visibleText;

    const glitchTrigger = glitchTriggers.find(
      (trigger) => trigger <= characterIndex && !usedGlitchTriggers.has(trigger),
    );

    if (glitchTrigger) {
      usedGlitchTriggers.add(glitchTrigger);
      renderGlitch(visibleText);
      glitchTimer = window.setTimeout(() => {
        output.textContent = visibleText;
        if (characterIndex >= fullText.length) finishTyping();
        else typingTimer = window.setTimeout(typeNextCharacter, TYPING_INTERVAL);
      }, randomInteger(GLITCH_MIN_DURATION, GLITCH_MAX_DURATION));
      return;
    }

    if (characterIndex >= fullText.length) {
      finishTyping();
      return;
    }

    typingTimer = window.setTimeout(typeNextCharacter, TYPING_INTERVAL);
  }

  function startTyping() {
    if (element.dataset.typewriterStarted === 'true') return;
    element.dataset.typewriterStarted = 'true';
    observer?.disconnect();

    if (reducedMotion.matches) {
      finishImmediately();
      return;
    }

    output.textContent = '';
    cursor.hidden = false;
    cursor.classList.remove('is-invisible', 'is-fading');
    cursorTimer = window.setInterval(() => {
      cursor.classList.toggle('is-invisible');
    }, CURSOR_BLINK_INTERVAL);

    typingTimer = window.setTimeout(typeNextCharacter, TYPING_INTERVAL);
  }

  reducedMotion.addEventListener('change', handleReducedMotion);
  window.addEventListener('pagehide', clearTimers, { once: true });

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startTyping();
    }, { threshold: 0.15 });
    observer.observe(element);
  } else {
    startTyping();
  }
}

initTypewriterText(document.querySelector('[data-typewriter-text]'));

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
