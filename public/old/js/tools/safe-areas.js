// ==========================================
// SAFE AREAS PARA CINE, TV Y REDES
// Las zonas de redes están definidas sobre un cuadro de 1080×1920 y se escalan al tamaño del fotograma.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const canvas = $('safeCanvas');
    const ctx = canvas.getContext('2d');

    // type 'inset': rectángulos centrados (porcentaje del cuadro)
    // type 'ui': márgenes en px sobre 1080×1920 + zonas extra tapadas por botones
    // type 'crop': recorte centrado a otra proporción
    const GUIDES = [
        { id: 'smpte', label: 'Cine / TV · SMPTE (acción 93%, títulos 90%)', color: '#00e5ff', type: 'inset', boxes: [[0.93, 'Acción'], [0.90, 'Títulos']], on: true },
        { id: 'classic', label: 'TV clásico (acción 90%, títulos 80%)', color: '#ffd600', type: 'inset', boxes: [[0.90, 'Acción'], [0.80, 'Títulos']] },
        { id: 'reels', label: 'Instagram Reels', color: '#ff4081', type: 'ui', vertical: true, on: true,
          margins: { top: 270, bottom: 670, left: 65, right: 65 }, extra: [{ x: 850, y: 1150, w: 230, h: 770, label: 'Botones' }] },
        { id: 'stories', label: 'Instagram Stories', color: '#e040fb', type: 'ui', vertical: true,
          margins: { top: 250, bottom: 250, left: 0, right: 0 } },
        { id: 'tiktok', label: 'TikTok', color: '#69f0ae', type: 'ui', vertical: true,
          margins: { top: 108, bottom: 370, left: 60, right: 120 } },
        { id: 'shorts', label: 'YouTube Shorts', color: '#ff5252', type: 'ui', vertical: true,
          margins: { top: 120, bottom: 360, left: 0, right: 96 } },
        { id: 'grid34', label: 'Recorte de grilla de perfil Instagram (3:4)', color: '#ffffff', type: 'crop', ratio: 3 / 4 },
        { id: 'crop45', label: 'Recorte 4:5 (feed)', color: '#b0bec5', type: 'crop', ratio: 4 / 5 },
        { id: 'crop11', label: 'Recorte 1:1', color: '#90a4ae', type: 'crop', ratio: 1 },
        { id: 'thirds', label: 'Regla de tercios y centro', color: '#ffffff', type: 'thirds' }
    ];

    let image = null;
    let W = 1080, H = 1920;

    // Lista de checkboxes
    $('guideList').innerHTML = GUIDES.map(g =>
        `<label><input type="checkbox" value="${g.id}"${g.on ? ' checked' : ''}>
         <span class="swatch" style="background:${g.color}"></span>${g.label}</label>`).join('');

    const active = () => GUIDES.filter(g => $('guideList').querySelector(`input[value="${g.id}"]`).checked);

    // ---------- Dibujo ----------
    function drawGuides(c, w, h, shade) {
        const s = Math.max(w, h) / 1080;               // grosor de línea y texto proporcional
        const line = Math.max(2, Math.round(2 * s));
        const font = Math.round(18 * s);
        c.font = `700 ${font}px Montserrat, Arial, sans-serif`;
        c.textBaseline = 'top';
        let labelRow = 0;                               // cada guía pone su etiqueta un renglón más abajo
        const nextRow = () => (labelRow++) * (font + 14 * s);

        const label = (text, x, y, color) => {
            const pad = 4 * s, tw = c.measureText(text).width;
            c.fillStyle = 'rgba(0,0,0,0.6)';
            c.fillRect(x, y, tw + pad * 2, font + pad * 2);
            c.fillStyle = color;
            c.fillText(text, x + pad, y + pad);
        };

        const shadeOutside = (x, y, rw, rh) => {
            if (!shade) return;
            c.save();
            c.fillStyle = `rgba(0,0,0,${shade})`;
            c.beginPath();
            c.rect(0, 0, w, h);
            c.rect(x, y, rw, rh);
            c.fill('evenodd');
            c.restore();
        };

        active().forEach(g => {
            c.strokeStyle = g.color;
            c.lineWidth = line;
            c.setLineDash([]);

            if (g.type === 'inset') {
                g.boxes.forEach(([pct, name], i) => {
                    const bw = w * pct, bh = h * pct, x = (w - bw) / 2, y = (h - bh) / 2;
                    if (i === g.boxes.length - 1) shadeOutside(x, y, bw, bh);
                    c.setLineDash(i === 0 ? [] : [10 * s, 6 * s]);
                    c.strokeRect(x, y, bw, bh);
                    label(`${name} ${Math.round(pct * 100)}%`, x + 6 * s, y + 6 * s + nextRow(), g.color);
                });
            }

            if (g.type === 'ui') {
                const kx = w / 1080, ky = h / 1920;
                const m = g.margins;
                const x = m.left * kx, y = m.top * ky;
                const rw = w - (m.left + m.right) * kx, rh = h - (m.top + m.bottom) * ky;
                shadeOutside(x, y, rw, rh);
                c.strokeRect(x, y, rw, rh);
                label(g.label, x + 6 * s, y + 6 * s + nextRow(), g.color);
                (g.extra || []).forEach(e => {
                    c.save();
                    if (shade) { c.fillStyle = `rgba(0,0,0,${shade})`; c.fillRect(e.x * kx, e.y * ky, e.w * kx, e.h * ky); }
                    c.setLineDash([8 * s, 6 * s]);
                    c.strokeRect(e.x * kx, e.y * ky, e.w * kx, e.h * ky);
                    c.restore();
                });
            }

            if (g.type === 'crop') {
                let cw = w, ch = w / g.ratio;
                if (ch > h) { ch = h; cw = h * g.ratio; }
                const x = (w - cw) / 2, y = (h - ch) / 2;
                c.setLineDash([14 * s, 8 * s]);
                c.strokeRect(x, y, cw, ch);
                label(g.label.replace(/ \(.*\)$/, ''), x + 6 * s, y + ch - font - 20 * s, g.color);
            }

            if (g.type === 'thirds') {
                c.globalAlpha = 0.6;
                c.lineWidth = Math.max(1, line / 2);
                [1, 2].forEach(i => {
                    c.beginPath(); c.moveTo(w * i / 3, 0); c.lineTo(w * i / 3, h); c.stroke();
                    c.beginPath(); c.moveTo(0, h * i / 3); c.lineTo(w, h * i / 3); c.stroke();
                });
                const cs = 20 * s;
                c.beginPath(); c.moveTo(w / 2 - cs, h / 2); c.lineTo(w / 2 + cs, h / 2);
                c.moveTo(w / 2, h / 2 - cs); c.lineTo(w / 2, h / 2 + cs); c.stroke();
                c.globalAlpha = 1;
            }
        });
    }

    function drawBackground(c, w, h) {
        if (image) { c.drawImage(image, 0, 0, w, h); return; }
        // Fondo neutro con cuadrícula para cuando no hay imagen
        c.fillStyle = '#2b3a42';
        c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255,255,255,0.06)';
        c.lineWidth = 1;
        const step = Math.max(w, h) / 24;
        for (let x = 0; x < w; x += step) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
        for (let y = 0; y < h; y += step) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    }

    function render() {
        canvas.width = W;
        canvas.height = H;
        drawBackground(ctx, W, H);
        drawGuides(ctx, W, H, Number($('shadeOpacity').value) / 100);

        const isVertical = H > W;
        const warn = active().some(g => g.vertical) && !isVertical;
        $('safeLegend').innerHTML = `<li>${W}×${H} px</li>` +
            (warn ? '<li class="warn">Las guías de redes están pensadas para video vertical 9:16.</li>' : '');
    }

    // ---------- Eventos ----------
    $('frameUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => { image = img; W = img.naturalWidth; H = img.naturalHeight; render(); URL.revokeObjectURL(img.src); };
        img.src = URL.createObjectURL(file);
    });

    $('frameSize').addEventListener('change', () => {
        image = null;
        $('frameUpload').value = '';
        [W, H] = $('frameSize').value.split('x').map(Number);
        render();
    });

    $('guideList').addEventListener('change', render);
    $('shadeOpacity').addEventListener('input', render);

    function download(withImage) {
        const out = document.createElement('canvas');
        out.width = W; out.height = H;
        const c = out.getContext('2d');
        if (withImage) drawBackground(c, W, H);
        drawGuides(c, W, H, withImage ? Number($('shadeOpacity').value) / 100 : 0.35);
        const a = document.createElement('a');
        a.download = `safe-areas-${W}x${H}${withImage ? '' : '-overlay'}.png`;
        a.href = out.toDataURL('image/png');
        a.click();
        if (window.majaguaTrack) window.majaguaTrack(withImage ? 'safe-areas-png' : 'safe-areas-overlay');
    }

    $('downloadOverlay').addEventListener('click', () => download(false));
    $('downloadComposite').addEventListener('click', () => download(true));

    [W, H] = $('frameSize').value.split('x').map(Number);
    render();
});
