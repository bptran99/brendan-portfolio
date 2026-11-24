const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('#mobile-menu');
const siteHeader = document.querySelector('.site-header');
const themeToggles = document.querySelectorAll('.theme-toggle');
const mobileThemeLabels = document.querySelectorAll('[data-theme-label]');
const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

// Lenis smooths wheel scrolling; touch and reduced-motion preferences stay native.
const resistanceSections = [...document.querySelectorAll('.oru-case-content [data-nav-section]')];
let smoothScroll = null;
if (typeof window.Lenis === 'function') {
  smoothScroll = new window.Lenis({
    autoRaf: true, anchors: true, syncTouch: false, lerp: 0.07,
    stopInertiaOnNavigate: true, respectReducedMotion: true,
    virtualScroll(data) {
      if (!smoothScroll || !resistanceSections.length || reducedMotion.matches ||
          data.event.type !== 'wheel' || data.event.ctrlKey || data.event.metaKey ||
          data.event.shiftKey || !data.deltaY || Math.abs(data.deltaY) > 180) return;

      // Ease wheel input near boundaries without preventing a reader from passing through.
      const resistanceRange = 160;
      const minimumMultiplier = 0.7;
      const position = smoothScroll.targetScroll;
      let distance = resistanceRange;
      resistanceSections.forEach((section) => {
        const offset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
        const boundary = section.getBoundingClientRect().top + window.scrollY - offset;
        const before = boundary - position;
        const after = boundary - (position + data.deltaY);
        const nearest = before * after <= 0 ? 0 : Math.min(Math.abs(before), Math.abs(after));
        distance = Math.min(distance, nearest);
      });
      const influence = 1 - distance / resistanceRange;
      data.deltaY *= 1 - (1 - minimumMultiplier) * influence;
    },
  });
}

// FlickerTypewriterText timing controls.
const TYPING_INTERVAL = 25;
const FLICKER_COUNT = 6;
const FLICKER_MIN_DURATION = 60;
const FLICKER_MAX_DURATION = 120;
const BLOCK_MIN_DURATION = 60;
const BLOCK_MAX_DURATION = 100;
const BLOCK_MIN_WIDTH = 3;
const BLOCK_MAX_WIDTH = 8;
const BLOCK_MIN_HEIGHT = 70;
const BLOCK_MAX_HEIGHT = 90;
const BLOCK_OPACITY = 0.88;
const CURSOR_BLINK_INTERVAL = 500;
const CURSOR_HOLD_AFTER_COMPLETE = 1000;
const CURSOR_FADE_DURATION = 160;
const FLICKER_GLYPHS = '#%&@?*/+=<>[]{}01';

if (window.location.protocol === 'file:') {
  document.querySelectorAll('[data-local-href]').forEach((link) => {
    link.setAttribute('href', link.dataset.localHref);
  });
}

const caseBackLink = document.querySelector('.case-back-link');
if (caseBackLink) {
  try {
    const previousPage = new URL(document.referrer);
    const isWebPage = ['http:', 'https:', 'file:'].includes(previousPage.protocol);
    const isCurrentPage = previousPage.origin === location.origin && previousPage.pathname === location.pathname;
    if (isWebPage && !isCurrentPage) caseBackLink.href = previousPage.href;
    else caseBackLink.setAttribute('aria-label', 'Back to featured work');
  } catch {
    caseBackLink.setAttribute('aria-label', 'Back to featured work');
  }
}

