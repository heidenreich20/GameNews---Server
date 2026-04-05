require('dotenv').config()
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false,
  },
})

const oldData = [
  {
    title: "Suma y sigue. Crimson Desert no toca techo con su éxito y alcanza un nuevo hito de ventas en menos de dos semanas",
    text: "Pearl Abyss ha compartido la noticia en una publicación de X donde envía también un agradecimiento a todos los usuarios que se han puesto en la piel de Kliff a lo largo de los últimos días. El nuevo hito de ventas no hace más que reiterar el éxito que ha gozado Crimson Desert desde su lanzamiento, ya que hablamos de una cifra impresionante que se ha alcanzado en poco menos de dos semanas. A su vez, también demuestra que el juego ha superado sus primeros escollos y ya se ha ganado al público fan de las experiencias de fantasía y mundo abierto.\n\nBásicamente, Crimson Desert ha experimentado un periplo que ha dado lugar a múltiples comentarios y debates en redes sociales. Tras las impresiones de la prensa, el título recibió decenas de reseñas 'Variadas' y críticas dirigidas a aspectos como la historia o los controles. Sin embargo, Pearl Abyss se apresuró para lanzar parches importantes y solucionó de un plumazo algunas características que habían señalado los jugadores. Desde entonces, el título no ha dejado de sumar reviews positivas y su valoración en la plataforma de Valve ya se encuentra en el 82% de votos favorables (en base a la opinión de más de 69.900 usuarios).\n\nY este particular viaje también se ha observado en los movimientos de Pearl Abyss en la bolsa. Poco antes de su lanzamiento, la compañía vio caer su valor en un 29% como resultado de las reseñas publicadas por la prensa. Posteriormente, con las valoraciones de los jugadores, los inversores regresaron a la desarrolladora hasta recuperar el 90% de lo perdido. Un periplo que, al final, se saldó con una buena noticia para el equipo surcoreano y más motivos para redoblar los esfuerzos con Crimson Desert de cara al futuro.",
    image: "https://i.blogs.es/3a9b77/crimson-desert-5-/1200_800.jpeg",
    category: "RPG",
    author: "Brenda Giacconi",
    console: ["PlayStation", "Xbox", "PC"],
    type: "Noticia",
    created_at: "2026-04-01T19:27:02.915Z",
    updated_at: "2026-04-01T19:27:02.915Z",
  },
  {
    title: "Valorant - Modo Premier: Fecha de lanzamiento, funcionamiento, sistema de rangos y mucho más sobre el modo de juego más esperado de Riot Games",
    text: "Valorant está a punto de recibir el modo de juego más esperado desde el lanzamiento del título. Premier era un sueño de la comunidad que se confirmó en verano del pasado año 2021. Una novedad que iba para largo y que finalmente se hará realidad casi dos años después de su presentación inicial. Ha pasado por diferentes fases de pruebas, una de ellas en el servidor de Brasil, y Riot Games piensa que ya está todo correcto para llevar a cabo el estreno. Nosotros también estamos contando cuántos días falta y es por eso que a continuación vamos a repasar todos los detalles conocidos sobre él.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938188/GameNews/ranked-valorant-1_vikbev.webp",
    category: "Valorant",
    author: "Bruno Ouviña",
    console: [],
    type: "Noticia",
    created_at: "2023-03-06T06:38:42.940Z",
    updated_at: "2023-03-06T06:38:42.940Z",
  },
  {
    title: "Este juego de acción RPG cruza Sekiro con NiOh para llevar los combates contra enemigos imposibles a un nuevo nivel: Análisis de Wo Long Fallen Dynasty",
    text: "Pese a todo lo que es, no es y quiere ser este Wo Long: Fallen Dynasty, debo admitir que lo he cogido con muchas ganas. Muy probablemente porque el parry es una de esas mecánicas de videojuego de las que, bien implementadas, soy incapaz de cansarme. Si la incorporas además siguiendo el estilo de Sekiro, es muy difícil que no mantengas mi atención. Y sí, aunque los propios desarrolladores ya lo hayan comentado, queda rápidamente claro que Wo Long es a Sekiro lo que Nioh fue a Dark Souls. Es decir, uno de los pocos soulslike que, aunque tiene claras las referencias, busca mantener su propio espíritu y personalidad.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/og_jnnste.jpg",
    category: "Wo Long Fallen Dynasty",
    author: "Alejandro Pascual",
    console: ["PlayStation", "Xbox", "PC"],
    type: "Análisis",
    created_at: "2023-03-03T08:37:50.899Z",
    updated_at: "2023-03-03T08:37:50.899Z",
  },
  {
    title: "Sons of the Forest nos saca una lagrimita con sus mutantes: Detalles como este explican el enorme éxito del juego en su primer día",
    text: "Nam condimentum euismod finibus. Mauris varius consectetur nunc, sit amet mollis enim maximus id. Aliquam erat volutpat. Aenean pulvinar enim ac elementum feugiat. Suspendisse in velit sit amet ante cursus ultrices pulvinar eu diam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse sed felis id felis imperdiet pellentesque eget quis ligula. Nulla",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938192/GameNews/sons-of-the-forest-release-date_nwfmcx.webp",
    category: "Sons of the Forest",
    author: "Brenda Giacconi",
    console: [],
    type: "Noticia",
    created_at: "2023-02-25T03:34:16.322Z",
    updated_at: "2023-02-25T03:34:16.322Z",
  },
  {
    title: "Like a Dragon: Ishin, análisis. Entrega con identidad, versión con margen de mejora",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/1366_2000_1_v8gvyh.webp",
    category: "Like a Dragon: Ishin!",
    author: "Alejandro Castillo",
    console: ["PlayStation", "Xbox", "PC"],
    type: "Análisis",
    created_at: "2023-02-17T21:45:13.134Z",
    updated_at: "2023-02-17T21:45:13.134Z",
  },
  {
    title: "Dead Space Remake, análisis. Un juego para temblar de miedo... y de alegría",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/Dead-Space-Review-Site_h4evpn.webp",
    category: "Dead Space Remake",
    author: "David Arroyo",
    console: ["PlayStation", "Xbox", "PC"],
    type: "Análisis",
    created_at: "2023-02-16T22:01:23.155Z",
    updated_at: "2023-02-16T22:01:23.155Z",
  },
  {
    title: "La sorpresa que nadie vio venir y se ha convertido en uno de los mejores hack and slash de los últimos años: Hi-Fi Rush",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/Hibiki-News-Hero-Image-b0b0bdb22448fc9c88fa_wtxw2z.webp",
    category: "Hi-Fi Rush",
    author: "Alejandro Pascual",
    console: ["PlayStation", "Xbox", "Nintendo"],
    type: "Análisis",
    created_at: "2023-02-16T21:07:35.079Z",
    updated_at: "2023-02-16T21:07:35.079Z",
  },
  {
    title: "El destino de Kratos en God of War Ragnarok iba a ser muy diferente: así era la idea que rechazó el director del juego",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/analisis-god-war-ragnarok-2862115_zro7hj.webp",
    category: "God of War: Ragnarok",
    author: "Adrián Mira",
    console: [],
    type: "Noticia",
    created_at: "2023-02-15T02:31:06.234Z",
    updated_at: "2023-02-15T02:31:06.234Z",
  },
  {
    title: "¿Cuánto dura Atomic Heart? El juego desvela su duración, modos de dificultad, número de armas y opciones de diálogo",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938292/GameNews/2834ebea-2dd7-4985-abcf-6d4b3b182e8a_wni4kq.jpg",
    category: "Atomic Heart",
    author: "Pepito Potes",
    console: [],
    type: "Noticia",
    created_at: "2023-02-12T01:35:27.000Z",
    updated_at: "2023-02-12T01:35:27.000Z",
  },
  {
    title: "El estudio detrás de Silent Hill 2: Remake prepara un nuevo juego junto a los creadores de un indie muy aplaudido: Serial Cleaner",
    text: "Etiam elit mi, efficitur sagittis diam sit amet, ullamcorper hendrerit nisl. Sed nisl purus, condimentum ac justo in, mattis cursus leo. Praesent rutrum auctor gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae felis et sem sagittis vehicula. Proin eget libero orci. Sed ullamcorper dolor nec quam facilisis consectetur. Cras blandit tempus diam nec auctor. Donec quis est vel ante bibendum ornare. Etiam cursus metus ligula, at pellentesque eros sollicitudin sed. Etiam quis mauris condimentum, facilisis enim sed, iaculis metus. Proin auctor ullamcorper purus a elementum. Nam lacinia enim in ante tempus tincidunt. Fusce et turpis ullamcorper est malesuada ullamcorper.",
    image: "https://res.cloudinary.com/dpib7ivg1/image/upload/v1685938291/GameNews/silent-hill-2-remake_862x485_j0sgqk.webp",
    category: "Silent Hill 2",
    author: "Rubén Martínez",
    console: [],
    type: "Noticia",
    created_at: "2023-02-11T21:23:24.209Z",
    updated_at: "2023-02-11T21:23:24.209Z",
  },
]

async function seed() {
  console.log(`Seeding ${oldData.length} articles...`)

  for (const doc of oldData) {
    await sql`
      INSERT INTO news (title, text, image, category, author, type, console, created_at, updated_at)
      VALUES (
        ${doc.title},
        ${doc.text},
        ${doc.image},
        ${doc.category},
        ${doc.author},
        ${doc.type},
        ${doc.console},
        ${new Date(doc.createdAt)},
        ${new Date(doc.updatedAt)}
      )
      ON CONFLICT DO NOTHING
    `
  }

  console.log('Seed complete.')
  await sql.end()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})