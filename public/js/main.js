// Majagua v2: medidor de profundidad y barra superior.
(function () {
  const MAX_DEPTH = 400; // metros al llegar al fondo de la página

  const top = document.querySelector('.top');
  const depthEl = document.querySelector('[data-depth]');
  const zoneEl = document.querySelector('[data-zone]');
  const track = document.querySelector('.gauge-track');
  const mark = document.querySelector('.gauge-mark');
  const zones = [...document.querySelectorAll('[data-zone-name]')];
  const hero = document.querySelector('.hero');

  let ticking = false;

  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;

    depthEl.textContent = String(Math.round(f * MAX_DEPTH)).padStart(3, '0');
    mark.style.setProperty('--y', (f * (track.offsetHeight - 3)) + 'px');

    const mid = innerHeight / 2;
    let current = zones[0];
    for (const z of zones) if (z.getBoundingClientRect().top <= mid) current = z;
    zoneEl.textContent = current.dataset.zoneName;

    top.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < 80);
    ticking = false;
  }

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update);
  update();
})();
