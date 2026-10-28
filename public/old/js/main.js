// ==========================================
// MAJAGUA PRODUCCIONES - JS COMÚN A TODAS LAS PÁGINAS
// (El código de cada tool vive en su propia página.)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // MENÚ HAMBURGUESA (MÓVIL)
    // ------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    if (hamburger && navMenu) {
        const setOpen = (open) => {
            hamburger.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
            hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        };

        hamburger.addEventListener('click', () => {
            setOpen(!navMenu.classList.contains('active'));
        });

        // Cerrar al elegir un link (menos "Tools", que abre el submenú)
        navMenu.querySelectorAll('a:not(.dropbtn)').forEach(link => {
            link.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
        });
    }

    // ------------------------------------------
    // FILTROS DE CATEGORÍAS (portafolio y perfiles)
    // Botones: <button class="filter-btn" data-filter="categoria">
    // Tarjetas: <div class="card categoria">
    // ------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.filter;

            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.card').forEach(card => {
                const visible = category === 'all' || card.classList.contains(category);
                card.style.display = visible ? '' : 'none';
            });
        });
    });
});
