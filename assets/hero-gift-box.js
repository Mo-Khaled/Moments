// Gift-box hero (sections/hero-gift-box.liquid). With CSS scroll-driven animations this only toggles will-change while the hero is on
// screen. Without them (older Safari, Firefox) it writes the progress --p from the scroll position: passive listener, one rAF per frame,
// only while the hero is visible. No scroll hijacking, no scroll lock.
const hero = document.querySelector('[data-hgb]:not([data-static])');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

if (hero && !reduced.matches) {
  const track = hero.querySelector('.hgb__track');
  const stage = hero.querySelector('.hgb__stage');
  const native = CSS.supports('animation-timeline: view()');
  let visible = false;
  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = track.getBoundingClientRect();
    const span = rect.height - innerHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 1;
    stage.style.setProperty('--p', p.toFixed(4));
  };
  const request = () => {
    if (visible && !frame) frame = requestAnimationFrame(update);
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-live', visible);
    if (!native && visible) request();
  }).observe(track);

  if (!native) {
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request, { passive: true });
  }

  // The live 3D bottle: desktop only, after the page has loaded and the browser is idle, so it never delays the first paint.
  // The stills stay if the module or WebGL fails.
  if (hero.dataset.module && matchMedia('(min-width: 750px)').matches) {
    const load = () => (window.requestIdleCallback || setTimeout)(() => import(hero.dataset.module).then((m) => m.mount(hero)).catch(() => {}), { timeout: 3000 });
    if (document.readyState === 'complete') load();
    else addEventListener('load', load, { once: true });
  }
}