function initTypewriterText(element) {
  if (!element || element.dataset.typewriterStarted === 'true') return;

  const output = element.querySelector('[data-typewriter-output]');
  const cursor = element.querySelector('[data-typewriter-cursor]');
  const fullText = element.dataset.typewriterText;
  if (!output || !cursor || !fullText) return;
  const nameText = 'Brendan Tran';
  const nameStart = fullText.indexOf(nameText);
  const nameEnd = nameStart + nameText.length;

  let characterIndex = 0;
  let typingTimer;
  let cursorTimer;
  let flickerTimer;
  let blockTimer;
  let cursorHoldTimer;
  let cursorFadeTimer;
  let observer;
  const flickerTriggers = createFlickerTriggers(fullText.length);
  const blockFlickerTriggers = new Set(flickerTriggers.filter((_, index) => index % 2 === 1));
  const usedFlickerTriggers = new Set();

  function clearTimers() {
    window.clearTimeout(typingTimer);
    window.clearInterval(cursorTimer);
    window.clearTimeout(flickerTimer);
    window.clearTimeout(blockTimer);
    window.clearTimeout(cursorHoldTimer);
    window.clearTimeout(cursorFadeTimer);
  }

  function createFlickerTriggers(textLength) {
    const minimumIndex = Math.min(18, Math.max(2, textLength - FLICKER_COUNT));
    const maximumIndex = Math.max(minimumIndex, textLength - 5);
    const triggers = [];

    for (let index = 0; index < FLICKER_COUNT; index += 1) {
      const remainingTriggers = FLICKER_COUNT - index - 1;
      const minimumCandidate = index === 0
        ? minimumIndex
        : triggers[index - 1] + 3;
      const maximumCandidate = maximumIndex - remainingTriggers * 3;
      const evenPosition = minimumIndex
        + ((maximumIndex - minimumIndex) * index) / Math.max(1, FLICKER_COUNT - 1);
      const irregularPosition = Math.round(evenPosition) + randomInteger(-2, 2);

      triggers.push(
        Math.min(maximumCandidate, Math.max(minimumCandidate, irregularPosition)),
      );
    }

    return triggers;
  }

  function randomInteger(minimum, maximum) {
    return Math.floor(minimum + Math.random() * (maximum - minimum + 1));
  }

  function applyNameAccent() {
    if (nameStart < 0 || !output.firstChild || output.firstChild.nodeType !== Node.TEXT_NODE) return;

    const visibleEnd = Math.min(output.textContent.length, nameEnd);
    if (visibleEnd <= nameStart) return;

    const range = document.createRange();
    range.setStart(output.firstChild, nameStart);
    range.setEnd(output.firstChild, visibleEnd);

    const accent = document.createElement('span');
    accent.className = 'hero-name-accent';
    range.surroundContents(accent);
  }

  function renderFlicker(visibleText, strength) {
    const eligibleIndices = [...visibleText]
      .map((character, index) => ({ character, index }))
      .filter(({ character }) => !/\s/.test(character))
      .map(({ index }) => index);
    const isStrong = strength === 'strong';
    const maximumFlicker = Math.min(
      isStrong ? 6 : 3,
      Math.max(2, Math.floor(eligibleIndices.length * 0.2)),
    );
    const minimumFlicker = Math.min(isStrong ? 4 : 2, maximumFlicker);
    const flickerCount = randomInteger(minimumFlicker, maximumFlicker);
    const start = randomInteger(0, Math.max(0, eligibleIndices.length - flickerCount));
    const flickerIndices = eligibleIndices.slice(start, start + flickerCount);
    const flickerIndexSet = new Set(flickerIndices);
    const dimmedIndices = new Set(
      flickerIndices.slice(-Math.min(isStrong ? randomInteger(1, 2) : 1, flickerIndices.length)),
    );
    const blockIndex = isStrong ? flickerIndices[0] : -1;
    const sourceNode = output.firstChild;
    const originalWidths = new Map();

    if (sourceNode?.nodeType === Node.TEXT_NODE) {
      flickerIndices.forEach((index) => {
        const range = document.createRange();
        range.setStart(sourceNode, index);
        range.setEnd(sourceNode, index + 1);
        originalWidths.set(index, range.getBoundingClientRect().width);
      });
    }

    const fragment = document.createDocumentFragment();
    let sourceIndex = 0;
    let activeBlock;

    visibleText.split(/(\s+)/).forEach((segment) => {
      if (!segment) return;
      if (/^\s+$/.test(segment)) {
        fragment.append(document.createTextNode(segment));
        sourceIndex += segment.length;
        return;
      }

      const word = document.createElement('span');
      word.className = 'typewriter-word';
      if (nameStart >= 0 && sourceIndex < nameEnd && sourceIndex + segment.length > nameStart) {
        word.classList.add('hero-name-accent');
      }

      [...segment].forEach((character) => {
        if (!flickerIndexSet.has(sourceIndex)) {
          word.append(document.createTextNode(character));
          sourceIndex += 1;
          return;
        }

        const glyph = document.createElement('span');
        glyph.className = 'typewriter-glyph';
        glyph.textContent = FLICKER_GLYPHS[randomInteger(0, FLICKER_GLYPHS.length - 1)];
        if (dimmedIndices.has(sourceIndex)) glyph.classList.add('is-dimmed');

        const originalWidth = originalWidths.get(sourceIndex);
        if (originalWidth) glyph.style.width = `${originalWidth}px`;

        if (sourceIndex === blockIndex) {
          glyph.classList.add('has-block');
          glyph.style.setProperty(
            '--block-width',
            `${randomInteger(BLOCK_MIN_WIDTH, BLOCK_MAX_WIDTH)}ch`,
          );
          glyph.style.setProperty(
            '--block-height',
            `${randomInteger(BLOCK_MIN_HEIGHT, BLOCK_MAX_HEIGHT)}%`,
          );
          glyph.style.setProperty('--block-opacity', BLOCK_OPACITY);
          activeBlock = glyph;
        }

        word.append(glyph);
        sourceIndex += 1;
      });

      fragment.append(word);
    });

    output.replaceChildren(fragment);
    return activeBlock;
  }

  function finishImmediately() {
    clearTimers();
    output.textContent = fullText;
    applyNameAccent();
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

    const flickerTrigger = flickerTriggers.find(
      (trigger) => trigger <= characterIndex && !usedFlickerTriggers.has(trigger),
    );

    if (flickerTrigger) {
      usedFlickerTriggers.add(flickerTrigger);
      const isStrong = blockFlickerTriggers.has(flickerTrigger);
      const activeBlock = renderFlicker(visibleText, isStrong ? 'strong' : 'subtle');
      const blockDuration = randomInteger(BLOCK_MIN_DURATION, BLOCK_MAX_DURATION);
      const flickerDuration = Math.max(
        isStrong
          ? randomInteger(Math.max(90, FLICKER_MIN_DURATION), FLICKER_MAX_DURATION)
          : randomInteger(FLICKER_MIN_DURATION, Math.min(85, FLICKER_MAX_DURATION)),
        activeBlock ? blockDuration : 0,
      );

      if (activeBlock) {
        blockTimer = window.setTimeout(() => {
          activeBlock.classList.remove('has-block');
        }, blockDuration);
      }

      flickerTimer = window.setTimeout(() => {
        output.textContent = visibleText;
        applyNameAccent();
        if (characterIndex >= fullText.length) finishTyping();
        else typingTimer = window.setTimeout(typeNextCharacter, TYPING_INTERVAL);
      }, flickerDuration);
      return;
    }

    applyNameAccent();

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
  themeToggles.forEach((themeToggle) => {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeToggle.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  });
  mobileThemeLabels.forEach((label) => {
    label.textContent = isDark ? 'Light mode' : 'Dark mode';
  });

  if (persist) {
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      // The theme still works when storage is unavailable.
    }
  }
}

