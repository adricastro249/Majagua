// ==========================================
// GENERADOR DE NOMBRES DCP (ISDCF Digital Cinema Naming Convention)
// Orden de campos:
// Título_Tipo_Aspect_Idioma_Territorio_Audio_Resolución_Estudio_Fecha_Laboratorio_Estándar_Paquete
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    const $ = (id) => document.getElementById(id);
    const form = $('dcpForm');
    const output = $('dcpOutput');
    const warnings = $('dcpWarnings');
    const copyBtn = $('copyDcpBtn');

    // Códigos de idioma del registro ISDCF (https://www.isdcf.com/registry/languages/)
    const LANGUAGES = [
        ['QSA', 'Español (Argentina)'], ['LAS', 'Español latinoamericano (neutro)'], ['ES', 'Español (España / castellano)'],
        ['QSB', 'Español (Bolivia)'], ['QCL', 'Español (Chile)'], ['QCO', 'Español (Colombia)'], ['QCA', 'Español (Costa Rica)'],
        ['QCU', 'Español (Cuba)'], ['QSE', 'Español (Ecuador)'], ['QSL', 'Español (El Salvador)'], ['QGU', 'Español (Guatemala)'],
        ['QSH', 'Español (Honduras)'], ['QSM', 'Español (México)'], ['QNI', 'Español (Nicaragua)'], ['QPA', 'Español (Panamá)'],
        ['QPY', 'Español (Paraguay)'], ['QPE', 'Español (Perú)'], ['QPR', 'Español (Puerto Rico)'], ['QSD', 'Español (República Dominicana)'],
        ['QUY', 'Español (Uruguay)'], ['QVE', 'Español (Venezuela)'], ['QUS', 'Español (Estados Unidos)'],
        ['QBP', 'Portugués (Brasil)'], ['PT', 'Portugués (Portugal)'],
        ['EN', 'Inglés'], ['EUS', 'Inglés (Estados Unidos)'], ['EGB', 'Inglés (Reino Unido)'],
        ['FR', 'Francés'], ['QFC', 'Francés (Canadá)'], ['IT', 'Italiano'], ['DE', 'Alemán'],
        ['JA', 'Japonés'], ['KO', 'Coreano'], ['ZH', 'Chino'], ['CMN', 'Chino mandarín (audio)'], ['YUE', 'Chino cantonés'],
        ['GN', 'Guaraní'], ['QUZ', 'Quechua (Cusco)'], ['ARN', 'Mapuche (mapudungun)'],
        ['XX', 'Ninguno · sin diálogo / sin subtítulos']
    ];

    // Territorios: códigos ISO 3166 (todo Latinoamérica, Centroamérica y el Caribe hispano primero)
    const TERRITORIES = [
        ['AR', 'Argentina'], ['BO', 'Bolivia'], ['BR', 'Brasil'], ['CL', 'Chile'], ['CO', 'Colombia'], ['CR', 'Costa Rica'],
        ['CU', 'Cuba'], ['EC', 'Ecuador'], ['SV', 'El Salvador'], ['GT', 'Guatemala'], ['HN', 'Honduras'], ['MX', 'México'],
        ['NI', 'Nicaragua'], ['PA', 'Panamá'], ['PY', 'Paraguay'], ['PE', 'Perú'], ['PR', 'Puerto Rico'],
        ['DO', 'República Dominicana'], ['UY', 'Uruguay'], ['VE', 'Venezuela'], ['BZ', 'Belice'],
        ['US', 'Estados Unidos'], ['CA', 'Canadá'], ['ES', 'España'], ['PT', 'Portugal'], ['FR', 'Francia'],
        ['DE', 'Alemania'], ['IT', 'Italia'], ['GB', 'Reino Unido'],
        ['INT-TD', 'Internacional con textos'], ['INT-TL', 'Internacional sin textos (textless)']
    ];

    // ---------- Campos con autocompletado: se escribe "argentina", "méxico" o el código ----------
    const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const labelOf = ([code, name]) => `${code} · ${name}`;

    const COMBOS = {
        audioLanguage: { list: LANGUAGES, def: 'QSA' },
        subLanguage: { list: LANGUAGES, def: 'XX' },
        territory: { list: TERRITORIES, def: 'AR' }
    };

    // Devuelve el código que corresponde a lo escrito, o null si no hay coincidencia
    function resolve(id) {
        const { list } = COMBOS[id];
        const q = norm($(id).value);
        if (!q) return null;
        const exactLabel = list.find(e => norm(labelOf(e)) === q);
        const exactCode = list.find(([code]) => norm(code) === q);
        const exactName = list.find(([, name]) => norm(name) === q);
        // Si escribe un país ("argentina"), prioriza la variante de ese país sobre el idioma general
        const partial = list.find(([, name]) => norm(name).includes(q)) || list.find(e => norm(labelOf(e)).includes(q));
        const hit = exactLabel || exactCode || exactName || partial;
        return hit ? hit[0] : null;
    }

    function setCombo(id, code) {
        const entry = COMBOS[id].list.find(([c]) => c === code);
        $(id).value = entry ? labelOf(entry) : '';
    }

    Object.entries(COMBOS).forEach(([id, cfg]) => {
        $(id + 'List').innerHTML = cfg.list.map(e => `<option value="${labelOf(e)}"></option>`).join('');
        setCombo(id, cfg.def);
        // Al salir del campo se completa con el nombre oficial
        $(id).addEventListener('change', () => { const c = resolve(id); if (c) setCombo(id, c); buildName(); });
        $(id).addEventListener('focus', () => $(id).select());
    });

    function comboCode(id) {
        const code = resolve(id);
        $(id).classList.toggle('invalid', !code);
        $(id + 'Hint').textContent = code ? `Código: ${code}` : 'No encontré ese idioma o país';
        return code || COMBOS[id].def;
    }

    // Medidas del contenedor según la resolución
    const CONTAINER_SIZES = {
        '2K': { F: '1998×1080', S: '2048×858', C: '2048×1080' },
        '4K': { F: '3996×2160', S: '4096×1716', C: '4096×2160' }
    };
    const CONTAINER_NAMES = { F: 'F · Flat (1.85:1', S: 'S · Scope (2.39:1', C: 'C · Full container (1.90:1' };
    function updateContainerLabels() {
        const sizes = CONTAINER_SIZES[$('resolution').value];
        [...$('projContainer').options].forEach(o => { o.textContent = `${CONTAINER_NAMES[o.value]} · ${sizes[o.value]})`; });
    }

    // Fecha de hoy en hora local (evita que en Argentina aparezca el día anterior o el siguiente)
    function todayLocal() {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // "Mi película: el regreso" -> "MiPeliculaElRegreso"
    function toCamelTitle(text) {
        return text
            .normalize('NFD').replace(/[̀-ͯ]/g, '')   // quitar tildes
            .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
            .replace(/[^A-Za-z0-9]+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean)
            .map(w => w[0].toUpperCase() + w.slice(1))
            .join('');
    }

    const clean = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    function buildName() {
        const notes = [];

        // 1. Título
        const rawTitle = $('filmTitle').value;
        const title = toCamelTitle(rawTitle) || 'MovieTitle';
        if (title.length > 14) notes.push(`El título tiene ${title.length} caracteres. ISDCF recomienda hasta 14, porque muchos servidores cortan nombres largos.`);

        // 2. Tipo de contenido + modificadores (FTR-1-3D-Temp)
        const content = [$('contentType').value];
        const version = parseInt($('version').value, 10);
        if (version > 0) content.push(String(version));
        if ($('dimension').value) content.push($('dimension').value);
        if ($('contentModifier').value) content.push($('contentModifier').value);

        // 3. Aspect ratio: contenedor + imagen si es distinta (F, S-200, F-178)
        const container = $('projContainer').value;
        const containerRatio = { F: '185', S: '239', C: '190' }[container];
        const imageRatio = $('imageRatio').value;
        const aspect = imageRatio && imageRatio !== containerRatio ? `${container}-${imageRatio}` : container;

        // 4. Idioma: AUDIO-SUBS[-CCAP][-OCAP]. Subtítulos quemados van en minúsculas.
        updateContainerLabels();
        let subs = comboCode('subLanguage');
        if (subs !== 'XX' && $('subType').value === 'burned') subs = subs.toLowerCase();
        const language = [comboCode('audioLanguage'), subs];
        if ($('ccap').checked) language.push('CCAP');
        if ($('ocap').checked) language.push('OCAP');

        // 5. Territorio y calificación (AR-13)
        const rating = clean($('rating').value);
        if (rating === 'XX') notes.push('No uses XX como calificación: si no tiene, deja el campo vacío.');
        const terr = comboCode('territory');
        const territory = rating && rating !== 'XX' ? `${terr}-${rating}` : terr;

        // 6. Audio (51-HI-VI-ATMOS)
        const isSilent = $('audioType').value === 'MOS';
        ['hi', 'vi', 'immersive'].forEach(id => { $(id).disabled = isSilent; });
        const audio = [$('audioType').value];
        if (!isSilent) {
            if ($('hi').checked) audio.push('HI');
            if ($('vi').checked) audio.push('VI');
            if ($('immersive').value) audio.push($('immersive').value);
        }

        // 7 a 12
        const resolution = $('resolution').value;
        const studio = clean($('studio').value);
        const date = ($('date').value || todayLocal()).replace(/-/g, '');
        const facility = clean($('facility').value);
        const standard = $('standard').value;
        const packageType = $('packageType').value;

        if ($('dimension').value === '3D' && standard === 'IOP') notes.push('Para 3D se recomienda SMPTE: muchos servidores nuevos ya no aceptan Interop.');
        if (packageType === 'VF') notes.push('Un VF solo funciona junto con su OV: asegurate de que el laboratorio tenga el paquete original.');

        // Estudio y laboratorio vacíos se omiten (práctica habitual, por ejemplo en DCP-o-matic)
        const name = [
            title, content.join('-'), aspect, language.join('-'), territory,
            audio.join('-'), resolution, studio, date, facility, standard, packageType
        ].filter(Boolean).join('_');

        output.textContent = name;
        warnings.innerHTML = '';
        notes.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            warnings.appendChild(li);
        });
        return name;
    }

    form.addEventListener('input', buildName);
    form.addEventListener('change', buildName);

    copyBtn.addEventListener('click', () => {
        const label = copyBtn.querySelector('span');
        if (window.majaguaTrack) window.majaguaTrack('dcp-copiar');
        navigator.clipboard.writeText(output.textContent).then(() => {
            label.textContent = 'Copiado';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                label.textContent = 'Copiar';
                copyBtn.classList.remove('copied');
            }, 1500);
        });
    });

    $('resetDcpBtn').addEventListener('click', () => {
        form.reset();
        Object.entries(COMBOS).forEach(([id, cfg]) => setCombo(id, cfg.def));
        $('date').value = todayLocal();
        buildName();
    });

    $('date').value = todayLocal();
    buildName();
});
