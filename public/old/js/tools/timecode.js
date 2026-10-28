// ==========================================
// CALCULADORA DE TIMECODE (usa js/tools/tc-lib.js)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const TC = window.MajaguaTC;
    const $ = (id) => document.getElementById(id);
    const rate = $('tcRate');
    const rows = $('tcRows');

    TC.fillSelect(rate, '24');
    TC.fillSelect($('fpsTarget'), '25');

    const describe = (frames, key) =>
        `${frames.toLocaleString('es-AR')} frames · ${TC.framesToClock(frames, key)} reales`;

    // Marca el input en rojo y muestra el problema
    function read(input, key) {
        const res = TC.tcToFrames(input.value, key);
        input.classList.toggle('invalid', !!res.error);
        input.title = res.error || '';
        return res;
    }

    // ---------- Sumar y restar ----------
    function addRow(op = '+', value = '') {
        const row = document.createElement('div');
        row.className = 'tc-row';
        row.innerHTML = `
            <select class="tc-op" aria-label="Operación">
                <option value="+">+</option>
                <option value="-">−</option>
            </select>
            <input type="text" class="tc-input" placeholder="00:00:00:00" inputmode="numeric" aria-label="Timecode">
            <button type="button" class="tc-remove" aria-label="Quitar línea"><i class="fas fa-xmark"></i></button>`;
        row.querySelector('.tc-op').value = op;
        row.querySelector('.tc-input').value = value;
        row.querySelector('.tc-remove').addEventListener('click', () => { row.remove(); update(); });
        rows.appendChild(row);
    }

    function updateSum(key) {
        let total = 0, errors = 0;
        rows.querySelectorAll('.tc-row').forEach(row => {
            const input = row.querySelector('.tc-input');
            if (!input.value.trim()) { input.classList.remove('invalid'); return; }
            const res = read(input, key);
            if (res.error) { errors++; return; }
            total += row.querySelector('.tc-op').value === '-' ? -res.frames : res.frames;
        });
        $('sumResult').textContent = TC.framesToTC(total, key);
        $('sumSub').textContent = errors
            ? `${errors} línea(s) con errores no se suman (pasá el mouse para ver el detalle)`
            : describe(total, key);
    }

    // ---------- In / Out ----------
    function updateDuration(key) {
        const a = read($('tcIn'), key), b = read($('tcOut'), key);
        if (a.error || b.error) { $('durResult').textContent = '—'; $('durSub').textContent = a.error || b.error; return; }
        const d = b.frames - a.frames;
        $('durResult').textContent = TC.framesToTC(d, key);
        $('durSub').textContent = describe(d, key);
    }

    // ---------- Convertir ----------
    function updateConvert(key) {
        const a = read($('convTC'), key);
        $('convTCOut').textContent = a.error ? a.error : `= ${describe(a.frames, key)}`;
        const f = parseInt($('convFrames').value, 10);
        $('convFramesOut').textContent = Number.isFinite(f) ? `= ${TC.framesToTC(f, key)} · ${TC.framesToClock(f, key)} reales` : '';
    }

    // ---------- Cambiar fps ----------
    function updateFps(key) {
        const target = $('fpsTarget').value;
        const a = read($('fpsTC'), key);
        if (a.error) { $('fpsSameTime').textContent = '—'; $('fpsSameFrames').textContent = '—'; $('fpsSub').textContent = a.error; return; }

        const seconds = a.frames / TC.RATES[key].fps;
        const sameTimeFrames = Math.round(seconds * TC.RATES[target].fps);
        $('fpsSameTime').textContent = TC.framesToTC(sameTimeFrames, target);
        $('fpsSameFrames').textContent = TC.framesToTC(a.frames, target);

        const newSeconds = a.frames / TC.RATES[target].fps;
        const speed = (TC.RATES[target].fps / TC.RATES[key].fps * 100).toFixed(2);
        $('fpsSub').textContent = `Con los mismos frames, la pieza dura ${TC.framesToClock(a.frames, target)} (velocidad ${speed}%)` +
            (Math.abs(newSeconds - seconds) > 0.0005 ? '. El audio necesitaría el mismo cambio de velocidad.' : '.');
    }

    function update() {
        const key = rate.value;
        updateSum(key); updateDuration(key); updateConvert(key); updateFps(key);
    }

    $('addRow').addEventListener('click', () => { addRow(); update(); rows.lastElementChild.querySelector('.tc-input').focus(); });
    document.querySelector('.tool-wide').addEventListener('input', update);
    document.querySelector('.tool-wide').addEventListener('change', update);

    // Al salir de un campo, se normaliza el formato (ej: "1000" -> "00:00:10:00")
    document.querySelector('.tool-wide').addEventListener('focusout', (e) => {
        if (!e.target.classList.contains('tc-input') || !e.target.value.trim()) return;
        const key = rate.value;
        const res = TC.tcToFrames(e.target.value, key);
        if (!res.error) e.target.value = TC.framesToTC(res.frames, key);
    });

    addRow('+', '00:12:30:00');
    addRow('+', '00:08:15:12');
    addRow('-', '00:00:45:00');
    update();
});
