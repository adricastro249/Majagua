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

    // Códigos de idioma del registro ISDCF (los más usados en la región)
    const LANGUAGES = [
        ['ES', 'Español (España)'],
        ['LAS', 'Español latinoamericano'],
        ['EN', 'Inglés'],
        ['PT', 'Portugués (Portugal)'],
        ['QBP', 'Portugués (Brasil)'],
        ['FR', 'Francés'],
        ['IT', 'Italiano'],
        ['DE', 'Alemán'],
        ['JA', 'Japonés'],
        ['KO', 'Coreano'],
        ['ZH', 'Chino'],
        ['XX', 'Sin diálogo / no aplica']
    ];

    document.querySelectorAll('.lang-select').forEach(select => {
        LANGUAGES.forEach(([code, name]) => {
            const label = code === 'XX' && select.dataset.none ? select.dataset.none : `${code} · ${name}`;
            select.add(new Option(label, code));
        });
        select.value = select.dataset.default;
    });

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
        let subs = $('subLanguage').value;
        if (subs !== 'XX' && $('subType').value === 'burned') subs = subs.toLowerCase();
        const language = [$('audioLanguage').value, subs];
        if ($('ccap').checked) language.push('CCAP');
        if ($('ocap').checked) language.push('OCAP');

        // 5. Territorio y calificación (AR-13)
        const rating = clean($('rating').value);
        if (rating === 'XX') notes.push('No uses XX como calificación: si no tiene, dejá el campo vacío.');
        const territory = rating && rating !== 'XX' ? `${$('territory').value}-${rating}` : $('territory').value;

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
        document.querySelectorAll('.lang-select').forEach(s => { s.value = s.dataset.default; });
        $('date').value = todayLocal();
        buildName();
    });

    $('date').value = todayLocal();
    buildName();
});
