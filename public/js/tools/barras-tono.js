// ==========================================
// BARRAS DE COLOR Y TONO DE REFERENCIA
// Barras en PNG a la resolución elegida y tono en WAV (PCM 24 bits), generados en el navegador.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const canvas = $('barsCanvas'), ctx = canvas.getContext('2d');

    // ---------- BARRAS ----------
    const C75 = ['#BFBFBF', '#BFBF00', '#00BFBF', '#00BF00', '#BF00BF', '#BF0000', '#0000BF'];
    const C100 = ['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF00FF', '#FF0000', '#0000FF', '#000000'];

    function drawSMPTE(w, h) {
        const bw = w / 7;
        const h1 = Math.round(h * 0.67), h2 = Math.round(h * 0.08);
        C75.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(Math.round(i * bw), 0, Math.ceil(bw), h1); });
        // Franja invertida (castellations)
        ['#0000BF', '#131313', '#BF00BF', '#131313', '#00BFBF', '#131313', '#BFBFBF']
            .forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(Math.round(i * bw), h1, Math.ceil(bw), h2); });
        // Abajo: -I, blanco 100 %, +Q, negro y PLUGE (−4 %, 0 %, +4 %)
        const y = h1 + h2, hb = h - y, q = bw * 5 / 4;
        [['#00214C', q], ['#FFFFFF', q], ['#32006A', q], ['#131313', q]]
            .reduce((x, [c, wd]) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), y, Math.ceil(wd), hb); return x + wd; }, 0);
        const px = bw * 5, p = bw / 3;
        [['#090909', p], ['#131313', p], ['#1D1D1D', p], ['#131313', bw]]
            .reduce((x, [c, wd]) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), y, Math.ceil(wd), hb); return x + wd; }, px);
    }

    function drawEBU(w, h) {
        const bw = w / 8;
        C100.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(Math.round(i * bw), 0, Math.ceil(bw), h); });
    }

    function drawBars() {
        const [w, h] = $('resolution').value.split('x').map(Number);
        canvas.width = w; canvas.height = h;
        ($('barsType').value === 'ebu' ? drawEBU : drawSMPTE)(w, h);
        const label = $('barsLabel').value.trim();
        if (label) {
            const fs = Math.round(h * 0.045);
            ctx.font = `700 ${fs}px "Bricolage Grotesque", system-ui, sans-serif`;
            const tw = ctx.measureText(label).width, pad = fs * 0.6;
            ctx.fillStyle = 'rgba(0,0,0,.75)';
            ctx.fillRect((w - tw) / 2 - pad, h * 0.08, tw + pad * 2, fs * 1.7);
            ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
            ctx.fillText(label, w / 2, h * 0.08 + fs * 0.85);
        }
    }
    ['resolution', 'barsType', 'barsLabel'].forEach(id => $(id).addEventListener('input', drawBars));
    drawBars();

    $('barsDownload').addEventListener('click', () => {
        canvas.toBlob(b => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = `barras-${$('barsType').value}-${$('resolution').value}.png`; a.click();
        }, 'image/png');
        window.majaguaTrack && window.majaguaTrack('barras-png');
    });

    // ---------- TONO ----------
    const amp = () => Math.pow(10, Number($('toneLevel').value) / 20);

    function wav() {
        const sr = Number($('toneRate').value), secs = Math.max(1, Number($('toneSecs').value) || 60);
        const ch = Number($('toneChannels').value), freq = Number($('toneFreq').value) || 1000;
        const n = Math.round(sr * secs), bytesPer = 3, data = n * ch * bytesPer;
        const buf = new ArrayBuffer(44 + data), v = new DataView(buf);
        const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
        str(0, 'RIFF'); v.setUint32(4, 36 + data, true); str(8, 'WAVE'); str(12, 'fmt ');
        v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
        v.setUint32(24, sr, true); v.setUint32(28, sr * ch * bytesPer, true);
        v.setUint16(32, ch * bytesPer, true); v.setUint16(34, 24, true);
        str(36, 'data'); v.setUint32(40, data, true);
        const a = amp() * 8388607, w = 2 * Math.PI * freq / sr;
        let o = 44;
        for (let i = 0; i < n; i++) {
            const s = Math.round(Math.sin(w * i) * a);
            for (let c = 0; c < ch; c++) { v.setUint8(o, s & 255); v.setUint8(o + 1, (s >> 8) & 255); v.setUint8(o + 2, (s >> 16) & 255); o += 3; }
        }
        return new Blob([buf], { type: 'audio/wav' });
    }

    $('toneDownload').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(wav());
        a.download = `tono-${$('toneFreq').value}Hz-${$('toneLevel').value}dBFS-${$('toneSecs').value}s.wav`; a.click();
        window.majaguaTrack && window.majaguaTrack('tono-wav');
    });

    // Escuchar el tono (bajito: el volumen real depende de tu equipo)
    let actx, osc, gain;
    $('tonePlay').addEventListener('click', () => {
        const btn = $('tonePlay');
        if (osc) { osc.stop(); osc = null; btn.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i> Escuchar'; return; }
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        osc = actx.createOscillator(); gain = actx.createGain();
        osc.frequency.value = Number($('toneFreq').value) || 1000;
        gain.gain.value = Math.min(amp(), 0.1);
        osc.connect(gain).connect(actx.destination); osc.start();
        btn.innerHTML = '<i class="fas fa-stop" aria-hidden="true"></i> Detener';
    });
    $('toneFreq').addEventListener('input', () => { if (osc) osc.frequency.value = Number($('toneFreq').value) || 1000; });

    // Tamaño estimado del WAV
    function size() {
        const mb = Number($('toneRate').value) * (Number($('toneSecs').value) || 0) * Number($('toneChannels').value) * 3 / 1e6;
        $('toneSize').textContent = `Archivo de aprox. ${mb.toFixed(1)} MB`;
    }
    ['toneRate', 'toneSecs', 'toneChannels'].forEach(id => $(id).addEventListener('input', size));
    size();
});
