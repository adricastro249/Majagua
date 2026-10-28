// ==========================================
// ALMACENAMIENTO DE RODAJE
// Cuántos TB hacen falta para el material de cámara, con copias de seguridad y margen,
// cuántos discos y cuánto tarda la descarga. Usa los mismos bitrates que la tool de peso.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // Mbps de referencia para 1920×1080 a 29.97 fps (Apple ProRes White Paper / Avid DNxHR), igual que peso-exportacion.js
    const BASE = {
        'prores-proxy': 45, 'prores-lt': 102, 'prores-422': 147, 'prores-hq': 220, 'prores-4444': 330, 'prores-xq': 500,
        'dnxhr-sq': 145, 'dnxhr-hq': 220, 'dnxhr-hqx': 220, 'dnxhr-444': 440
    };
    const BASE_PIXELS = 1920 * 1080, BASE_FPS = 30000 / 1001;
    const fps = () => ({ '23.976': 24000 / 1001, '29.97': 30000 / 1001, '59.94': 60000 / 1001 }[$('fps').value] || Number($('fps').value));

    function mbps() {
        const c = $('codec').value;
        if (c === 'custom-mbps') return Number($('customRate').value) || 0;
        if (c === 'custom-mbs') return (Number($('customRate').value) || 0) * 8;
        const [w, h] = $('resolution').value.split('x').map(Number);
        return BASE[c] * (w * h / BASE_PIXELS) * (fps() / BASE_FPS);
    }

    const tb = (bytes) => bytes / 1e12;
    const fmtTB = (b) => b >= 1e12 ? tb(b).toFixed(2) + ' TB' : (b / 1e9).toFixed(0) + ' GB';
    const fmtTime = (s) => {
        const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
        return h ? `${h} h ${m} min` : `${m} min`;
    };

    function calc() {
        const custom = $('codec').value.startsWith('custom');
        $('customGroup').hidden = !custom;
        $('resGroup').hidden = custom;
        $('customLabel').textContent = $('codec').value === 'custom-mbs' ? 'Velocidad de datos (MB/s)' : 'Bitrate (Mbps)';

        const rate = mbps();                                   // Mbps por cámara
        const cams = Number($('cams').value) || 1;
        const hours = Number($('hours').value) || 0;           // horas grabadas por cámara por día
        const days = Number($('days').value) || 1;
        const copies = Number($('copies').value) || 1;
        const margin = 1 + (Number($('margin').value) || 0) / 100;
        const disk = Number($('diskSize').value) * 1e12;
        const speed = Number($('speed').value) * 1e6;           // bytes por segundo

        const perDay = rate * 1e6 / 8 * hours * 3600 * cams;   // bytes de material original por día
        const original = perDay * days;
        const total = original * copies * margin;
        const disks = Math.ceil(original * margin / disk);     // discos por cada copia

        $('outTotal').textContent = fmtTB(total);
        $('outSub').textContent = `${copies} ${copies === 1 ? 'copia' : 'copias'} del material, con ${$('margin').value || 0} % de margen`;
        $('outRows').innerHTML = [
            ['Bitrate por cámara', `${rate.toFixed(0)} Mbps (${(rate / 8).toFixed(0)} MB/s)`],
            ['Por hora grabada', fmtTB(rate * 1e6 / 8 * 3600)],
            ['Material original por día', fmtTB(perDay)],
            ['Material original del rodaje', fmtTB(original)],
            [`Discos de ${$('diskSize').value} TB por copia`, `${disks} (${disks * copies} en total)`],
            ['Descarga diaria por copia', fmtTime(perDay / speed)]
        ].map(([k, v]) => `<tr><td>${k}</td><td class="num">${v}</td></tr>`).join('');
    }

    document.querySelectorAll('#calc input, #calc select').forEach(el => el.addEventListener('input', calc));
    calc();
});
