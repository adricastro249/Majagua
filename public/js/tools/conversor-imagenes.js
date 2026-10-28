// ==========================================
// CONVERSOR Y COMPRESOR DE IMÁGENES
// JPEG, PNG y WebP los resuelve el navegador. TIFF usa UTIF.js, que se carga solo si hace falta.
// Todo pasa en el navegador: no se sube nada a ningún servidor.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const drop = $('dropZone'), input = $('fileInput'), list = $('results');
    const format = $('format'), quality = $('quality'), qualityOut = $('qualityOut');
    const preset = $('preset'), maxW = $('maxW'), maxH = $('maxH'), bg = $('bgColor');
    const zipBtn = $('zipBtn'), clearBtn = $('clearBtn'), summary = $('summary');

    const PRESETS = {
        original: null,
        web: { w: 1920, h: 1920, fit: 'contain' },
        youtube: { w: 1280, h: 720, fit: 'cover', maxBytes: 2 * 1024 * 1024 },
        instagram: { w: 1080, h: 1350, fit: 'cover' },
        historia: { w: 1080, h: 1920, fit: 'cover' },
        custom: 'custom'
    };
    const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/tiff': 'tif' };

    let items = [];        // { file, blob, name, url }
    let utifPromise = null;

    const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(2) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

    function loadUTIF() {
        if (window.UTIF) return Promise.resolve();
        if (!utifPromise) utifPromise = new Promise((ok, fail) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js';
            s.onload = ok; s.onerror = () => fail(new Error('No se pudo cargar el lector de TIFF. Revisa tu conexión.'));
            document.head.appendChild(s);
        });
        return utifPromise;
    }

    const isTiff = (f) => /\.tiff?$/i.test(f.name) || f.type === 'image/tiff';

    // Devuelve un canvas con la imagen original
    async function decode(file) {
        if (isTiff(file)) {
            await loadUTIF();
            const buf = await file.arrayBuffer();
            const ifds = UTIF.decode(buf);
            UTIF.decodeImage(buf, ifds[0]);
            const rgba = UTIF.toRGBA8(ifds[0]);
            const c = document.createElement('canvas');
            c.width = ifds[0].width; c.height = ifds[0].height;
            c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer), c.width, c.height), 0, 0);
            return c;
        }
        const bmp = await createImageBitmap(file);
        const c = document.createElement('canvas');
        c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        bmp.close && bmp.close();
        return c;
    }

    function targetSize(w, h) {
        let p = PRESETS[preset.value];
        if (p === 'custom') p = { w: Number(maxW.value) || w, h: Number(maxH.value) || h, fit: 'contain' };
        if (!p) return { w, h, sx: 0, sy: 0, sw: w, sh: h };
        if (p.fit === 'cover') {
            const scale = Math.max(p.w / w, p.h / h);
            const sw = p.w / scale, sh = p.h / scale;
            return { w: p.w, h: p.h, sx: (w - sw) / 2, sy: (h - sh) / 2, sw, sh };
        }
        const scale = Math.min(1, p.w / w, p.h / h);   // nunca agranda
        return { w: Math.round(w * scale), h: Math.round(h * scale), sx: 0, sy: 0, sw: w, sh: h };
    }

    function toBlob(canvas, type, q) {
        if (type === 'image/tiff') {
            const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            return Promise.resolve(new Blob([UTIF.encodeImage(d.buffer, canvas.width, canvas.height)], { type }));
        }
        return new Promise(ok => canvas.toBlob(ok, type, q));
    }

    async function convert(file) {
        const type = format.value;
        if (type === 'image/tiff') await loadUTIF();
        const src = await decode(file);
        const t = targetSize(src.width, src.height);
        const out = document.createElement('canvas');
        out.width = t.w; out.height = t.h;
        const ctx = out.getContext('2d');
        if (type === 'image/jpeg') { ctx.fillStyle = bg.value; ctx.fillRect(0, 0, t.w, t.h); }  // JPEG no tiene transparencia
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, t.sx, t.sy, t.sw, t.sh, 0, 0, t.w, t.h);

        let q = Number(quality.value) / 100;
        let blob = await toBlob(out, type, q);
        // Miniatura de YouTube: baja la calidad hasta entrar en 2 MB
        const p = PRESETS[preset.value];
        if (p && p.maxBytes && type !== 'image/png' && type !== 'image/tiff') {
            while (blob.size > p.maxBytes && q > 0.4) { q -= 0.05; blob = await toBlob(out, type, q); }
        }
        return { blob, w: t.w, h: t.h };
    }

    function row(file) {
        const li = document.createElement('li');
        li.className = 'conv-item';
        li.innerHTML = `<span class="conv-thumb"></span>
            <span class="conv-info"><b></b><span class="conv-meta">Convirtiendo…</span></span>
            <a class="btn-primary conv-dl" hidden><i class="fas fa-download" aria-hidden="true"></i> Descargar</a>`;
        li.querySelector('b').textContent = file.name;
        list.appendChild(li);
        return li;
    }

    async function process(files) {
        const valid = [...files].filter(f => f.type.startsWith('image/') || isTiff(f));
        for (const file of valid) {
            const li = row(file);
            try {
                const { blob, w, h } = await convert(file);
                const name = file.name.replace(/\.[^.]+$/, '') + '.' + EXT[format.value];
                const url = URL.createObjectURL(blob);
                items.push({ file, blob, name, url });
                const diff = Math.round((1 - blob.size / file.size) * 100);
                li.querySelector('.conv-thumb').innerHTML = format.value === 'image/tiff' ? '<i class="fas fa-image"></i>' : `<img src="${url}" alt="">`;
                li.querySelector('.conv-meta').innerHTML =
                    `${w}×${h} · ${fmtSize(file.size)} → <strong>${fmtSize(blob.size)}</strong> ` +
                    `<span class="${diff >= 0 ? 'conv-ok' : 'conv-up'}">${diff >= 0 ? '−' + diff : '+' + Math.abs(diff)}%</span>`;
                const a = li.querySelector('.conv-dl');
                a.href = url; a.download = name; a.hidden = false;
            } catch (err) {
                li.querySelector('.conv-meta').textContent = 'No se pudo convertir: ' + (err.message || 'formato no soportado por el navegador') + '.';
                li.classList.add('conv-error');
            }
        }
        updateSummary();
        window.majaguaTrack && window.majaguaTrack('conversor-imagenes');
    }

    function updateSummary() {
        zipBtn.disabled = items.length < 2;
        clearBtn.hidden = !items.length;
        if (!items.length) { summary.textContent = ''; return; }
        const before = items.reduce((s, i) => s + i.file.size, 0), after = items.reduce((s, i) => s + i.blob.size, 0);
        summary.textContent = `${items.length} ${items.length === 1 ? 'imagen' : 'imágenes'}: ${fmtSize(before)} → ${fmtSize(after)}.`;
    }

    zipBtn.addEventListener('click', async () => {
        zipBtn.disabled = true; zipBtn.textContent = 'Armando ZIP…';
        const zip = new JSZip();
        const used = {};
        items.forEach(i => {
            let n = i.name;
            if (used[n]) n = n.replace(/(\.\w+)$/, `-${++used[n]}$1`); else used[n] = 1;
            zip.file(n, i.blob);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'imagenes-majagua.zip'; a.click();
        zipBtn.innerHTML = '<i class="fas fa-file-zipper" aria-hidden="true"></i> Descargar todo en ZIP';
        zipBtn.disabled = false;
    });

    clearBtn.addEventListener('click', () => {
        items.forEach(i => URL.revokeObjectURL(i.url));
        items = []; list.innerHTML = ''; updateSummary();
    });

    // Controles que dependen del formato o del tamaño elegido
    function syncControls() {
        const lossy = format.value === 'image/jpeg' || format.value === 'image/webp';
        $('qualityGroup').hidden = !lossy;
        $('bgGroup').hidden = format.value !== 'image/jpeg';
        $('customGroup').hidden = preset.value !== 'custom';
        qualityOut.textContent = quality.value + '%';
    }
    [format, preset, quality].forEach(el => el.addEventListener('input', syncControls));
    syncControls();

    // Arrastrar y soltar
    input.addEventListener('change', () => { process(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => process(e.dataTransfer.files));
});