applyTheme(document.documentElement.dataset.theme || 'light');

themeToggles.forEach((themeToggle) => {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });
});

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  siteHeader?.classList.toggle('menu-open', !isOpen);
  mobileMenu.hidden = isOpen;
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    siteHeader?.classList.remove('menu-open');
    mobileMenu.hidden = true;
  });
});

function initOruCaseNavigation() {
  const nav = document.querySelector('.oru-case-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((section) => section?.matches('[data-nav-section]'));
  let updateFrame;
  let activeSection;
  let lastScrollY = window.scrollY;
  const activationLines = new Map();

  function setActiveSection(section) {
    if (!section) return;
    const link = links.find((item) => item.getAttribute('href') === `#${section.id}`);
    if (!link || activeSection === section) return;
    activeSection = section;

    links.forEach((item) => {
      if (item === link) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });

    const title = section.querySelector('.oru-section-heading h2');
    const description = section.querySelector(
      '.oru-section-summary',
    );
    const linkTitle = link.querySelector('[data-nav-title]');
    const linkDescription = link.querySelector('[data-nav-description]');

    if (title && linkTitle) linkTitle.textContent = title.textContent.trim();
    if (description && linkDescription) linkDescription.textContent = description.textContent.trim();
  }

  function updateCurrentSection() {
    const direction = Math.sign(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;

    // On smaller screens the sidebar is hidden, so retain the reading-position
    // fallback rather than measuring invisible navigation items.
    if (!nav.getClientRects().length) {
      const readingPosition = Math.min(window.innerHeight * 0.4, 360);
      let currentSection = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= readingPosition) currentSection = section;
      });
      setActiveSection(currentSection);
      return;
    }

    let index = Math.max(0, sections.indexOf(activeSection));
    if (direction > 0 || !activeSection) {
      while (index + 1 < sections.length) {
        const next = sections[index + 1];
        const nextLink = links.find((item) => item.getAttribute('href') === `#${next.id}`);
        const line = nextLink.getBoundingClientRect().top;
        if ((next.querySelector('.oru-section-panel') || next).getBoundingClientRect().top > line) break;
        // Remember the collapsed item's position: opening it moves the anchors,
        // so comparing against its new position would cause flicker in reverse.
        activationLines.set(next, line);
        index += 1;
      }
    } else if (direction < 0) {
      while (index > 0) {
        const current = sections[index];
        const currentLink = links.find((item) => item.getAttribute('href') === `#${current.id}`);
        const line = activationLines.get(current) ?? currentLink.getBoundingClientRect().top;
        if ((current.querySelector('.oru-section-panel') || current).getBoundingClientRect().top <= line) break;
        index -= 1;
      }
    }
    setActiveSection(sections[index]);
  }

  function scheduleUpdate() {
    if (updateFrame) return;
    updateFrame = window.requestAnimationFrame(() => {
      updateFrame = undefined;
      updateCurrentSection();
    });
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', () => {
    activationLines.clear();
    scheduleUpdate();
  });
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate, { once: true });

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(scheduleUpdate, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0,
    });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  updateCurrentSection();
}

