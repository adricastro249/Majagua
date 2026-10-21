// ==========================================
// MAJAGUA PRODUCCIONES - PIEZAS COMPARTIDAS (menú, encabezado de tools y footer)
//
// Para cambiar el menú, el footer o la lista de tools en TODO el sitio, se edita solo este archivo.
//
// Uso en cada página:
//   <nav data-layout="nav"></nav>
//   <script src="js/layout.js"></script>            (justo después del nav; en /tools/ es ../js/layout.js)
//   <header data-layout="tools-hero"></header>      (solo en páginas de tools)
//   <div data-layout="footer"></div>                (opcional: data-owner="adriana" o "mariana")
// ==========================================

(function () {

    // ------------------------------------------
    // CONFIGURACIÓN
    // ------------------------------------------
    const CONTACT_EMAIL = 'produccionesmajagua@gmail.com';
    const CONTACT_SUBJECT = 'Consulta desde la web';

    // Analytics (GoatCounter): crear la cuenta en https://www.goatcounter.com y poner acá el código.
    // Ej: si tu panel es https://majagua.goatcounter.com, el código es 'majagua'. Vacío = desactivado.
    const GOATCOUNTER_CODE = '';

    // Lista de tools: se usa para el menú desplegable de todas las páginas.
    const TOOLS = [
        ['tools/timecode.html', 'Calculadora de timecode'],
        ['tools/peso-exportacion.html', 'Peso de exportación'],
        ['tools/aspect-ratio.html', 'Simulador de Aspect Ratio'],
        ['tools/safe-areas.html', 'Safe areas y redes'],
        ['tools/paletas.html', 'Creador de paletas'],
        ['tools/conver-sub.html', 'Conversor de subtítulos'],
        ['tools/marcadores-resolve.html', 'Marcadores de Resolve a notas'],
        ['tools/dcp-name-generator.html', 'Generador de nombres DCP']
    ];

    const FOOTERS = {
        default: {
            location: true,
            links: [
                ['fab fa-instagram', 'https://www.instagram.com/majaguaproducciones', 'Instagram de Majagua'],
                ['fas fa-envelope', 'mailto', 'Escribinos un mail']
            ],
            copy: '&copy; 2026 Majagua Producciones. Hecho a mano con HTML/CSS/JS.'
        },
        adriana: {
            links: [
                ['fab fa-instagram', 'https://www.instagram.com/adricastro249', 'Instagram de Adriana'],
                ['fab fa-linkedin', 'https://www.linkedin.com/in/adricastro249/', 'LinkedIn de Adriana'],
                ['fab fa-github', 'https://github.com/adricastro249/', 'GitHub de Adriana'],
                ['fab fa-vimeo', 'https://vimeo.com/adricastro249', 'Vimeo de Adriana']
            ],
            copy: '&copy; 2026. Portfolio de Adriana Castro.'
        },
        mariana: {
            links: [
                ['fab fa-instagram', 'https://www.instagram.com/marianarojasba', 'Instagram de Mariana'],
                ['fab fa-linkedin', 'https://www.linkedin.com/in/marianarojasbarroso/', 'LinkedIn de Mariana']
            ],
            copy: '&copy; 2026. Portfolio de Mariana Rojas Barroso.'
        }
    };

    // ------------------------------------------
    // RUTAS: todo se arma relativo a la raíz del sitio (funciona en la web y abriendo los archivos local)
    // ------------------------------------------
    const script = document.currentScript;
    const ROOT = new URL('..', script.src).href;            // .../public/
    const url = (path) => new URL(path, ROOT).href;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`;
    const here = location.href.split('#')[0].split('?')[0];
    const isCurrent = (path) => here === url(path) || (path === 'index.html' && here === ROOT);

    // ------------------------------------------
    // MENÚ
    // ------------------------------------------
    function navHTML() {
        const link = (path, label) =>
            `<li><a href="${url(path)}"${isCurrent(path) ? ' aria-current="page"' : ''}>${label}</a></li>`;
        const toolLinks = TOOLS.map(([path, label]) =>
            `<a href="${url(path)}"${isCurrent(path) ? ' aria-current="page"' : ''}>${label}</a>`).join('\n');

        return `
        <div class="logo"><a href="${url('index.html')}">MAJAGUA PRODUCCIONES<span>.</span></a></div>

        <button class="hamburger" type="button" aria-label="Abrir menú" aria-expanded="false">
            <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </button>

        <ul class="nav-links">
            ${link('index.html', 'Inicio')}
            <li><a href="${url('index.html#team')}">Nosotras</a></li>
            <li><a href="${url('index.html#ecosistema')}">Ecosistema</a></li>
            ${link('portfolio-web.html', 'Portafolio Web')}
            <li class="dropdown">
                <a href="${url('tools.html')}" class="dropbtn">Tools <i class="fas fa-caret-down"></i></a>
                <div class="dropdown-content">${toolLinks}</div>
            </li>
            <li><a href="${mailto}" class="btn-contact">Contacto</a></li>
        </ul>`;
    }

    // ------------------------------------------
    // ENCABEZADO DE LAS PÁGINAS DE TOOLS
    // ------------------------------------------
    function toolsHeroHTML() {
        return `
        <div class="hero-content">
            <h1><i class="fas fa-laptop-code"></i> MAJAGUA TOOLS</h1>
            <p>Herramientas de automatización y flujo de trabajo</p>
            <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">Optimizadas para Post-Producción</p>
            <a href="${url('tools.html')}" class="back-btn">&larr; Ver todas las tools</a>
        </div>`;
    }

    // ------------------------------------------
    // FOOTER
    // ------------------------------------------
    function footerHTML(owner) {
        const f = FOOTERS[owner] || FOOTERS.default;
        const links = f.links.map(([icon, href, label]) => {
            const isMail = href === 'mailto';
            return `<a href="${isMail ? mailto : href}"${isMail ? '' : ' target="_blank" rel="noopener"'} aria-label="${label}"><i class="${icon}"></i></a>`;
        }).join('\n');

        return `
        <div class="footer-deco">
            <img loading="lazy" src="${url('css/img/Footer5_Majagua.webp')}" alt="">
        </div>
        <footer>
            <div class="footer-content">
                <h3>MAJAGUA PRODUCCIONES</h3>
                ${f.location ? '<p>Buenos Aires, Argentina</p>' : ''}
                <div class="footer-links">${links}</div>
                <p class="copy">${f.copy}</p>
            </div>
        </footer>`;
    }

    // ------------------------------------------
    // INSERTAR
    // ------------------------------------------
    function render() {
        document.querySelectorAll('[data-layout]:not([data-rendered])').forEach(el => {
            const type = el.dataset.layout;
            if (type === 'nav') el.innerHTML = navHTML();
            else if (type === 'tools-hero') { el.classList.add('tools-hero'); el.innerHTML = toolsHeroHTML(); }
            else if (type === 'footer') el.outerHTML = footerHTML(el.dataset.owner);
            else return;
            el.dataset.rendered = '';
        });

        // Cualquier otro botón "mailto" del sitio también lleva el asunto
        document.querySelectorAll(`a[href="mailto:${CONTACT_EMAIL}"]`).forEach(a => { a.href = mailto; });
    }

    render();                                                   // el menú aparece apenas se lee el script
    document.addEventListener('DOMContentLoaded', render);      // el resto (hero y footer) cuando carga la página

    // ------------------------------------------
    // ANALYTICS (sin cookies). Uso desde las tools: window.majaguaTrack('paletas-pdf')
    // ------------------------------------------
    window.majaguaTrack = function (eventName) {
        try {
            if (window.goatcounter && window.goatcounter.count) {
                window.goatcounter.count({ path: 'evento/' + eventName, title: eventName, event: true });
            }
        } catch (e) { /* analytics nunca debe romper una tool */ }
    };

    if (GOATCOUNTER_CODE && location.protocol.startsWith('http') && !/^(localhost|127\.)/.test(location.hostname)) {
        const gc = document.createElement('script');
        gc.async = true;
        gc.src = 'https://gc.zgo.at/count.js';
        gc.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
        document.head.appendChild(gc);
    }
})();
