// ==========================================
// MARCADORES DE RESOLVE A NOTAS (usa js/tools/tc-lib.js)
// Formatos: EDL de marcadores de Resolve, CSV (Edit Index u otros) y texto con timecodes.
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const TC = window.MajaguaTC;
    const $ = (id) => document.getElementById(id);
    const TC_RE = /(\d{1,2}[:;.]\d{2}[:;.]\d{2}[:;.]\d{2})/;

    const COLORS = {
        blue: '#2f80ed', cyan: '#00bcd4', green: '#27ae60', yellow: '#f1c40f', red: '#e74c3c', pink: '#ff6fae',
        purple: '#9b59b6', fuchsia: '#d63384', rose: '#f48fb1', lavender: '#b39ddb', sky: '#81d4fa', mint: '#7bd7b0',
        lemon: '#fff176', sand: '#d7b98e', cocoa: '#8d6e63', cream: '#f5ecd7', white: '#e0e0e0', black: '#333',
        orange: '#f39c12', magenta: '#d63384', none: '#bbb'
    };

    let markers = [];
    let hiddenColors = new Set();

    TC.fillSelect($('markerRate'), '24');

    const normColor = (raw) => {
        const c = String(raw || '').replace(/^ResolveColor/i, '').trim().toLowerCase();
        return c && COLORS[c] ? c : (c || 'none');
    };

    // ---------- Lectores ----------
    function parseEDL(text) {
        const out = [];
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const ev = lines[i].match(/^\s*\d{3,}\s+\S+\s+\S+\s+\S+\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)/);
            if (!ev) continue;
            const recIn = ev[3];
            // Las líneas siguientes pueden traer |C: |M: |D: (Resolve) o comentarios "* ..."
            let name = '', color = 'none', note = '';
            for (let j = i + 1; j < lines.length && !/^\s*\d{3,}\s/.test(lines[j]); j++) {
                const l = lines[j];
                const c = l.match(/\|C:(\S+)/); if (c) color = normColor(c[1]);
                const m = l.match(/\|M:(.*?)(?=\s\|[A-Z]:|$)/); if (m) name = m[1].trim();
                const n = l.match(/\|N:(.*?)(?=\s\|[A-Z]:|$)/); if (n) note = n[1].trim();
                const loc = l.match(/^\*\s*LOC:\s*(\S+)\s+(\w+)\s+(.*)$/i); if (loc) { color = normColor(loc[2]); name = loc[3].trim(); }
                if (/^\*\s*(COMMENT|NOTE):/i.test(l)) note = l.replace(/^\*\s*\w+:\s*/i, '').trim();
            }
            out.push({ tc: recIn, color, text: [name, note].filter(Boolean).join(' — ') });
        }
        return out;
    }

    function parseCSVLine(line, sep) {
        const cells = []; let cur = '', quoted = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (quoted) {
                if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
                else if (ch === '"') quoted = false;
                else cur += ch;
            } else if (ch === '"') quoted = true;
            else if (ch === sep) { cells.push(cur); cur = ''; }
            else cur += ch;
        }
        cells.push(cur);
        return cells.map(c => c.trim());
    }

    function parseCSV(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const sep = (lines[0].match(/\t/g) || []).length > (lines[0].match(/,/g) || []).length ? '\t'
            : (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
        const header = parseCSVLine(lines[0], sep).map(h => h.toLowerCase());
        const find = (...names) => header.findIndex(h => names.some(n => h === n || h.includes(n)));

        const tcCol = [find('record in'), find('timecode'), find('source in'), find('start'), find('in')].find(i => i >= 0);
        if (tcCol === undefined || TC_RE.test(lines[0])) return null; // sin encabezado reconocible

        const nameCol = find('name', 'nombre', 'marker');
        const noteCol = find('notes', 'note', 'comment', 'nota', 'comentario', 'description');
        const colorCol = find('color');

        return lines.slice(1).map(l => {
            const c = parseCSVLine(l, sep);
            const tc = (c[tcCol] || '').match(TC_RE);
            if (!tc) return null;
            const text = [c[nameCol], c[noteCol]].filter((v, i, a) => v && a.indexOf(v) === i).join(' — ');
            return { tc: tc[1], color: normColor(colorCol >= 0 ? c[colorCol] : ''), text };
        }).filter(Boolean);
    }

    // Respaldo: cualquier línea con un timecode (marcadores de Avid, listas hechas a mano)
    function parseLoose(text) {
        return text.split('\n').map(line => {
            const m = line.match(TC_RE);
            if (!m) return null;
            const cells = line.split('\t').map(s => s.trim()).filter(Boolean);
            let color = 'none', rest;
            if (cells.length > 2) {                               // Avid: nombre, TC, pista, color, comentario
                const colorCell = cells.find(c => COLORS[c.toLowerCase()]);
                if (colorCell) color = colorCell.toLowerCase();
                rest = cells.filter(c => !TC_RE.test(c) && c !== colorCell && !/^V\d+$|^A\d+$|^TC$|^\d+$/.test(c)).join(' — ');
            } else {
                rest = line.replace(m[0], '').replace(/^[\s\-–—:|,]+/, '').trim();
            }
            return { tc: m[1], color, text: rest };
        }).filter(Boolean);
    }

    function parse(text) {
        text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
        if (/^\s*TITLE:|^\s*\d{3,}\s+\S+\s+\S+\s+\S+\s+\d/m.test(text)) {
            const edl = parseEDL(text);
            if (edl.length) return edl;
        }
        const csv = parseCSV(text);
        if (csv && csv.length) return csv;
        return parseLoose(text);
    }

    // ---------- Render ----------
    function computeOffsets() {
        const key = $('markerRate').value;
        const start = TC.tcToFrames($('startTC').value || '0', key);
        $('startTC').classList.toggle('invalid', !!start.error);
        const startFrames = start.error ? 0 : start.frames;
        markers.forEach(m => {
            const r = TC.tcToFrames(m.tc, key);
            m.frames = r.error ? null : r.frames;
            m.video = r.error ? '—' : TC.framesToShort(r.frames - startFrames, key);
        });
        markers.sort((a, b) => (a.frames ?? 0) - (b.frames ?? 0));
    }

    const visible = () => markers.filter(m => !hiddenColors.has(m.color));

    function render() {
        computeOffsets();

        const colors = [...new Set(markers.map(m => m.color))];
        $('colorFilters').innerHTML = colors.length > 1 ? colors.map(c =>
            `<button type="button" data-color="${c}" class="${hiddenColors.has(c) ? 'off' : ''}">
                <span class="dot" style="background:${COLORS[c] || COLORS.none}"></span>${c === 'none' ? 'Sin color' : c}
                (${markers.filter(m => m.color === c).length})</button>`).join('') : '';

        const list = visible();
        $('markerCount').textContent = list.length;
        const esc = (s) => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
        $('markerRows').innerHTML = list.length ? list.map(m => `
            <tr><td><span class="dot" style="background:${COLORS[m.color] || COLORS.none}" title="${m.color}"></span></td>
                <td class="num">${m.video}</td><td class="num tc-cell">${m.tc}</td><td>${esc(m.text) || '<em>(sin texto)</em>'}</td></tr>`).join('')
            : `<tr><td colspan="4" class="empty">${markers.length ? 'No hay notas con los colores elegidos.' : 'No encontré marcadores con timecode en ese contenido.'}</td></tr>`;

        ['copyNotes', 'downloadTxt', 'downloadCsv', 'printNotes'].forEach(id => { $(id).disabled = !list.length; });
    }

    function load(text) {
        markers = parse(text);
        hiddenColors = new Set();
        render();
        if (markers.length && window.majaguaTrack) window.majaguaTrack('marcadores-cargados');
    }

    // ---------- Exportar ----------
    function asText() {
        const withTC = $('includeTC').checked;
        return visible().map((m, i) =>
            `${i + 1}. [${m.video}]${withTC ? ` (${m.tc})` : ''} ${m.text || '(sin texto)'}`).join('\n');
    }

    function asCSV() {
        const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
        const rows = [['#', 'Video', 'Timecode', 'Color', 'Nota']]
            .concat(visible().map((m, i) => [i + 1, m.video, m.tc, m.color, m.text]));
        return '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n');
    }

    function save(content, name, type) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    // ---------- Eventos ----------
    $('markerFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        file.arrayBuffer().then(buf => {
            let text = new TextDecoder('utf-8').decode(buf);
            if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
            $('markerText').value = text;
            load(text);
        });
    });

    let typing;
    $('markerText').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => load($('markerText').value), 300); });
    $('markerRate').addEventListener('change', render);
    $('startTC').addEventListener('input', render);

    $('colorFilters').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const c = btn.dataset.color;
        hiddenColors.has(c) ? hiddenColors.delete(c) : hiddenColors.add(c);
        render();
    });

    $('copyNotes').addEventListener('click', () => {
        const label = $('copyNotes').querySelector('span');
        navigator.clipboard.writeText(asText()).then(() => {
            label.textContent = 'Copiado';
            setTimeout(() => { label.textContent = 'Copiar lista'; }, 1500);
        });
    });
    $('downloadTxt').addEventListener('click', () => save(asText(), 'notas.txt', 'text/plain'));
    $('downloadCsv').addEventListener('click', () => save(asCSV(), 'notas.csv', 'text/csv'));
    $('printNotes').addEventListener('click', () => window.print());
});
