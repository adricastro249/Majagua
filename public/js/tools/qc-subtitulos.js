// ==========================================
// CONTROL DE CALIDAD DE SUBTÍTULOS (SRT / VTT)
// Revisa caracteres por línea, líneas por subtítulo, velocidad de lectura (CPS),
// duración mínima y máxima, separación entre subtítulos y solapamientos.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);
    const input = $('fileInput'), rows = $('qcRows'), status = $('statusMsg');
    const fields = ['maxChars', 'maxLines', 'maxCps', 'minDur', 'maxDur', 'minGap'];
    let subs = [], fileName = 'subtitulos';

    // Normas de referencia (aproximadas; cada cliente tiene su guía de estilo)
    const NORMAS = {
        netflix: { maxChars: 42, maxLines: 2, maxCps: 17, minDur: 0.833, maxDur: 7, minGap: 0.083 },
        tv: { maxChars: 37, maxLines: 2, maxCps: 15, minDur: 1, maxDur: 6, minGap: 0.12 },
        ninos: { maxChars: 37, maxLines: 2, maxCps: 13, minDur: 1.5, maxDur: 7, minGap: 0.12 }
    };

    function applyNorma(k) {
        const n = NORMAS[k];
        if (n) fields.forEach(f => { $(f).value = n[f]; });
        if (subs.length) render();
    }
    $('norma').addEventListener('change', e => applyNorma(e.target.value));
    fields.forEach(f => $(f).addEventListener('input', () => { $('norma').value = 'custom'; if (subs.length) render(); }));
    $('onlyErrors').addEventListener('change', () => subs.length && render());

    // Lee el archivo como UTF-8 y, si hay caracteres rotos, como Latin-1
    async function readText(file) {
        const buf = await file.arrayBuffer();
        const utf = new TextDecoder('utf-8').decode(buf);
        return utf.includes('�') ? new TextDecoder('windows-1252').decode(buf) : utf;
    }

    const tcToSec = (tc) => {
        const m = tc.trim().match(/(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/);
        if (!m) return NaN;
        return (Number(m[1]) || 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, '0')) / 1000;
    };
    const secToTc = (s) => {
        const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60;
        const sec = Math.floor(ms / 1000) % 60, r = ms % 1000;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(r).padStart(3, '0')}`;
    };

    function parse(text) {
        const blocks = text.replace(/\r/g, '').replace(/^WEBVTT.*\n/, '').split(/\n{2,}/);
        const out = [];
        for (const b of blocks) {
            const lines = b.split('\n').filter(l => l.trim() !== '');
            const i = lines.findIndex(l => l.includes('-->'));
            if (i < 0) continue;
            const [a, z] = lines[i].split('-->');
            const textLines = lines.slice(i + 1).map(l => l.replace(/<[^>]+>/g, '').replace(/\{[^}]+\}/g, '').trim());
            out.push({ n: out.length + 1, start: tcToSec(a), end: tcToSec(z.split(' ').filter(Boolean)[0] || z), lines: textLines });
        }
        return out;
    }

    function check(s, next, r) {
        const issues = [];
        const dur = s.end - s.start;
        const chars = s.lines.join('').replace(/\s+/g, ' ').length;
        const cps = dur > 0 ? chars / dur : Infinity;
        const longest = Math.max(0, ...s.lines.map(l => l.length));
        if (!s.lines.length) issues.push('Sin texto');
        if (longest > r.maxChars) issues.push(`Línea de ${longest} caracteres (máx. ${r.maxChars})`);
        if (s.lines.length > r.maxLines) issues.push(`${s.lines.length} líneas (máx. ${r.maxLines})`);
        if (cps > r.maxCps) issues.push(`${cps.toFixed(1)} CPS (máx. ${r.maxCps})`);
        if (dur < r.minDur) issues.push(`Dura ${dur.toFixed(2)} s (mín. ${r.minDur} s)`);
        if (dur > r.maxDur) issues.push(`Dura ${dur.toFixed(2)} s (máx. ${r.maxDur} s)`);
        if (dur <= 0) issues.push('El fin es anterior al inicio');
        if (next) {
            const gap = next.start - s.end;
            if (gap < 0) issues.push(`Se pisa con el siguiente (${Math.abs(gap).toFixed(3)} s)`);
            else if (gap < r.minGap) issues.push(`Separación de ${gap.toFixed(3)} s con el siguiente (mín. ${r.minGap} s)`);
        }
        return { issues, cps, dur };
    }

    function rules() {
        const r = {};
        fields.forEach(f => { r[f] = Number($(f).value) || 0; });
        return r;
    }

    function render() {
        const r = rules();
        let bad = 0, html = '';
        const esc = (t) => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        subs.forEach((s, i) => {
            const res = check(s, subs[i + 1], r);
            s.res = res;
            if (res.issues.length) bad++;
            if ($('onlyErrors').checked && !res.issues.length) return;
            html += `<tr class="${res.issues.length ? 'qc-bad' : ''}">
                <td class="num">${s.n}</td>
                <td class="tc-cell">${secToTc(s.start)}<br>${secToTc(s.end)}</td>
                <td>${s.lines.map(esc).join('<br>') || '<em>(vacío)</em>'}</td>
                <td class="num">${Number.isFinite(res.cps) ? res.cps.toFixed(1) : '–'}</td>
                <td>${res.issues.length ? res.issues.map(x => `<span class="qc-issue">${x}</span>`).join('') : '<span class="qc-ok">OK</span>'}</td></tr>`;
        });
        rows.innerHTML = html || '<tr><td colspan="5" class="empty">Ningún subtítulo con problemas. ¡Listo para entregar!</td></tr>';
        $('sumTotal').textContent = subs.length;
        $('sumBad').textContent = bad;
        $('sumOk').textContent = subs.length ? Math.round((1 - bad / subs.length) * 100) + '%' : '–';
        $('csvBtn').disabled = !subs.length;
    }

    input.addEventListener('change', async () => {
        const f = input.files[0];
        if (!f) return;
        fileName = f.name.replace(/\.[^.]+$/, '');
        subs = parse(await readText(f));
        status.textContent = subs.length ? '' : 'No se encontraron subtítulos. Revisa que el archivo sea SRT o VTT.';
        status.classList.toggle('error', !subs.length);
        render();
        window.majaguaTrack && window.majaguaTrack('qc-subtitulos');
    });

    $('csvBtn').addEventListener('click', () => {
        const q = (t) => '"' + String(t).replace(/"/g, '""') + '"';
        const lines = [['#', 'Inicio', 'Fin', 'Texto', 'CPS', 'Problemas'].join(',')];
        subs.forEach(s => lines.push([s.n, secToTc(s.start), secToTc(s.end), q(s.lines.join(' / ')),
            Number.isFinite(s.res.cps) ? s.res.cps.toFixed(1) : '', q(s.res.issues.join('; '))].join(',')));
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
        a.download = fileName + '-qc.csv'; a.click();
    });

    applyNorma('netflix');
});