initOruCaseNavigation();

function initOruHeroFade() {
  const stage = document.querySelector('.oru-hero-stage');
  const header = document.querySelector('.oru-case-header');
  const image = document.querySelector('.oru-hero-visual img');
  if (!stage || !header || !image) return;
  const textItems = header.querySelectorAll('.oru-hero-heading, .oru-hero-meta, .oru-hero-intro-grid p');

  let frame;
  function update() {
    frame = undefined;
    const stageTop = stage.getBoundingClientRect().top;
    const headerTop = header.getBoundingClientRect().top;
    const imageTop = image.parentElement.getBoundingClientRect().top;
    const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
    const imageStart = imageTop - stageTop;
    const scrollDistance = Math.max(0, -stageTop);
    // The thumbnail reaches full size when it has entered the viewport.
    const scaleDistance = window.innerHeight * (window.matchMedia('(max-width: 960px)').matches ? 1 : 2);
    const scaleProgress = reducedMotion.matches ? 1 : Math.min(1, scrollDistance / scaleDistance);
    const imageTravel = Math.max(window.innerHeight * 0.2, imageStart + Math.min(image.offsetHeight, window.innerHeight) - window.innerHeight);
    const imageProgress = reducedMotion.matches ? 1 : Math.min(1, scrollDistance / imageTravel);
    stage.style.setProperty('--oru-visual-scale', String(reducedMotion.matches ? 1 : 0.8 + 0.2 * imageProgress));
    stage.style.setProperty('--oru-hero-scale', String(reducedMotion.matches ? 1 : 1 - 0.2 * scaleProgress));
    textItems.forEach((item) => {
      const itemStart = stickyTop + item.getBoundingClientRect().top - headerTop;
      const fadeDistance = Math.max(1, imageStart - itemStart);
      const progress = reducedMotion.matches ? 0 : Math.min(1, scrollDistance / fadeDistance);
      const opacity = progress >= 1 ? 0 : 1 - 0.82 * progress;
      item.style.setProperty('--oru-hero-text-opacity', String(opacity));
    });
  }
  function scheduleUpdate() {
    if (frame === undefined) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  reducedMotion.addEventListener('change', scheduleUpdate);
  update();
}

initOruHeroFade();

function initOruJourneyFit() {
  const viewport = document.querySelector('.oru-journey-scroll');
  const canvas = viewport?.querySelector('.oru-journey-canvas');
  if (!viewport || !canvas) return;

  function fit() {
    const scale = Math.min(1, viewport.clientWidth / canvas.offsetWidth);
    const height = Math.ceil(canvas.offsetHeight * scale) + 2;
    viewport.style.setProperty('--oru-journey-scale', String(scale));
    viewport.style.setProperty('--oru-journey-height', `${height}px`);
    viewport.classList.add('is-fitted');
    viewport.setAttribute('aria-label', 'Customer journey map');
    viewport.removeAttribute('tabindex');
  }

  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(viewport);
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit, { once: true });
  document.fonts?.ready.then(fit);
  fit();
}

initOruJourneyFit();

function initOruImpactCounts() {
  const values = document.querySelectorAll('[data-impact-count]');
  if (!values.length || !('IntersectionObserver' in window)) return;

  function format(value, type) {
    if (type === 'duration') return `${Math.floor(value / 60)}m ${String(value % 60).padStart(2, '0')}s`;
    if (type === 'percent') return `${value}%`;
    return value.toLocaleString();
  }

  function animate(element) {
    const target = Number(element.dataset.impactCount);
    const type = element.dataset.impactFormat;
    if (reducedMotion.matches || !Number.isFinite(target)) return;
    const duration = 1400;
    let start;
    element.textContent = format(0, type);
    function step(timestamp) {
      if (start === undefined) start = timestamp;
      const progress = reducedMotion.matches ? 1 : Math.min(1, (timestamp - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      element.textContent = format(Math.round(target * eased), type);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animate(entry.target);
    });
  }, { threshold: 0.5 });
  values.forEach((value) => observer.observe(value));
}

initOruImpactCounts();

document.querySelector('#year').textContent = new Date().getFullYear();
