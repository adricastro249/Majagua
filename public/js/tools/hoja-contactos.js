// ==========================================
// HOJA DE CONTACTOS DE VIDEO
// Saca fotogramas de un clip cada X segundos (o una cantidad fija), con su timecode,
// y arma una hoja en JPG o un ZIP con los fotogramas sueltos.
// Usa js/tools/tc-lib.js para el timecode.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const TC = window.MajaguaTC;
    const video = $('video'), input = $('fileInput'), grid = $('frames'), status = $('statusMsg');
    let frames = [], fileName = 'clip', busy = false;

    TC.fillSelect($('fps'), '24');
    $('mode').addEventListener('change', () => {
        $('everyGroup').hidden = $('mode').value !== 'every';
        $('countGroup').hidden = $('mode').value !== 'count';
    });

    input.addEventListener('change', () => {
        const f = input.files[0];
        if (!f) return;
        fileName = f.name.replace(/\.[^.]+$/, '');
        video.src = URL.createObjectURL(f);
        status.textContent = 'Cargando el clip…'; status.classList.remove('error');
    });
    video.addEventListener('loadedmetadata', () => {
        status.textContent = `Clip de ${video.videoWidth}×${video.videoHeight}, ${fmtDur(video.duration)}. Elige las opciones y genera la hoja.`;
        $('makeBtn').disabled = false;
    });
    video.addEventListener('error', () => {
        status.textContent = 'Tu navegador no puede abrir este video. Prueba con MP4 (H.264) o WebM; ProRes solo se abre en Safari.';
        status.classList.add('error'); $('makeBtn').disabled = true;
    });

    const fmtDur = (s) => { const m = Math.floor(s / 60); return `${m} min ${Math.round(s % 60)} s`; };
    const tcAt = (sec) => TC.framesToTC(Math.round(sec * TC.RATES[$('fps').value].fps) + startFrames(), $('fps').value);
    function startFrames() {
        const r = TC.tcToFrames($('startTc').value || '00:00:00:00', $('fps').value);
        return r.error ? 0 : r.frames;
    }

    function seek(t) {
        return new Promise(ok => { video.addEventListener('seeked', ok, { once: true }); video.currentTime = t; });
    }

    $('makeBtn').addEventListener('click', async () => {
        if (busy) return;
        busy = true; $('makeBtn').disabled = true; frames = []; grid.innerHTML = '';
        const d = video.duration;
        const times = [];
        if ($('mode').value === 'every') {
            const step = Math.max(0.1, Number($('every').value) || 10);
            for (let t = Math.min(0.05, d / 2); t < d; t += step) times.push(t);
        } else {
            const n = Math.min(200, Math.max(1, Number($('count').value) || 24));
            for (let i = 0; i < n; i++) times.push(d * (i + 0.5) / n);
        }
        const w = Number($('thumbW').value), h = Math.round(w * video.videoHeight / video.videoWidth);
        for (let i = 0; i < times.length; i++) {
            status.textContent = `Sacando fotograma ${i + 1} de ${times.length}…`;
            await seek(times[i]);
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(video, 0, 0, w, h);
            const tc = tcAt(times[i]);
            frames.push({ canvas: c, tc });
            const fig = document.createElement('figure');
            fig.appendChild(c);
            fig.insertAdjacentHTML('beforeend', `<figcaption>${tc}</figcaption>`);
            grid.appendChild(fig);
        }
        status.textContent = `Listo: ${frames.length} fotogramas.`;
        $('sheetBtn').disabled = $('zipBtn').disabled = !frames.length;
        $('makeBtn').disabled = false; busy = false;
        window.majaguaTrack && window.majaguaTrack('hoja-contactos');
    });

    // Hoja completa en un JPG, con encabezado y timecode debajo de cada cuadro
    $('sheetBtn').addEventListener('click', () => {
        const cols = Number($('cols').value), fw = frames[0].canvas.width, fh = frames[0].canvas.height;
        const gap = Math.round(fw * 0.04), cap = Math.round(fw * 0.11), head = Math.round(fw * 0.35);
        const rows = Math.ceil(frames.length / cols);
        const sheet = document.createElement('canvas');
        sheet.width = cols * fw + (cols + 1) * gap;
        sheet.height = head + rows * (fh + cap + gap) + gap;
        const s = sheet.getContext('2d');
        s.fillStyle = '#0B1E2A'; s.fillRect(0, 0, sheet.width, sheet.height);
        s.fillStyle = '#EAF8FC'; s.font = `700 ${Math.round(head * 0.32)}px "Bricolage Grotesque", system-ui, sans-serif`;
        s.textBaseline = 'middle';
        s.fillText(fileName, gap, head * 0.42);
        s.fillStyle = '#A9D7E6'; s.font = `${Math.round(head * 0.18)}px system-ui, sans-serif`;
        s.fillText(`${frames.length} fotogramas · ${fmtDur(video.duration)} · ${$('fps').selectedOptions[0].text} fps`, gap, head * 0.78);
        s.font = `600 ${Math.round(cap * 0.5)}px ui-monospace, monospace`;
        frames.forEach((f, i) => {
            const x = gap + (i % cols) * (fw + gap), y = head + Math.floor(i / cols) * (fh + cap + gap);
            s.drawImage(f.canvas, x, y);
            s.fillStyle = '#FFC94A'; s.fillText(f.tc, x, y + fh + cap * 0.55);
        });
        sheet.toBlob(b => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b); a.download = fileName + '-hoja-contactos.jpg'; a.click();
        }, 'image/jpeg', 0.9);
    });

    $('zipBtn').addEventListener('click', async () => {
        const zip = new JSZip();
        await Promise.all(frames.map((f, i) => new Promise(ok => f.canvas.toBlob(b => {
            zip.file(`${fileName}_${String(i + 1).padStart(3, '0')}_${f.tc.replace(/[:;]/g, '-')}.jpg`, b); ok();
        }, 'image/jpeg', 0.92))));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));
        a.download = fileName + '-fotogramas.zip'; a.click();
    });
});
