const mosaicGrid = document.querySelector('[data-about-mosaic]');
const mosaicMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function createMosaicItem(image, index, total) {
  const item = document.createElement('figure');
  const photograph = document.createElement('img');

  item.className = 'mosaic-item';
  item.style.setProperty('--mosaic-delay', `${Math.min(index % 8, 7) * 55}ms`);

  photograph.src = image.src;
  photograph.alt = `Personal photograph ${index + 1} of ${total}`;
  photograph.loading = 'lazy';
  photograph.decoding = 'async';
  photograph.sizes = '(max-width: 640px) 100vw, (max-width: 900px) 67vw, 58vw';

  item.append(photograph);
  return item;
}

function revealMosaic() {
  if (!mosaicGrid) return;

  if (mosaicMotionPreference.matches || !('IntersectionObserver' in window)) {
    mosaicGrid.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    mosaicGrid.classList.add('is-visible');
    observer.disconnect();
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  observer.observe(mosaicGrid);
}

function showMosaicStatus(message) {
  const status = mosaicGrid?.querySelector('[data-mosaic-status]');
  if (!status) return;
  status.textContent = message;
  mosaicGrid.setAttribute('aria-busy', 'false');
}

async function loadAboutMosaic() {
  if (!mosaicGrid) return;

  try {
    const response = await fetch('/api/mosaic', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error(`Mosaic endpoint returned ${response.status}`);

    const payload = await response.json();
    const images = Array.isArray(payload.images) ? payload.images : [];

    if (!images.length) {
      showMosaicStatus('Photography coming soon.');
      return;
    }

    const fragment = document.createDocumentFragment();
    images.forEach((image, index) => {
      fragment.append(createMosaicItem(image, index, images.length));
    });

    mosaicGrid.replaceChildren(fragment);
    mosaicGrid.setAttribute('aria-busy', 'false');
    revealMosaic();
  } catch {
    showMosaicStatus('Photography is unavailable right now.');
  }
}

loadAboutMosaic();
