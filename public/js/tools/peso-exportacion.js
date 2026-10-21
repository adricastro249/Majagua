// ==========================================
// CALCULADORA DE PESO DE EXPORTACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // Bitrates de referencia en Mbps para 1920×1080 a 29.97 fps (Apple ProRes White Paper / Avid DNxHR).
    // Se escalan en forma proporcional a los píxeles y al frame rate.
    const CODECS = {
        'prores-proxy': { name: 'ProRes 422 Proxy', base: 45 },
        'prores-lt': { name: 'ProRes 422 LT', base: 102 },
        'prores-422': { name: 'ProRes 422', base: 147 },
        'prores-hq': { name: 'ProRes 422 HQ', base: 220 },
        'prores-4444': { name: 'ProRes 4444', base: 330 },
        'prores-xq': { name: 'ProRes 4444 XQ', base: 500 },
        'dnxhr-lb': { name: 'DNxHR LB', base: 45 },
        'dnxhr-sq': { name: 'DNxHR SQ', base: 145 },
        'dnxhr-hq': { name: 'DNxHR HQ', base: 220 },
        'dnxhr-hqx': { name: 'DNxHR HQX', base: 220 },
        'dnxhr-444': { name: 'DNxHR 444', base: 440 },
        'dcp': { name: 'DCP JPEG 2000 (máx.)', fixed: 250 },
        'h264': { name: 'H.264', custom: true },
        'h265': { name: 'H.265 / HEVC', custom: true },
        'v210': { name: 'Sin compresión v210', bitsPerPixel: 128 / 6 }
    };

    const BITRATE_HINTS = {
        h264: 'Referencia: YouTube 1080p 8 Mbps · Vimeo 1080p 10–20 Mbps · 4K 35–45 Mbps · screener 8–12 Mbps.',
        h265: 'H.265 logra calidad similar a H.264 con cerca de la mitad del bitrate. Referencia 4K: 20–30 Mbps.'
    };

    const BASE_PIXELS = 1920 * 1080;
    const BASE_FPS = 30000 / 1001;

    function fpsValue() {
        const v = $('fps').value;
        return { '23.976': 24000 / 1001, '29.97': 30000 / 1001, '59.94': 60000 / 1001 }[v] || Number(v);
    }

    function resolution() {
        if ($('resolution').value === 'custom') return [Number($('resW').value) || 0, Number($('resH').value) || 0];
        return $('resolution').value.split('x').map(Number);
    }

    // "1:30:00", "90:00", "45" (minutos) -> segundos
    function durationSeconds() {
        const raw = $('duration').value.trim();
        if (!raw) return 0;
        const parts = raw.split(':').map(Number);
        if (parts.some(n => !Number.isFinite(n) || n < 0)) return NaN;
        if (parts.length === 1) return parts[0] * 60;
        return parts.reduce((acc, n) => acc * 60 + n, 0);
    }

    function videoMbps(key, w, h, fps) {
        const c = CODECS[key];
        if (c.custom) return Number($('bitrate').value) || 0;
        if (c.fixed) return c.fixed;
        if (c.bitsPerPixel) return w * h * fps * c.bitsPerPixel / 1e6;
        return c.base * (w * h / BASE_PIXELS) * (fps / BASE_FPS);
    }

    function audioMbps() {
        const ch = Number($('audioChannels').value);
        if (!ch) return 0;
        return $('audioType').value === 'aac' ? 0.32 : ch * 48000 * 24 / 1e6;
    }

    const fmtGB = (gb) => gb >= 1000 ? `${(gb / 1000).toFixed(2)} TB` : gb >= 10 ? `${gb.toFixed(1)} GB` : `${gb.toFixed(2)} GB`;
    const gbFor = (mbps, seconds) => mbps * seconds / 8 / 1000; // Mbps -> GB (decimal)

    function update() {
        const key = $('codec').value;
        const c = CODECS[key];
        const [w, h] = resolution();
        const fps = fpsValue();
        const seconds = durationSeconds();

        $('bitrateGroup').hidden = !c.custom;
        $('bitrateHint').textContent = BITRATE_HINTS[key] || '';
        $('customRes').hidden = $('resolution').value !== 'custom';
        $('duration').classList.toggle('invalid', Number.isNaN(seconds));
        if (Number.isNaN(seconds)) return;

        const vMbps = videoMbps(key, w, h, fps);
        const aMbps = audioMbps();
        const total = vMbps + aMbps;
        const gb = gbFor(total, seconds);

        $('sizeGB').textContent = fmtGB(gb);
        $('sizeSub').textContent = `${(gb * 1e9 / 2 ** 30).toFixed(1)} GiB en Windows · ${fmtGB(gbFor(total, 60))} por minuto`;

        const rows = [
            ['Video', `${vMbps.toFixed(1)} Mbps`],
            ['Audio', aMbps ? `${aMbps.toFixed(2)} Mbps` : '—'],
            ['Total', `${total.toFixed(1)} Mbps · ${(total / 8).toFixed(1)} MB/s`],
            ['Por hora', fmtGB(gbFor(total, 3600))],
            ['Disco de 1 TB', `≈ ${(1000 / gbFor(total, 3600)).toFixed(1)} horas`],
            ['Disco de 4 TB', `≈ ${(4000 / gbFor(total, 3600)).toFixed(1)} horas`]
        ];
        if (key === 'dcp' && (w > 2048 || h > 1080)) rows.push(['Nota', 'En DCP el límite es 250 Mbps tanto en 2K como en 4K']);
        $('detailRows').innerHTML = rows.map(([k, v]) => `<tr><th>${k}</th><td class="num">${v}</td></tr>`).join('');

        // Tabla comparativa con todos los intermedios
        $('compareRows').innerHTML = Object.entries(CODECS)
            .filter(([, cc]) => !cc.custom || cc === c)
            .map(([k, cc]) => {
                const mb = videoMbps(k, w, h, fps) + aMbps;
                return `<tr${k === key ? ' class="highlight"' : ''}><td>${cc.name}</td>` +
                    `<td class="num">${mb.toFixed(0)}</td><td class="num">${fmtGB(gbFor(mb, 60))}</td>` +
                    `<td class="num">${fmtGB(gbFor(mb, 3600))}</td><td class="num">${fmtGB(gbFor(mb, seconds))}</td></tr>`;
            }).join('');
    }

    document.querySelector('.tool-wide').addEventListener('input', update);
    document.querySelector('.tool-wide').addEventListener('change', update);
    update();
});
