// ==========================================
// MAJAGUA TOOLS - LIBRERÍA DE TIMECODE (compartida por varias tools)
// Soporta drop-frame (29.97 / 59.94 DF) con el algoritmo estándar SMPTE.
// ==========================================

window.MajaguaTC = (function () {

    const RATES = {
        '23.976': { label: '23.976', fps: 24000 / 1001, nominal: 24, drop: 0 },
        '24': { label: '24', fps: 24, nominal: 24, drop: 0 },
        '25': { label: '25 (PAL)', fps: 25, nominal: 25, drop: 0 },
        '29.97DF': { label: '29.97 DF (drop-frame)', fps: 30000 / 1001, nominal: 30, drop: 2 },
        '29.97': { label: '29.97 NDF', fps: 30000 / 1001, nominal: 30, drop: 0 },
        '30': { label: '30', fps: 30, nominal: 30, drop: 0 },
        '48': { label: '48', fps: 48, nominal: 48, drop: 0 },
        '50': { label: '50', fps: 50, nominal: 50, drop: 0 },
        '59.94DF': { label: '59.94 DF (drop-frame)', fps: 60000 / 1001, nominal: 60, drop: 4 },
        '59.94': { label: '59.94 NDF', fps: 60000 / 1001, nominal: 60, drop: 0 },
        '60': { label: '60', fps: 60, nominal: 60, drop: 0 }
    };

    const pad = (n, l = 2) => String(n).padStart(l, '0');

    function fillSelect(select, defaultKey = '24') {
        Object.entries(RATES).forEach(([key, r]) => select.add(new Option(r.label, key)));
        select.value = defaultKey;
    }

    // Frames -> "HH:MM:SS:FF" (o "HH:MM:SS;FF" en drop-frame)
    function framesToTC(frames, key) {
        const r = RATES[key];
        const negative = frames < 0;
        let f = Math.abs(Math.round(frames));

        if (r.drop) {
            const d = r.drop;
            const per10 = r.nominal * 600 - 9 * d;
            const perMin = r.nominal * 60 - d;
            const tens = Math.floor(f / per10);
            const rest = f % per10;
            f += 9 * d * tens + (rest > d ? d * Math.floor((rest - d) / perMin) : 0);
        }

        const ff = f % r.nominal;
        const totalSec = Math.floor(f / r.nominal);
        const tc = `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor(totalSec / 60) % 60)}:${pad(totalSec % 60)}${r.drop ? ';' : ':'}${pad(ff)}`;
        return (negative ? '-' : '') + tc;
    }

    // "01:00:00:00", "01;00;00;00", "1:2:3:4" o solo números estilo Resolve ("1000" = 00:00:10:00)
    // Devuelve { frames } o { error }
    function tcToFrames(text, key) {
        const r = RATES[key];
        let s = String(text || '').trim();
        if (!s) return { error: 'Vacío' };

        let negative = false;
        if (s[0] === '-') { negative = true; s = s.slice(1).trim(); }

        let parts;
        if (/^\d+$/.test(s)) {
            if (s.length > 8) return { error: 'Demasiados dígitos' };
            const p = s.padStart(8, '0');
            parts = [p.slice(0, 2), p.slice(2, 4), p.slice(4, 6), p.slice(6, 8)];
        } else {
            parts = s.split(/[:;.,]/);
            if (parts.length > 4 || parts.some(x => !/^\d+$/.test(x))) return { error: 'Formato inválido' };
            while (parts.length < 4) parts.unshift('0');
        }

        const [h, m, sec, ff] = parts.map(Number);
        if (m > 59 || sec > 59) return { error: 'Minutos y segundos van de 00 a 59' };
        if (ff >= r.nominal) return { error: `A ${r.label} los frames van de 00 a ${pad(r.nominal - 1)}` };
        if (r.drop && sec === 0 && m % 10 !== 0 && ff < r.drop) {
            return { error: `En drop-frame no existe ${pad(h)}:${pad(m)}:00;${pad(ff)}: esos frames se saltean al comenzar cada minuto (salvo cada 10)` };
        }

        let frames = (h * 3600 + m * 60 + sec) * r.nominal + ff;
        if (r.drop) {
            const totalMin = h * 60 + m;
            frames -= r.drop * (totalMin - Math.floor(totalMin / 10));
        }
        return { frames: negative ? -frames : frames };
    }

    // Duración real en reloj (importante en 23.976 / 29.97, donde el TC no coincide con el reloj)
    function framesToClock(frames, key) {
        const totalMs = Math.round(Math.abs(frames) / RATES[key].fps * 1000);
        const h = Math.floor(totalMs / 3600000);
        const m = Math.floor(totalMs / 60000) % 60;
        const s = Math.floor(totalMs / 1000) % 60;
        const ms = totalMs % 1000;
        return `${frames < 0 ? '-' : ''}${h}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
    }

    // "mm:ss" o "h:mm:ss" para mandar a un cliente (Vimeo, YouTube, Frame.io)
    function framesToShort(frames, key) {
        const total = Math.floor(Math.abs(frames) / RATES[key].fps);
        const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, s = total % 60;
        return (frames < 0 ? '-' : '') + (h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
    }

    return { RATES, fillSelect, framesToTC, tcToFrames, framesToClock, framesToShort };
})();
