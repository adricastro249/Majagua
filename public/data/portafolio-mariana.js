// ==========================================================
// PORTAFOLIO DE MARIANA ROJAS BARROSO
//
// Para sumar un trabajo: copia un bloque { ... }, pégalo arriba de todo
// en "trabajos" (el primero sale destacado, en grande) y cambia los datos.
//
//   titulo      nombre del proyecto
//   rol         lo que hiciste ("Edición Online", "Asistente de Dirección"...)
//   anio        año
//   detalle     director, plataforma, formato... (opcional)
//   categorias  uno o más filtros de la lista "filtros", ej: ["online"]
//   video       enlace de YouTube o Vimeo, tal cual lo copias del navegador
//   portada     opcional: una imagen propia, ej: "img/portadas/mi-proyecto.webp".
//               Si queda vacío, se usa la miniatura del video.
//
// Para sumar un filtro nuevo, agrégalo en "filtros" (clave: "Texto del botón").
// ==========================================================
window.PORTAFOLIO = {
  filtros: {
    coordinacion: "Coordinación de Postproducción",
    asistente: "Asistente de Dirección",
    produccion: "Producción",
    direccion: "Dirección"
  },

  trabajos: [
     {
    titulo: "Coppola: El Representante | Temporada 2",
    rol: "Coordinación de PostProducción",
    anio: "2026",
    detalle: "Disney+",
    categorias: ["coordinacion"],
    video: "https://www.youtube.com/watch?v=Z4PEQb1sFts",
    portada: ""
  },

  {
    titulo: "PlayBack",
    rol: "Coordinación de PostProducción",
    anio: "2025",
    detalle: "Disney+",
    categorias: ["coordinacion"],
    video: "https://youtu.be/MbzDjwVzH_w",
    portada: ""
  },

  {
    titulo: "Stalker de Energía",
    rol: "Coordinadora de PostProducción",
    anio: "2023",
    detalle: "Cactus Cine, Serie para canal TEC",
    categorias: ["coordinacion"],
    video: "https://youtu.be/pPUmuIKayak",
    portada: ""
  },

  {
    titulo: "Oda Amarilla",
    rol: "Producción General",
    anio: "2023",
    detalle: "Dirección Lucía Paz, Largometraje Documental",
    categorias: ["produccion"],
    video: "https://youtu.be/-R8SU6N2UiA",
    portada: ""
  },

  {
    titulo: "Leonidas",
    rol: "Asistente de Dirección",
    anio: "2018",
    detalle: "Dirección Miguel Colombo, Largometraje Documental",
    categorias: ["asistente"],
    video: "https://vimeo.com/316843291",
    portada: ""
  },

  {
    titulo: "Parque Central",
    rol: "Asistente de Dirección",
    anio: "2017",
    detalle: "Director Luis Alberto Lamata, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/PodPG58oNu8",
    portada: ""
  },

  {
    titulo: "Más vivos que nunca",
    rol: "Asistente de Dirección",
    anio: "2016",
    detalle: "Director Alfredo Anzola, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/h3VKTsrCIGs",
    portada: ""
  },

  {
    titulo: "Muerte en Berruecos",
    rol: "Asistente de Dirección",
    anio: "2016",
    detalle: "Director Caupolican Ovalles, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/y6CRDnXIGWc",
    portada: ""
  },

  {
    titulo: "Piedras en el Zapato",
    rol: "Asistente de Dirección",
    anio: "2015",
    detalle: "Producción La Taguara Filmica, Serie de TV - Concincia Tv",
    categorias: ["asistente"],
    video: "https://youtu.be/GplI_N4ZSls",
    portada: ""
  },

  {
    titulo: "Muestra del Festival Internacional de Cine Nueva Mirada",
    rol: "Producción",
    anio: "",
    detalle: "La Taguara Fílmica, Festival de Cine (Venezuela)",
    categorias: ["produccion"],
    video: "https://youtu.be/yYtMOAo_92A",
    portada: ""
  },

  {
    titulo: "Allende en su laberinto",
    rol: "Asistente de Dirección",
    anio: "2014",
    detalle: "Director Miguel Littin, Largometraje de ficción (Chile-Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/sVMe7t-9rHI",
    portada: ""
  },

  {
    titulo: "El infierno de Gaspar Mendoza",
    rol: "Asistente de Dirección",
    anio: "2013",
    detalle: "Director Julián Balam, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/p8RwabpaO2Y",
    portada: ""
  },

  {
    titulo: "Ley de Fuga",
    rol: "Asistente de Dirección",
    anio: "2011",
    detalle: "Ignacio Márquez, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/fQYYyk6sPos",
    portada: ""
  },

  {
    titulo: "Brecha en el silencio",
    rol: "Asistente de Dirección",
    anio: "2010",
    detalle: "Directores Andrés y Luís Rodríguez, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/KHCG6nlQTfA",
    portada: ""
  },

  {
    titulo: "Una mirada al mar",
    rol: "Asistente de Dirección",
    anio: "2008",
    detalle: "Directora Andrea Ríos, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/I2pQMLC0jQ8",
    portada: ""
  },

  {
    titulo: "Amor en concreto",
    rol: "Asistente de Dirección",
    anio: "2002",
    detalle: "Director Franco de Peña, Largometraje de ficción (Venezuela)",
    categorias: ["asistente"],
    video: "https://youtu.be/IGvtgo5yyjA",
    portada: ""
  }
  ]
};
