// ==========================================================
// PORTAFOLIO DE ADRIANA CASTRO
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
    online: "Edición Online",
    offline: "Edición Offline",
    coordinacion: "Coordinación de Postproducción",
    direccion: "Dirección"
  },

  trabajos: [
    {
    titulo: "Gutierrez is mai neim",
    rol: "Edición Online",
    anio: "2026",
    detalle: "Serie,Disney+, Director: Jesus Braceras.",
    categorias: ["online"],
    video: "https://www.youtube.com/watch?v=8UVbuA4C3qg",
    portada: ""
  },
      {
    titulo: "Pepita, la pistolera",
    rol: "Edición Online",
    anio: "2026",
    detalle: "Cines & Disney+, Directora: Lucía Puenzo.",
    categorias: ["online"],
    video: "https://www.youtube.com/watch?v=Bdot4cLhLwM",
    portada: ""
  },
 {
    titulo: "Un mal partido",
    rol: "Lead Edición Online",
    anio: "2026",
    detalle: "Cines & Disney+, Director: Salvador Espinosa.",
    categorias: ["online"],
    video: "https://www.youtube.com/watch?v=vCnXS0NXsPo",
    portada: ""
  },

  {
    titulo: "El Encargado 4",
    rol: "Lead Edición Online",
    anio: "2026",
    detalle: "Serie, Disney+. Showrunner: Jeronimo Carranza.",
    categorias: ["online"],
    video: "https://youtu.be/gRiibk97NqI",
    portada: ""
  },

  {
    titulo: "Familia a la deriva",
    rol: "Lead Edición Online",
    anio: "2026",
    detalle: "Cines & Disney+, Director: Alfonso Pineda Ulloa.",
    categorias: ["online"],
    video: "https://youtu.be/-76wb48m-hA",
    portada: ""
  },

  {
    titulo: "PlayBack",
    rol: "Lead Edición Online",
    anio: "2025",
    detalle: "Disney+",
    categorias: ["online"],
    video: "https://youtu.be/MbzDjwVzH_w",
    portada: ""
  },

  {
    titulo: "Homo Argentum",
    rol: "Edición Online",
    anio: "2025",
    detalle: "Directores Gastón Duprat, Mariano Cohn, Cines y Disney+",
    categorias: ["online"],
    video: "https://youtu.be/_Tdk26fRQE0",
    portada: ""
  },

  {
    titulo: "Mesa de Regalos",
    rol: "Edición Online",
    anio: "2025",
    detalle: "Director Noé Santillán-López, Cines y Disney+",
    categorias: ["online"],
    video: "https://youtu.be/zEuHhRUPPqw",
    portada: ""
  },

  {
    titulo: "Rita-Lado B",
    rol: "Coordinación de post producción",
    anio: "2025",
    detalle: "Directora Gabriela González Fuentes, Largometraje documental",
    categorias: ["coordinacion"],
    video: "https://vimeo.com/1121626771",
    portada: ""
  },

  {
    titulo: "Legerin, en busca de Alina",
    rol: "Edicion y Montaje de Trailer",
    anio: "2025",
    detalle: "Directora María Laura Vásquez, Largometraje documental",
    categorias: ["offline"],
    video: "https://youtu.be/Ra1YYOdmmzw",
    portada: ""
  },

  {
    titulo: "Linda",
    rol: "Edición Online",
    anio: "2024",
    detalle: "Mariana Wainstein, Cines y Disney+",
    categorias: ["online"],
    video: "https://youtu.be/hjkdUT7LtCI",
    portada: ""
  },

  {
    titulo: "El Encargado Temporada 3",
    rol: "Edición Online",
    anio: "2024",
    detalle: "Disney+",
    categorias: ["online"],
    video: "https://youtu.be/2KaVAs45IN4",
    portada: ""
  },

  {
    titulo: "Culpa Cero",
    rol: "Edición Online",
    anio: "2024",
    detalle: "Directoras Valeria Bertuccelli & Mora Elizalde, Cine & Disney+",
    categorias: ["online"],
    video: "https://youtu.be/Y3MpPvbQHXA",
    portada: ""
  },

  {
    titulo: "Argentina '78",
    rol: "Edición Online",
    anio: "2024",
    detalle: "Lucas Bucci y Tomás Sposato, Disney+",
    categorias: ["online"],
    video: "https://youtu.be/agqHqHScs1I",
    portada: ""
  },

  {
    titulo: "Docupandemia",
    rol: "Edición y Montaje",
    anio: "2024",
    detalle: "Producción Cactus Cine, Documental Coorporativo",
    categorias: ["offline"],
    video: "https://vimeo.com/899828942",
    portada: ""
  },

  {
    titulo: "Entre Balas y Acordes",
    rol: "Edición y Montaje",
    anio: "2023",
    detalle: "Director Matias Gueilburt, Serie documental VIX",
    categorias: ["offline"],
    video: "https://youtu.be/cQ62HEuGiHY",
    portada: ""
  },

  {
    titulo: "El Silencio de los hombres",
    rol: "Coordinación de post producción",
    anio: "2023",
    detalle: "Directora Lucía Lubarsky, Largometraje documental",
    categorias: ["coordinacion"],
    video: "https://vimeo.com/817085933",
    portada: ""
  },

  {
    titulo: "Aero Free | Reverse",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Director Hernan Belón, Red Bull Batalla",
    categorias: ["offline"],
    video: "https://youtu.be/zlqVz6g6E-c",
    portada: ""
  },

  {
    titulo: "Aero Free | Lokillo",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Director Hernan Belón, Red Bull Batalla",
    categorias: ["offline"],
    video: "https://youtu.be/rSxEmZn4gQA",
    portada: ""
  },

  {
    titulo: "Aero Free | Vallest",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Director Hernan Belón, Red Bull Batalla",
    categorias: ["offline"],
    video: "https://youtu.be/p1kIxpfcpoI",
    portada: ""
  },

  {
    titulo: "Aero Free | KMC",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Director Hernan Belón, Red Bull Batalla",
    categorias: ["offline"],
    video: "https://youtu.be/scbAFQQ5jT8",
    portada: ""
  },

  {
    titulo: "Aero Free | Mecha",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Director Hernan Belón, Red Bull Batalla",
    categorias: ["offline"],
    video: "https://youtu.be/scbAFQQ5jT8",
    portada: ""
  },

  {
    titulo: "Olga Kirowa",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Directora María Laura Vásquez, Largometraje documental",
    categorias: ["offline"],
    video: "https://youtu.be/tib1no6LzZw",
    portada: ""
  },

  {
    titulo: "Zurda infinita",
    rol: "Edicion y Montaje",
    anio: "2022",
    detalle: "Telesur, Serie de TV",
    categorias: ["offline"],
    video: "https://youtu.be/afEKCdEfyi4",
    portada: ""
  },

  {
    titulo: "El Arponero",
    rol: "Coordinación de post producción",
    anio: "2021",
    detalle: "Director Mirko Stopar, Largometraje documental",
    categorias: ["coordinacion"],
    video: "https://vimeo.com/541792825",
    portada: ""
  },

  {
    titulo: "Los del Fondo",
    rol: "Coordinación de post producción",
    anio: "2021",
    detalle: "Directora Gabriela González Fuentes, Largometraje documental",
    categorias: ["coordinacion"],
    video: "https://vimeo.com/704283920",
    portada: ""
  },

  {
    titulo: "La herida y el cuchillo",
    rol: "Edición Online / Conformado",
    anio: "2019",
    detalle: "Director Miguel Zeballos, Largometraje documental",
    categorias: ["online"],
    video: "https://youtu.be/n25aXSqXaso",
    portada: ""
  },

  {
    titulo: "Enterrados",
    rol: "Coordinación de post producción",
    anio: "2018",
    detalle: "Directora Luis Trapiello, Largometraje documental",
    categorias: ["coordinacion"],
    video: "https://vimeo.com/329871833",
    portada: ""
  },

  {
    titulo: "Parque Central",
    rol: "Edicion y Montaje",
    anio: "2017",
    detalle: "Director Luis Alberto Lamata, Largometraje ficción",
    categorias: ["offline"],
    video: "https://youtu.be/fBoXI3ZXzz8",
    portada: ""
  },

  {
    titulo: "Una al margen",
    rol: "Guión y dirección",
    anio: "2011",
    detalle: "Cortometraje documental",
    categorias: ["direccion"],
    video: "https://youtu.be/iQ36W5A7eXs",
    portada: ""
  },

  {
    titulo: "Ludico Daniel",
    rol: "Guión y dirección",
    anio: "2009",
    detalle: "Cortometraje documental",
    categorias: ["direccion"],
    video: "https://vimeo.com/225308400",
    portada: ""
  }
  ]
};
