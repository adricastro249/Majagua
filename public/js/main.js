// ==========================================
// FILTRAR CATEGORIAS
// ==========================================


function filter(category) {
  const cards = document.querySelectorAll('.card');
  const buttons = document.querySelectorAll('.filter-btn');

  // Actualizar botones
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Filtrar cartas
  cards.forEach(card => {
    if (category === 'all') {
      card.style.display = 'block';
    } else {
      if (card.classList.contains(category)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// ==========================================
// ASPECT RATIO
// ==========================================

const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');
const aspectSelect = document.getElementById('aspectRatio');
const container = document.getElementById('container');
const topBar = document.getElementById('top-bar');
const bottomBar = document.getElementById('bottom-bar');

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    preview.src = event.target.result;
    preview.style.display = 'block';
    applyAspectRatio();
  };
  reader.readAsDataURL(file);
});

aspectSelect.addEventListener('change', applyAspectRatio);
document.getElementById('resetButton').addEventListener('click', () => {
  topBar.style.height = '0px';
  bottomBar.style.height = '0px';
});
preview.onload = applyAspectRatio;

function applyAspectRatio() {
  const val = aspectSelect.value;
  if (val === "reset") {
    topBar.style.height = '0px';
    bottomBar.style.height = '0px';
    return;
  }

  const [w, h] = val.split(':').map(Number);
  const aspect = w / h;
  const width = container.offsetWidth;
  const desiredHeight = width / aspect;
  const currentHeight = preview.offsetHeight;

  const totalPadding = Math.max(currentHeight - desiredHeight, 0);
  const paddingEach = totalPadding / 2;

  topBar.style.height = paddingEach + 'px';
  bottomBar.style.height = paddingEach + 'px';
}

// ==========================================
// PALETAS
// ==========================================

   // js/tools/paletas.js

document.addEventListener('DOMContentLoaded', () => {

    // Referencias DOM
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const canvas = document.getElementById('canvas');
    const palette = document.getElementById('palette');
    const paletteTitle = document.getElementById('paletteTitle');

    // 1. Evento: Subir Imagen
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'inline-block';
                // Removemos el borde dashed del contenedor cuando ya hay imagen
                imagePreview.parentElement.style.border = 'none';
                imagePreview.parentElement.style.background = 'transparent';
            };
            reader.readAsDataURL(file);
        });
    }

    // 2. Evento: Procesar Imagen al cargar
    if (imagePreview) {
        imagePreview.onload = () => {
            const ctx = canvas.getContext('2d');
            
            // Resolución de análisis (400px es un buen balance velocidad/precisión)
            const scale = 400; 
            canvas.width = scale;
            canvas.height = scale;

            // Dibujar imagen en canvas oculto
            ctx.drawImage(imagePreview, 0, 0, scale, scale);
            
            // Obtener datos de píxeles
            const imgData = ctx.getImageData(0, 0, scale, scale).data;

            // --- LÓGICA DE ALGORITMO DE COLOR ---
            const colorCount = {};
            
            // Muestrear cada 4to píxel para rendimiento
            for (let i = 0; i < imgData.length; i += 4 * 5) { 
                const r = imgData[i];
                const g = imgData[i + 1];
                const b = imgData[i + 2];
                const a = imgData[i + 3];

                if (a < 125) continue; // Ignorar transparencias

                // Agrupar colores similares (Redondear a múltiplos de 10 reduce ruido)
                const rR = Math.round(r / 10) * 10;
                const gR = Math.round(g / 10) * 10;
                const bR = Math.round(b / 10) * 10;

                const key = `${rR},${gR},${bR}`;
                colorCount[key] = (colorCount[key] || 0) + 1;
            }

            // Ordenar por frecuencia
            const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);

            // Filtrar colores muy parecidos
            const topColors = [];
            for (const [rgb] of sortedColors) {
                const color = rgb.split(',').map(Number);
                if (!colorExists(color, topColors)) {
                    topColors.push(color);
                }
                if (topColors.length >= 10) break; // Máximo 10 colores
            }

            // --- RENDERIZAR PALETA ---
            palette.innerHTML = '';
            paletteTitle.style.display = 'block';

            topColors.forEach(([r, g, b]) => {
                const hex = rgbToHex(r, g, b);
                
                // Crear el bloque de color (Swatch)
                const div = document.createElement('div');
                div.className = 'color-swatch';
                div.style.background = hex;
                div.title = `Copiar: ${hex}`;
                
                // Etiqueta de texto
                div.innerHTML = `<span class="color-code">${hex}</span>`;
                
                // Evento Clic para Copiar
                div.onclick = () => {
                    navigator.clipboard.writeText(hex);
                    // Feedback visual temporal
                    const originalText = div.querySelector('span').innerText;
                    div.querySelector('span').innerText = "COPIADO";
                    div.querySelector('span').style.background = "#2ecc71";
                    
                    setTimeout(() => {
                        div.querySelector('span').innerText = originalText;
                        div.querySelector('span').style.background = "rgba(0,0,0,0.6)";
                    }, 1000);
                };
                
                palette.appendChild(div);
            });
        };
    }

    // --- FUNCIONES AUXILIARES ---

    function rgbToHex(r, g, b) {
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    function getDistance(c1, c2) {
        return Math.sqrt(
            Math.pow(c1[0] - c2[0], 2) +
            Math.pow(c1[1] - c2[1], 2) +
            Math.pow(c1[2] - c2[2], 2)
        );
    }

    // Umbral de distancia para considerar colores distintos (aumentado a 60 para mayor variedad)
    function colorExists(color, colorList, threshold = 60) {
        return colorList.some(existing => getDistance(existing, color) < threshold);
    }

});

// ==========================================
// HAMBURGUESA
// ==========================================
// ==========================================
// HAMBURGUESA (MENÚ RESPONSIVE)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");

    // Verificar que existan los elementos antes de ejecutar
    if (hamburger && navMenu) {
        
        // Abrir / Cerrar menú
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
});

function myFunction() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}