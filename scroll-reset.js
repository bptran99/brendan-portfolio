// Refreshes start at the top; normal anchor links and history navigation still work.
if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  if (location.hash) {
    try {
      history.replaceState(history.state, '', location.pathname + location.search);
    } catch {
      // Some local file previews do not permit changing the URL with replaceState.
    }
  }

  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
  }, { once: true });
}
