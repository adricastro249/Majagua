// ==========================================
// MOVER MARCAS DE UN ARCHIVO (EDL, XML, CSV, TXT) - usa js/tools/tc-lib.js
// Busca todos los timecodes HH:MM:SS:FF del archivo y los desplaza.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const TC = window.MajaguaTC;
    const $ = (id) => document.getElementById(id);
    const TC_RE = /\b(\d{2}:\d{2}:\d{2}[:;]\d{2})\b/g;
    const EVENT_RE = /^\s*\d{3,}\s/;              // línea de evento de un EDL

    let original = '';
    let fileName = 'marcas.edl';
    let result = '';

    const rate = () => $('tcRate').value;
    const toFrames = (tc) => TC.tcToFrames(tc, rate());

    // Primer timecode "real" del archivo (en un EDL, el record in del primer evento)
    function firstTC(text) {
        const ev = text.split(/\r?\n/).find(l => EVENT_RE.test(l) && (l.match(TC_RE) || []).length >= 4);
        if (ev) return ev.match(TC_RE)[2];
        const all = text.match(TC_RE);
        return all ? all.reduce((min, tc) => (toFrames(tc).frames < toFrames(min).frames ? tc : min)) : null;
    }

    function offsetFrames() {
        if ($('shiftMode').value === 'start') {
            const target = toFrames($('shiftNewStart').value);
            const first = firstTC(original);
            if (target.error || !first) return { error: target.error || 'Sin timecodes' };
            return { frames: target.frames - toFrames(first).frames };
        }
        const amount = toFrames($('shiftAmount').value);
        if (amount.error) return amount;
        return { frames: $('shiftSign').value === '-' ? -amount.frames : amount.frames };
    }

    function process() {
        $('offsetGroup').hidden = $('shiftMode').value !== 'offset';
        $('startGroup').hidden = $('shiftMode').value !== 'start';
        if (!original) return;

        const off = offsetFrames();
        const from = $('shiftFrom').value.trim() ? toFrames($('shiftFrom').value) : { frames: -Infinity };
        $('shiftFrom').classList.toggle('invalid', !!from.error);
        if (off.error || from.error) { $('shiftDownload').disabled = true; return; }

        const recordOnly = $('shiftRecordOnly').checked;
        const changes = [];
        let negatives = 0, skipped = 0, total = 0;

        const lines = original.split('\n');
        result = lines.map((line, i) => {
            let idx = 0;
            const tcs = line.match(TC_RE) || [];
            const isEventLine = EVENT_RE.test(line) && tcs.length >= 4;
            const isEvent = recordOnly && isEventLine;
            // En un evento de EDL, el punto "desde" se compara contra el record in de ese evento
            const eventRec = isEventLine ? toFrames(tcs[2]) : null;
            return line.replace(TC_RE, (tc) => {
                const pos = idx++;
                total++;
                if (isEvent && pos < 2) return tc;                       // TC de origen: no se tocan
                const r = toFrames(tc);
                if (r.error) { skipped++; return tc; }
                const ref = eventRec && !eventRec.error ? eventRec.frames : r.frames;
                if (ref < from.frames) return tc;                        // antes del punto elegido
                let moved = r.frames + off.frames;
                if (moved < 0) { negatives++; moved = 0; }
                let out = TC.framesToTC(moved, rate());
                if (tc.includes(';') !== out.includes(';')) out = out.replace(/[:;](\d{2})$/, (tc.match(/[:;]\d{2}$/)[0][0]) + '$1');
                if (out !== tc) changes.push([i + 1, tc, out]);
                return out;
            });
        }).join('\n');

        const first = firstTC(original);
        $('shiftInfo').textContent = `${total} timecodes encontrados · primer evento ${first || '—'} · ` +
            `${changes.length} se mueven ${off.frames >= 0 ? '+' : '−'}${TC.framesToTC(Math.abs(off.frames), rate())}` +
            (skipped ? ` · ${skipped} no válidos a ${TC.RATES[rate()].label} fps (revisa el frame rate)` : '') +
            (negatives ? ` · ${negatives} quedarían antes de 00:00:00:00 y se dejaron en cero` : '');

        $('shiftPreview').innerHTML = changes.length
            ? changes.slice(0, 12).map(([ln, a, b]) => `<tr><td>${ln}</td><td class="num">${a}</td><td class="num moved">${b}</td></tr>`).join('') +
              (changes.length > 12 ? `<tr><td colspan="3" class="empty">… y ${changes.length - 12} más</td></tr>` : '')
            : '<tr><td colspan="3" class="empty">Con esta configuración no se mueve ningún timecode.</td></tr>';
        $('shiftDownload').disabled = !changes.length;
    }

    $('shiftFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        fileName = file.name;
        file.arrayBuffer().then(buf => {
            let text = new TextDecoder('utf-8').decode(buf);
            if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
            original = text;
            if (!TC_RE.test(text)) { $('shiftInfo').textContent = 'No encontré timecodes con formato HH:MM:SS:FF en este archivo.'; original = ''; }
            TC_RE.lastIndex = 0;
            process();
        });
    });

    $('shiftPanel').addEventListener('input', process);
    $('shiftPanel').addEventListener('change', process);
    $('tcRate').addEventListener('change', process);

    $('shiftDownload').addEventListener('click', () => {
        const dot = fileName.lastIndexOf('.');
        const name = dot > 0 ? `${fileName.slice(0, dot)}_movido${fileName.slice(dot)}` : `${fileName}_movido`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([result], { type: 'text/plain;charset=utf-8' }));
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        if (window.majaguaTrack) window.majaguaTrack('timecode-mover-marcas');
    });

    process();
});
