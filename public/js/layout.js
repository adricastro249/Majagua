// ==========================================================
// MAJAGUA v2 · PIEZAS COMPARTIDAS
// Menú, medidor de profundidad, footer, encabezado de tools,
// burbujas, filtros y reproductor de videos.
// Para cambiar algo en TODO el sitio, se edita solo este archivo.
//
// Uso en cada página (justo después de <body>):
//   <nav data-layout="nav"></nav>
//   <script src="js/layout.js"></script>        (en /tools/ es ../js/layout.js)
//   <header data-layout="tools-hero"></header>  (solo en las tools)
//   <div data-layout="footer"></div>            (opcional: data-owner="adriana" o "mariana")
// ==========================================================
(function () {

  // ---------- CONFIGURACIÓN ----------
  const CONTACT_EMAIL = 'produccionesmajagua@gmail.com';
  const CONTACT_SUBJECT = 'Consulta desde la web';
  const GOATCOUNTER_CODE = '';   // ej: 'majagua'. Vacío = analytics apagado.
  const MAX_DEPTH = 400;         // metros que marca el medidor al llegar al fondo

  const TOOLS = [
    ['tools/timecode.html', 'Calculadora de timecode'],
    ['tools/peso-exportacion.html', 'Peso de exportación'],
    ['tools/aspect-ratio.html', 'Aspect ratio'],
    ['tools/safe-areas.html', 'Safe areas y redes'],
    ['tools/paletas.html', 'Paletas de color'],
    ['tools/conver-sub.html', 'Conversor de subtítulos'],
    ['tools/marcadores-resolve.html', 'Marcadores de Resolve a notas'],
    ['tools/dcp-name-generator.html', 'Nombres DCP']
  ];

  const FOOTERS = {
    default: {
      links: [['fa-brands fa-instagram', 'https://www.instagram.com/majaguaproducciones', 'Instagram de Majagua'],
              ['fa-solid fa-envelope', 'mailto', 'Escríbenos un correo']],
      copy: '© 2026 Majagua Producciones. Hecho a mano con HTML, CSS y JS.'
    },
    adriana: {
      links: [['fa-brands fa-linkedin-in', 'https://www.linkedin.com/in/adricastro249/', 'LinkedIn de Adriana'],
              ['fa-brands fa-github', 'https://github.com/adricastro249/', 'GitHub de Adriana'],
              ['fa-brands fa-vimeo-v', 'https://vimeo.com/adricastro249', 'Vimeo de Adriana'],
              ['fa-brands fa-instagram', 'https://www.instagram.com/adricastro249', 'Instagram de Adriana'],
              ['fa-solid fa-envelope', 'mailto', 'Escríbenos un correo']],
      copy: '© 2026 Adriana Castro, Majagua Producciones.'
    },
    mariana: {
      links: [['fa-brands fa-linkedin-in', 'https://www.linkedin.com/in/marianarojasbarroso/', 'LinkedIn de Mariana'],
              ['fa-brands fa-instagram', 'https://www.instagram.com/marianarojasba', 'Instagram de Mariana'],
              ['fa-solid fa-envelope', 'mailto', 'Escríbenos un correo']],
      copy: '© 2026 Mariana Rojas Barroso, Majagua Producciones.'
    }
  };

  // ---------- RUTAS (funciona en la web y abriendo los archivos local) ----------
  const ROOT = new URL('..', document.currentScript.src).href;
  const url = (p) => new URL(p, ROOT).href;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`;
  const here = location.href.split('#')[0].split('?')[0];
  const isCurrent = (p) => here === url(p) || (p === 'index.html' && here === ROOT);
  const isHome = isCurrent('index.html');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- MENÚ ----------
  function navHTML() {
    const a = (p, label, cls = '') =>
      `<li><a href="${url(p)}"${cls ? ` class="${cls}"` : ''}${isCurrent(p) ? ' aria-current="page"' : ''}>${label}</a></li>`;
    return `
      <a class="brand" href="${url('index.html')}" aria-label="Majagua Producciones, inicio">
        <img src="${url('img/icon.png')}" alt="" width="32" height="32"><span>Majagua</span>
      </a>
      <button class="menu-btn" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">
        <i class="fa-solid fa-bars" aria-hidden="true"></i>
      </button>
      <ul id="menu" class="menu">
        ${a('index.html#hacemos', 'Qué hacemos')}
        ${a('index.html#nosotras', 'Nosotras')}
        ${a('portfolio-web.html', 'Desarrollo web')}
        ${a('tools.html', 'Tools')}
        <li><a class="nav-cta" href="#contacto">Contacto</a></li>
      </ul>`;
  }

  function gaugeHTML() {
    return `<div class="gauge-track"><div class="gauge-mark"></div></div>
      <p class="gauge-read"><span data-depth>000</span> m</p>
      <p class="gauge-zone" data-zone></p>`;
  }

  // ---------- ENCABEZADO DE CADA TOOL ----------
  function toolsHeroHTML() {
    const others = TOOLS.filter(([p]) => !isCurrent(p))
      .map(([p, l]) => `<a href="${url(p)}">${l}</a>`).join('');
    return `
      <div class="tools-hero-in">
        <a class="back" href="${url('tools.html')}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Todas las tools</a>
        <p>Gratis, sin registro y todo en tu navegador: tus archivos no se suben a ningún servidor.</p>
      </div>
      <details class="tools-switch"><summary>Otras tools</summary><div>${others}</div></details>`;
  }

  // ---------- FOOTER ----------
  function footerHTML(owner) {
    const f = FOOTERS[owner] || FOOTERS.default;
    const icons = f.links.map(([icon, href, label]) => {
      const mail = href === 'mailto';
      return `<a href="${mail ? mailto : href}"${mail ? '' : ' target="_blank" rel="noopener"'} aria-label="${label}" title="${label}"><i class="${icon}" aria-hidden="true"></i></a>`;
    }).join('');
    return `
      <footer id="contacto" class="fondo" data-zone-name="Fondo">
        <div class="fondo-text">
          <h2>Escríbenos</h2>
          <a class="mail" href="${mailto}">${CONTACT_EMAIL}</a>
          <p>Desde Buenos Aires, Argentina.</p>
          <div class="icon-links">${icons}</div>
        </div>
        <img class="fondo-img" src="${url('img/fondo-marino.webp')}" alt="" width="2400" height="830" loading="lazy">
        <p class="copy">${f.copy}</p>
        <div class="fondo-veil" aria-hidden="true"></div>
        ${creaturesHTML()}
      </footer>`;
  }

  // Criaturas bioluminiscentes del modo linterna
  function creaturesHTML() {
    const medusa = (cls) => `<svg class="criatura ${cls}" viewBox="0 0 80 130" aria-hidden="true">
        <path class="cuerpo" d="M6 42C6 12 74 12 74 42C62 49 18 49 6 42Z"/>
        <path class="tentaculo" d="M18 46c-4 14 6 22 0 38s4 22 0 34"/>
        <path class="tentaculo" d="M32 48c-3 16 5 24 0 40s3 20 0 30"/>
        <path class="tentaculo" d="M48 48c3 16-5 24 0 40s-3 20 0 30"/>
        <path class="tentaculo" d="M62 46c4 14-6 22 0 38s-4 22 0 34"/></svg>`;
    const rape = `<svg class="criatura rape" viewBox="0 0 60 70" aria-hidden="true">
        <path class="tentaculo" d="M56 68C50 30 30 14 12 14"/><circle class="luz" cx="10" cy="14" r="7"/></svg>`;
    const plancton = Array.from({ length: 26 }, () =>
      `<i style="left:${(Math.random() * 96).toFixed(1)}%;top:${(Math.random() * 90).toFixed(1)}%;animation-delay:-${(Math.random() * 6).toFixed(1)}s"></i>`).join('');
    // Pulpitos: el mismo pulpo de la ilustración de Majagua, en versión luminosa
    const pulpo = (cls) => `<img class="pulpito ${cls}" src="${url('img/fondo/pulpo.svg')}" alt="" loading="lazy">`;
    return `<div class="criaturas" aria-hidden="true">${medusa('m1')}${medusa('m2')}${rape}${pulpo('p1')}${pulpo('p2')}${pulpo('p3')}<div class="plancton">${plancton}</div></div>`;
  }

  // ---------- INSERTAR ----------
  function render() {
    document.querySelectorAll('[data-layout]:not([data-rendered])').forEach(el => {
      const t = el.dataset.layout;
      if (t === 'nav') {
        el.classList.add('top');
        if (isHome) el.classList.add('on-light');
        el.setAttribute('aria-label', 'Principal');
        el.innerHTML = navHTML();
        const g = document.createElement('aside');
        g.className = 'gauge'; g.setAttribute('aria-hidden', 'true');
        g.innerHTML = gaugeHTML();
        el.after(g);
      } else if (t === 'tools-hero') {
        el.classList.add('tools-hero'); el.dataset.zoneName = 'Tools';
        el.innerHTML = toolsHeroHTML();
      } else if (t === 'footer') {
        el.outerHTML = footerHTML(el.dataset.owner);
        return;
      } else return;
      el.dataset.rendered = '';
    });

    // Todo enlace que sale de Majagua abre en otra pestaña
    document.querySelectorAll('a[href^="http"]').forEach(a => {
      if (new URL(a.href).host !== location.host) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
    document.querySelectorAll(`a[href="mailto:${CONTACT_EMAIL}"]`).forEach(a => { a.href = mailto; });
  }

  render();
  document.addEventListener('DOMContentLoaded', () => { render(); init(); });

  // ---------- COMPORTAMIENTO ----------
  function init() {
    const top = document.querySelector('.top');
    const btn = document.querySelector('.menu-btn');
    const menu = document.getElementById('menu');

    // Menú en celular
    const setOpen = (open) => {
      top.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      btn.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
    };
    btn.addEventListener('click', () => setOpen(!top.classList.contains('menu-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') { setOpen(false); closeVideo(); } });

    // Medidor de profundidad + barra superior
    const depthEl = document.querySelector('[data-depth]');
    const zoneEl = document.querySelector('[data-zone]');
    const track = document.querySelector('.gauge-track');
    const mark = document.querySelector('.gauge-mark');
    const zones = [...document.querySelectorAll('[data-zone-name]')];
    let ticking = false, lastY = scrollY, lastZone = null;
    const gauge = document.querySelector('.gauge');
    const root = document.documentElement.style;

    function update() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      depthEl.textContent = String(Math.round(f * MAX_DEPTH)).padStart(3, '0');
      mark.style.setProperty('--y', (f * Math.max(0, track.offsetHeight - 3)) + 'px');
      let cur = zones[0];
      for (const z of zones) if (z.getBoundingClientRect().top <= innerHeight / 2) cur = z;
      zoneEl.textContent = cur ? cur.dataset.zoneName : '';
      top.classList.toggle('is-solid', scrollY > 40);

      // Sonar: el medidor hace "ping" al entrar a una sección nueva
      if (cur && lastZone && cur !== lastZone) {
        gauge.classList.remove('ping'); void gauge.offsetWidth; gauge.classList.add('ping');
        sonido.ping();
      }
      lastZone = cur;

      // La luz de la superficie se va apagando con la profundidad
      root.setProperty('--luz', Math.max(0, 1 - f * 1.7).toFixed(3));
      root.setProperty('--luz-y', (f * 40).toFixed(1) + 'vh');
      if (f > 0.28) ballena();

      const dy = scrollY - lastY; lastY = scrollY;
      if (dy > 0) bubbles.fromScroll(dy);
      ticking = false;
    }
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener('resize', update);

    // Burbujas al hacer clic en un enlace o botón
    addEventListener('pointerdown', e => {
      if (e.target.closest('a, button, summary, [data-video]')) { bubbles.burst(e.clientX, e.clientY); sonido.blip(); }
    });

    renderPortfolio();
    initFilters();
    initVideos();
    initLinterna();
    initOlas();
    initCapas();
    initMar();
    sonido.boton();
    update();
  }

  // ---------- PORTAFOLIO: se arma desde data/portafolio-*.js ----------
  // Acepta enlaces de YouTube (watch, youtu.be o embed) y de Vimeo, y saca solo la portada.
  function videoInfo(link) {
    if (!link) return {};
    let m = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { embed: `https://www.youtube.com/embed/${m[1]}`, thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
    m = link.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { embed: `https://player.vimeo.com/video/${m[1]}`, thumb: `https://vumbnail.com/${m[1]}.jpg` };
    return { embed: link };
  }

  function renderPortfolio() {
    const box = document.querySelector('[data-portfolio]');
    const data = window.PORTAFOLIO;
    if (!box || !data) return;
    const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const filtros = Object.entries({ all: 'Todo', ...data.filtros })
      .filter(([k]) => k === 'all' || data.trabajos.some(t => (t.categorias || []).includes(k)))
      .map(([k, l]) => `<button type="button" data-filter="${k}" aria-pressed="${k === 'all'}">${esc(l)}</button>`).join('');

    const cards = data.trabajos.map(t => {
      const v = videoInfo(t.video);
      const cover = t.portada ? url(t.portada) : v.thumb;
      const inner = `
        <span class="work-thumb">${cover ? `<img src="${cover}" alt="" loading="lazy" onerror="this.remove()">` : ''}
          ${v.embed ? '<span class="work-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>' : ''}</span>
        <span class="work-info">
          <span class="work-top"><span class="work-role">${esc(t.rol)}</span><span class="work-year">${esc(t.anio)}</span></span>
          <span class="work-title">${esc(t.titulo)}</span>
          ${t.detalle ? `<span class="work-meta">${esc(t.detalle)}</span>` : ''}
        </span>`;
      return `<li data-cats="${esc((t.categorias || []).join(' '))}">${v.embed
        ? `<button class="work" type="button" data-video="${esc(v.embed)}" data-title="${esc(t.titulo)}">${inner}</button>`
        : `<div class="work">${inner}</div>`}</li>`;
    }).join('');

    box.innerHTML = `<div class="filters" role="group" aria-label="Filtrar por rol">${filtros}</div>
      <ul class="work-grid">${cards}</ul>`;
  }

  // ---------- BURBUJAS ----------
  const bubbles = (function () {
    if (reduceMotion) return { fromScroll() {}, burst() {}, trail() {} };
    const cv = document.createElement('canvas');
    cv.className = 'bubbles'; cv.setAttribute('aria-hidden', 'true');
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(cv));
    const ctx = cv.getContext('2d');
    let list = [], running = false, dpr = 1;

    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    }
    size(); addEventListener('resize', size);

    function add(x, y, r, vy) {
      if (list.length > 140) return;
      list.push({ x, y, r, vy, ph: Math.random() * 6.28, sw: 0.6 + Math.random() * 1.2, a: 0.55 + Math.random() * 0.35 });
      if (!running) { running = true; requestAnimationFrame(tick); }
    }

    function tick() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      list = list.filter(b => b.y + b.r > -10 && b.a > 0.02);
      for (const b of list) {
        b.ph += 0.05; b.y -= b.vy; b.x += Math.sin(b.ph) * b.sw * 0.5 + corriente(scrollY + b.y) * 1.4;
        b.vy *= 1.004; b.a *= 0.994;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283);
        ctx.strokeStyle = `rgba(234,248,252,${b.a})`; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, 6.283);
        ctx.fillStyle = `rgba(255,255,255,${b.a * 0.9})`; ctx.fill();
      }
      if (list.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }

    return {
      fromScroll(dy) {
        const n = Math.min(6, Math.round(dy / 30));
        for (let i = 0; i < n; i++)
          add(Math.random() * innerWidth, innerHeight + 10 + Math.random() * 40, 2 + Math.random() * 7, 1.2 + Math.random() * 2.2);
      },
      trail(x, y) {
        add(x + (Math.random() - 0.5) * 8, y + 6, 1.2 + Math.random() * 2.5, 0.6 + Math.random() * 0.9);
      },
      burst(x, y) {
        for (let i = 0; i < 9; i++)
          add(x + (Math.random() - 0.5) * 26, y + Math.random() * 10, 1.5 + Math.random() * 5, 0.8 + Math.random() * 1.8);
      }
    };
  })();

  // ---------- FILTROS (portafolios) ----------
  function initFilters() {
    const btns = document.querySelectorAll('[data-filter]');
    btns.forEach(b => b.addEventListener('click', () => {
      const cat = b.dataset.filter;
      btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      document.querySelectorAll('[data-cats]').forEach(it => {
        it.hidden = !(cat === 'all' || it.dataset.cats.split(' ').includes(cat));
      });
    }));
  }

  // ---------- VIDEOS: se cargan solo al hacer clic ----------
  let modal;
  function initVideos() {
    const triggers = document.querySelectorAll('[data-video]');
    if (!triggers.length) return;
    modal = document.createElement('dialog');
    modal.className = 'video-modal';
    modal.innerHTML = `<button class="video-close" type="button" aria-label="Cerrar video"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      <div class="video-frame"></div><p class="video-title"></p>`;
    document.body.appendChild(modal);
    modal.querySelector('.video-close').addEventListener('click', closeVideo);
    modal.addEventListener('click', e => { if (e.target === modal) closeVideo(); });
    modal.addEventListener('close', () => { modal.querySelector('.video-frame').innerHTML = ''; });
    triggers.forEach(t => t.addEventListener('click', () => {
      const src = t.dataset.video + (t.dataset.video.includes('?') ? '&' : '?') + 'autoplay=1';
      modal.querySelector('.video-frame').innerHTML =
        `<iframe src="${src}" title="${t.dataset.title}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
      modal.querySelector('.video-title').textContent = t.dataset.title;
      modal.showModal();
    }));
  }
  function closeVideo() { if (modal && modal.open) modal.close(); }

  // ---------- MODO LINTERNA: al llegar al fondo se apaga la luz ----------
  function initLinterna() {
    const fondo = document.querySelector('.fondo');
    if (!fondo) return;
    const setLight = (x, y) => { fondo.style.setProperty('--lx', x + 'px'); fondo.style.setProperty('--ly', y + 'px'); };
    let lit = false, raf = 0, t0 = 0;

    new IntersectionObserver(([e]) => {
      lit = e.intersectionRatio > 0.45;
      fondo.classList.toggle('lit', lit);
      // Sin mouse (celular): la luz se pasea sola
      if (lit && !matchMedia('(hover: hover)').matches && !reduceMotion) { t0 = performance.now(); drift(); }
      else cancelAnimationFrame(raf);
    }, { threshold: [0, 0.45, 0.6] }).observe(fondo);

    function drift() {
      const t = (performance.now() - t0) / 1000, r = fondo.getBoundingClientRect();
      setLight(r.width * (0.5 + 0.35 * Math.sin(t * 0.5)), r.height * (0.45 + 0.25 * Math.sin(t * 0.8)));
      if (lit) raf = requestAnimationFrame(drift);
    }
    fondo.addEventListener('pointermove', e => {
      const r = fondo.getBoundingClientRect();
      setLight(e.clientX - r.left, e.clientY - r.top);
    });
    setLight(fondo.clientWidth / 2, fondo.clientHeight * 0.4);
  }

  // ---------- HERO EN CAPAS: profundidad al bajar y al mover el mouse ----------
  function initCapas() {
    const capas = [...document.querySelectorAll('.capas img')];
    if (!capas.length || reduceMotion) return;
    const hero = document.querySelector('.hero');
    let mx = 0, tx = 0, raf = 0;
    const paint = () => {
      tx += (mx - tx) * 0.08;   // suavizado, como si el agua frenara el movimiento
      const y = Math.min(scrollY, hero.offsetHeight);
      capas.forEach(img => {
        img.style.transform = `translate3d(${(tx * img.dataset.m).toFixed(1)}px, ${(y * img.dataset.k).toFixed(1)}px, 0)`;
      });
      raf = Math.abs(mx - tx) > 0.002 ? requestAnimationFrame(paint) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener('scroll', kick, { passive: true });
    if (matchMedia('(hover: hover)').matches) {
      hero.addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - 0.5) * -2; kick(); });
    }
    kick();
  }

  // ---------- CORRIENTES: franjas del documento donde el agua empuja hacia un lado ----------
  // Se usa en la nieve marina y en las burbujas. yDoc = posición en la página, no en la pantalla.
  function corriente(yDoc) {
    const t = performance.now() / 6000;
    const banda = Math.sin(yDoc / 900 + t) * Math.sin(yDoc / 2300 - t * 0.7);
    return Math.abs(banda) > 0.35 ? banda * 0.9 : 0;   // fuera de las franjas, agua quieta
  }

  // ---------- BALLENA: cruza una sola vez, lejos, detrás del contenido ----------
  let ballenaVista = false;
  function ballena() {
    if (ballenaVista || reduceMotion) return;
    ballenaVista = true;
    const b = document.createElement('div');
    b.className = 'ballena'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = `<svg viewBox="0 0 400 145"><path d="M8 70C38 30 140 18 232 34c48 8 88 26 113 38l14-6c12-15 25-25 39-32-6 18-14 30-26 40 12 10 20 22 26 40-13-6-26-16-38-30l-14 4c-25 15-75 28-135 30C130 116 48 106 8 70Z"/><path d="M148 100c10 20 26 36 48 40-10-14-17-27-19-37Z"/><path d="M20 76c40 10 90 14 150 10" fill="none" stroke="rgba(234,248,252,.12)" stroke-width="2"/></svg>`;
    document.body.prepend(b);
    b.addEventListener('animationend', () => b.remove());
  }

  // ---------- INTRO DE INMERSIÓN: solo en la home y solo la primera visita ----------
  (function intro() {
    if (!isHome || reduceMotion) return;
    try { if (localStorage.getItem('majagua-buceo')) return; localStorage.setItem('majagua-buceo', '1'); } catch (e) { return; }
    const el = document.createElement('div');
    el.className = 'intro'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="intro-in">
        <div class="intro-cielo"></div>
        <svg class="intro-ola" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30C100 10 200 10 300 30S500 50 600 30 800 10 900 30s200 20 300 0V60H0Z"/></svg>
        <img class="intro-logo" src="${url('img/icon.png')}" alt="">
        <div class="intro-agua"></div>
      </div>`;
    document.body.prepend(el);
    const fin = () => { el.classList.add('fuera'); setTimeout(() => el.remove(), 900); };
    setTimeout(() => {
      el.classList.add('buceando');
      for (let i = 0; i < 4; i++) setTimeout(() => bubbles.burst(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.5 + Math.random() * 0.4)), 300 + i * 180);
    }, 700);
    setTimeout(fin, 2300);
    addEventListener('wheel', fin, { once: true, passive: true });
    addEventListener('keydown', fin, { once: true });
    el.addEventListener('pointerdown', fin);
  })();

  // ---------- VIDA MARINA: nieve marina, cardúmenes y estela de burbujas del cursor ----------
  function initMar() {
    if (reduceMotion) return;

    // Nieve marina: partículas que flotan detrás del contenido, más densas al bajar
    const rayos = document.createElement('div');
    rayos.className = 'rayos'; rayos.setAttribute('aria-hidden', 'true');
    document.body.prepend(rayos);

    const cv = document.createElement('canvas');
    cv.className = 'nieve'; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
    size(); addEventListener('resize', size);
    const N = innerWidth < 700 ? 40 : 80;
    const motas = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.15, vy: 0.08 + Math.random() * 0.25, ph: Math.random() * 6.28, a: 0.15 + Math.random() * 0.4
    }));
    (function tick() {
      if (!document.hidden) {
        const max = document.documentElement.scrollHeight - innerHeight;
        const depth = max > 0 ? scrollY / max : 0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#EAF8FC';
        for (const m of motas) {
          m.ph += 0.01; m.x += m.vx + Math.sin(m.ph) * 0.12 + corriente(scrollY + m.y); m.y += m.vy;
          if (m.y > H + 5) { m.y = -5; m.x = Math.random() * W; }
          if (m.x < -5) m.x = W + 5; else if (m.x > W + 5) m.x = -5;
          ctx.globalAlpha = m.a * (0.35 + depth * 0.9);
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    })();

    // Cardúmenes de peces que cruzan de vez en cuando por detrás del contenido
    const pez = '<svg viewBox="0 0 32 14"><path d="M1 7C7 0 17 0 23 7C17 14 7 14 1 7ZM22 7L31 1L29 7L31 13Z"/></svg>';
    function cardumen() {
      const c = document.createElement('div');
      const izq = Math.random() < 0.5;
      c.className = 'cardumen' + (izq ? ' izq' : '');
      c.style.top = (15 + Math.random() * 65) + 'vh';
      c.style.animationDuration = (16 + Math.random() * 10) + 's';
      c.innerHTML = Array.from({ length: 6 + Math.floor(Math.random() * 6) }, (_, i) =>
        `<i style="left:${(Math.random() * 120).toFixed(0)}px;top:${(Math.random() * 70).toFixed(0)}px;animation-delay:-${(Math.random() * 2).toFixed(2)}s;width:${(18 + Math.random() * 14).toFixed(0)}px">${pez}</i>`).join('');
      document.body.prepend(c);
      c.addEventListener('animationend', () => c.remove());
      setTimeout(cardumen, 18000 + Math.random() * 20000);
    }
    setTimeout(cardumen, 6000);

    // Estela de burbujas detrás del cursor
    if (matchMedia('(hover: hover)').matches) {
      let lx = 0, ly = 0, lt = 0;
      addEventListener('pointermove', e => {
        const now = performance.now();
        if (now - lt < 70 || Math.hypot(e.clientX - lx, e.clientY - ly) < 28) return;
        lt = now; lx = e.clientX; ly = e.clientY;
        bubbles.trail(e.clientX, e.clientY);
      }, { passive: true });
    }
  }

  // ---------- ONDAS EN LAS PORTADAS ----------
  function initOlas() {
    if (reduceMotion || !document.querySelector('.work-thumb, .site-grid')) return;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `<filter id="ola" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.035" numOctaves="2" seed="4" result="ruido"/>
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const turb = svg.querySelector('feTurbulence'), disp = svg.querySelector('feDisplacementMap');
    let raf = 0, img = null;

    document.addEventListener('pointerover', e => {
      const card = e.target.closest('.work');
      if (!card || card.contains(e.relatedTarget)) return;
      const next = card.querySelector('.work-thumb img');
      if (!next) return;
      if (img) img.style.filter = '';
      img = next; cancelAnimationFrame(raf);
      const start = performance.now(), dur = 1000;
      (function step(now) {
        const p = Math.min(1, (now - start) / dur), k = 1 - p;
        disp.setAttribute('scale', (26 * k * k).toFixed(2));
        turb.setAttribute('baseFrequency', `${(0.01 + 0.004 * Math.sin(p * 9)).toFixed(4)} ${(0.035 + 0.01 * Math.cos(p * 7)).toFixed(4)}`);
        img.style.filter = p < 1 ? 'url(#ola) saturate(1)' : '';
        if (p < 1) raf = requestAnimationFrame(step);
      })(start);
    });
  }

  // ---------- SONIDO DE AGUA (apagado por defecto, hecho con Web Audio: no pesa nada) ----------
  const sonido = (function () {
    let ctx = null, master = null, on = false, timer = 0;

    function start() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!master) {
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        // Rumor del fondo: ruido marrón filtrado
        const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
        const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
        const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
        lfo.frequency.value = 0.08; lfoGain.gain.value = 160; lfo.connect(lfoGain).connect(lp.frequency);
        const g = ctx.createGain(); g.gain.value = 0.5;
        src.connect(lp).connect(g).connect(master); src.start(); lfo.start();
      }
      ctx.resume();
      master.gain.setTargetAtTime(0.6, ctx.currentTime, 0.6);
      (function loop() { blip(true); timer = setTimeout(loop, 700 + Math.random() * 2600); })();
    }
    function stop() {
      clearTimeout(timer);
      if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    }
    function blip(soft) {
      if (!on || !ctx) return;
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      const f = 260 + Math.random() * 420;
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 3.2, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(soft ? 0.05 : 0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.14);
    }
    function boton() {
      const b = document.createElement('button');
      b.className = 'sound-btn'; b.type = 'button';
      const paint = () => {
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', on ? 'Apagar sonido de agua' : 'Activar sonido de agua');
        b.title = on ? 'Apagar sonido' : 'Sonido de agua';
        b.innerHTML = `<i class="fa-solid ${on ? 'fa-volume-high' : 'fa-volume-xmark'}" aria-hidden="true"></i>`;
      };
      b.addEventListener('click', () => { on = !on; on ? start() : stop(); paint(); });
      paint(); document.body.appendChild(b);
    }
    // Ping de sonar con eco, al cambiar de sección
    function ping() {
      if (!on || !ctx) return;
      [0, 0.32, 0.64].forEach((d, i) => {
        const t = ctx.currentTime + d, o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(1180, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07 / (i * 2.2 + 1), t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g).connect(master); o.start(t); o.stop(t + 0.65);
      });
    }
    return { boton, ping, blip: () => blip(false) };
  })();

  // ---------- ANALYTICS (sin cookies). Uso desde las tools: window.majaguaTrack('paletas-pdf') ----------
  window.majaguaTrack = function (name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'evento/' + name, title: name, event: true }); } catch (e) {}
  };
  if (GOATCOUNTER_CODE && location.protocol.startsWith('http') && !/^(localhost|127\.)/.test(location.hostname)) {
    const gc = document.createElement('script');
    gc.async = true; gc.src = 'https://gc.zgo.at/count.js';
    gc.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    document.head.appendChild(gc);
  }
})();
