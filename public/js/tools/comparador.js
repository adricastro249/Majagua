// ==========================================
// COMPARADOR ANTES Y DESPUÉS
// Carga dos imágenes (por ejemplo, log y etalonado), compáralas con un deslizador
// y exporta la comparación en una imagen para mandársela al cliente.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const stage = $('stage'), before = $('imgBefore'), after = $('imgAfter'), handle = $('handle');
    const imgs = { a: null, b: null };
    let pos = 0.5;

    function load(which, file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            imgs[which] = img;
            (which === 'a' ? before : after).src = url;
            ready();
        };
        img.src = url;
    }
    $('fileA').addEventListener('change', e => load('a', e.target.files[0]));
    $('fileB').addEventListener('change', e => load('b', e.target.files[0]));

    function ready() {
        const ok = imgs.a && imgs.b;
        stage.hidden = !ok;
        $('emptyMsg').hidden = ok;
        $('exportBtn').disabled = !ok;
        if (ok) {
            stage.style.aspectRatio = `${imgs.a.naturalWidth} / ${imgs.a.naturalHeight}`;
            if (imgs.a.naturalWidth / imgs.a.naturalHeight !== imgs.b.naturalWidth / imgs.b.naturalHeight)
                $('statusMsg').textContent = 'Ojo: las dos imágenes no tienen la misma proporción; la segunda se ajusta a la primera.';
            set(pos);
        }
    }

    function set(p) {
        pos = Math.min(1, Math.max(0, p));
        stage.style.setProperty('--pos', (pos * 100) + '%');
        handle.setAttribute('aria-valuenow', Math.round(pos * 100));
    }

    // Arrastrar con mouse o dedo
    let drag = false;
    const move = (e) => {
        if (!drag) return;
        const r = stage.getBoundingClientRect();
        set((e.clientX - r.left) / r.width);
    };
    stage.addEventListener('pointerdown', e => { drag = true; stage.setPointerCapture(e.pointerId); move(e); });
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', () => { drag = false; });
    // Con teclado
    handle.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { set(pos - 0.02); e.preventDefault(); }
        if (e.key === 'ArrowRight') { set(pos + 0.02); e.preventDefault(); }
    });

    // Modo: deslizador o lado a lado
    $('mode').addEventListener('change', () => stage.classList.toggle('side', $('mode').value === 'side'));
    ['labelA', 'labelB'].forEach(id => $(id).addEventListener('input', () => {
        $(id === 'labelA' ? 'tagA' : 'tagB').textContent = $(id).value;
    }));

    // Exportar: corte en el punto del deslizador, o las dos imágenes lado a lado
    $('exportBtn').addEventListener('click', () => {
        const w = imgs.a.naturalWidth, h = imgs.a.naturalHeight, side = $('mode').value === 'side';
        const c = document.createElement('canvas');
        c.width = side ? w * 2 : w; c.height = h;
        const ctx = c.getContext('2d');
        if (side) {
            ctx.drawImage(imgs.a, 0, 0, w, h); ctx.drawImage(imgs.b, w, 0, w, h);
        } else {
            ctx.drawImage(imgs.b, 0, 0, w, h);
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w * pos, h); ctx.clip();
            ctx.drawImage(imgs.a, 0, 0, w, h); ctx.restore();
            ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(w * pos) - Math.max(1, w / 800), 0, Math.max(2, w / 400), h);
        }
        const fs = Math.round(h * 0.035), pad = fs * 0.5;
        ctx.font = `700 ${fs}px "Bricolage Grotesque", system-ui, sans-serif`; ctx.textBaseline = 'top';
        const tag = (t, x, alignRight) => {
            if (!t) return;
            const tw = ctx.measureText(t).width;
            const x0 = alignRight ? x - tw - pad * 3 : x + pad;
            ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x0, pad, tw + pad * 2, fs + pad * 1.4);
            ctx.fillStyle = '#fff'; ctx.fillText(t, x0 + pad, pad * 1.7);
        };
        tag($('labelA').value, 0, false);
        tag($('labelB').value, c.width, true);
        c.toBlob(b => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b); a.download = 'antes-despues.jpg'; a.click();
        }, 'image/jpeg', 0.92);
        window.majaguaTrack && window.majaguaTrack('comparador-export');
    });
});
