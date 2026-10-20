// Run decorative work once the page has loaded, its fonts are in (so the headline has already
// had its final paint), and the main thread is free. Returns a cancel function.
export function whenIdle(fn, timeout = 600) {
  let idleId;
  let cancelled = false;
  const schedule = () => {
    if (cancelled) return;
    idleId = window.requestIdleCallback
      ? window.requestIdleCallback(fn, { timeout })
      : window.setTimeout(fn, 200);
  };
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  // Don't wait forever on fonts (e.g. a blocked request).
  const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]);
  Promise.all([loaded, fonts]).then(schedule);

  return () => {
    cancelled = true;
    if (idleId == null) return;
    if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    else window.clearTimeout(idleId);
  };
}
