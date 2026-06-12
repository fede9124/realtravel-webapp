// ─── Origen único de datos mock de Real Travel ────────────────────────────────
// Todas las páginas (explorar, mapa, favoritos, detalles) leen de aquí.

export type ItemKind = 'lugar' | 'destino' | 'comercio'

export interface Lugar {
  kind: 'lugar'
  id: string
  image: string
  category: string
  title: string
  location: string
  distance?: string
  rating: number
  moods: string[]
  description: string
  hours: string
  entry: string
  destinoId?: string
  lat?: number
  lng?: number
}

export interface Destino {
  kind: 'destino'
  id: string
  image: string
  category: string
  title: string
  location: string
  country: string
  rating: number
  reviewCount: number
  moods: string[]
  editorial: string
  facts: { clima: string; idioma: string; moneda: string; epoca: string }
}

export interface Comercio {
  kind: 'comercio'
  id: string
  image: string
  category: string
  title: string
  location: string
  distance?: string
  rating: number
  badge?: string
  description: string
  address: string
  hours: string
  phone?: string
  website?: string
  benefit?: string
  conditions?: string[]
  destinoId?: string
}

// ─── Lugares ──────────────────────────────────────────────────────────────────

export const LUGARES: Lugar[] = [
  {
    kind: 'lugar',
    id: 'santa-gemma',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600',
    category: 'Iglesia',
    title: 'Parroquia de Santa Gemma Galgani',
    location: 'España',
    distance: '0.34 km',
    rating: 4.8,
    moods: ['historia', 'cultura'],
    description:
      'Templo católico de gran valor histórico y arquitectónico. Construida en el siglo XIX, destaca por su fachada neogótica y su interior decorado con mosaicos que narran la vida de la santa italiana canonizada en 1940. Lugar de peregrinación y recogimiento que atrae a miles de visitantes cada año.',
    hours: 'Lun–Sáb 9:00–20:00 · Dom 10:00–22:00',
    entry: 'Gratuita',
    lat: 40.4232, lng: -3.6977,
  },
  {
    kind: 'lugar',
    id: 'plaza-mayor',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600',
    category: 'Plaza',
    title: 'Plaza Mayor de Madrid',
    location: 'España',
    distance: '1.2 km',
    rating: 4.6,
    moods: ['historia', 'gastronomia', 'cultura'],
    description:
      'El corazón porticado de Madrid desde 1619. Bajo sus arcos conviven cafés centenarios, tiendas de sombreros que resisten al tiempo y la estatua ecuestre de Felipe III. Los domingos por la mañana, los coleccionistas de sellos y monedas toman los soportales como lo hacen desde hace un siglo.',
    hours: 'Espacio abierto, 24 horas',
    entry: 'Gratuita',
    lat: 40.4153, lng: -3.7074,
  },
  {
    kind: 'lugar',
    id: 'sagrada-familia',
    image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=600',
    category: 'Monumento',
    title: 'Sagrada Família',
    location: 'España',
    distance: '2.1 km',
    rating: 4.9,
    moods: ['historia', 'cultura'],
    description:
      'La obra inacabada de Gaudí lleva más de 140 años en construcción y sigue siendo el edificio más visitado de España. Sus fachadas narran la vida de Cristo en piedra; su interior, un bosque de columnas que cambia de color según la hora del día. Reserva con anticipación: las entradas vuelan.',
    hours: 'Lun–Dom 9:00–20:00',
    entry: 'Desde €26 · Reserva online',
    lat: 41.4036, lng: 2.1744,
  },
  {
    kind: 'lugar',
    id: 'alhambra',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    category: 'Palacio',
    title: 'La Alhambra de Granada',
    location: 'España',
    distance: '4.5 km',
    rating: 4.9,
    moods: ['historia', 'cultura', 'relajo'],
    description:
      'Ciudad palatina nazarí suspendida sobre Granada. Sus patios de agua, yeserías y jardines del Generalife condensan ocho siglos de al-Ándalus. El cupo diario de visitantes es estricto: compra la entrada semanas antes y entra al Palacio de los Leones en el horario exacto que indica tu ticket.',
    hours: 'Lun–Dom 8:30–20:00',
    entry: 'Desde €19 · Cupo diario limitado',
    lat: 37.1762, lng: -3.5882,
  },
  {
    kind: 'lugar',
    id: 'arco',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600',
    category: 'Monumento',
    title: 'Arco del Triunfo',
    location: 'España',
    distance: '1.5 km',
    rating: 4.7,
    moods: ['historia'],
    description:
      'Levantado en ladrillo rojo para la Exposición Universal de 1888, el Arc de Triomf de Barcelona es la puerta de entrada al paseo de Lluís Companys. Sus frisos celebran la agricultura, la industria y el comercio; las tardes de domingo lo rodean patinadores y músicos callejeros.',
    hours: 'Espacio abierto, 24 horas',
    entry: 'Gratuita',
    lat: 41.3910, lng: 2.1802,
  },
  {
    kind: 'lugar',
    id: 'basilica-san-marcos',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600',
    category: 'Basílica',
    title: 'Basílica de San Marcos',
    location: 'Venecia, Italia',
    rating: 4.9,
    moods: ['historia', 'cultura'],
    description:
      'Mil años de mosaicos dorados cubren las cúpulas de la basílica más bizantina de Occidente. Los tesoros saqueados de Constantinopla conviven con el cuerpo del evangelista Marcos, robado de Alejandría por dos mercaderes venecianos en el año 828. Sube al museo para ver los caballos de bronce originales.',
    hours: 'Lun–Sáb 9:30–17:15 · Dom 14:00–17:15',
    entry: "Basílica €3 · Pala d'Oro y museo aparte",
    destinoId: 'venecia',
    lat: 45.4345, lng: 12.3393,
  },
  {
    kind: 'lugar',
    id: 'puente-rialto',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600',
    category: 'Monumento',
    title: 'Puente de Rialto',
    location: 'Venecia, Italia',
    rating: 4.7,
    moods: ['historia', 'cultura'],
    description:
      'El puente de piedra más antiguo sobre el Gran Canal, terminado en 1591 contra todos los pronósticos de los ingenieros de la época. Del lado de San Polo, el mercado de Rialto vende pescado y verduras desde hace 900 años: llega antes de las 10 para verlo vivo.',
    hours: 'Espacio abierto, 24 horas',
    entry: 'Gratuita',
    destinoId: 'venecia',
    lat: 45.4380, lng: 12.3358,
  },
  {
    kind: 'lugar',
    id: 'palacio-ducal',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600',
    category: 'Palacio',
    title: 'Palazzo Ducale',
    location: 'Venecia, Italia',
    rating: 4.8,
    moods: ['historia', 'cultura'],
    description:
      'Sede del poder de la Serenísima durante mil años: gótico veneciano por fuera, salas de Tintoretto y Veronese por dentro. El itinerario secreto recorre las celdas desde las que escapó Casanova y cruza el Puente de los Suspiros por dentro.',
    hours: 'Lun–Dom 9:00–19:00',
    entry: 'Desde €30 · Incluye Museo Correr',
    destinoId: 'venecia',
    lat: 45.4336, lng: 12.3403,
  },
  {
    kind: 'lugar',
    id: 'sacsayhuaman',
    image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600',
    category: 'Ruinas',
    title: 'Sacsayhuamán',
    location: 'Cusco, Perú',
    rating: 4.8,
    moods: ['historia', 'aventura', 'naturaleza'],
    description:
      'Fortaleza inca a 3.700 metros con bloques de piedra de hasta 120 toneladas ensamblados sin argamasa. Cada 24 de junio, el Inti Raymi recrea la ceremonia solar con miles de actores. Subí caminando desde la Plaza de Armas: 20 minutos cuesta arriba que valen cada jadeo.',
    hours: 'Lun–Dom 7:00–18:00',
    entry: 'Boleto turístico parcial S/70',
    destinoId: 'cusco',
    lat: -13.5088, lng: -71.9817,
  },
  {
    kind: 'lugar',
    id: 'san-blas',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600',
    category: 'Barrio',
    title: 'Barrio de San Blas',
    location: 'Cusco, Perú',
    rating: 4.7,
    moods: ['cultura', 'gastronomia'],
    description:
      'El barrio de los artesanos cusqueños: calles empedradas imposiblemente empinadas, talleres de talla en piedra, cafés en terrazas con vista a los tejados coloniales y el púlpito de San Blas, obra maestra tallada en un solo tronco de cedro.',
    hours: 'Barrio abierto, 24 horas',
    entry: 'Gratuita',
    destinoId: 'cusco',
    lat: -13.5160, lng: -71.9770,
  },
  {
    kind: 'lugar',
    id: 'mercado-san-pedro',
    image: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=600',
    category: 'Mercado',
    title: 'Mercado de San Pedro',
    location: 'Cusco, Perú',
    rating: 4.6,
    moods: ['gastronomia', 'cultura'],
    description:
      'El estómago de Cusco. Jugos de fruta por un sol, platos de cuy y chicharrón que no aparecen en ninguna guía, y señoras que llevan cuatro generaciones vendiendo en el mismo puesto. Ve temprano: a las 7 ya está en pleno movimiento.',
    hours: 'Lun–Dom 6:00–18:00',
    entry: 'Gratuita',
    destinoId: 'cusco',
    lat: -13.5227, lng: -71.9764,
  },
  {
    kind: 'lugar',
    id: 'fushimi-inari',
    image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=600',
    category: 'Santuario',
    title: 'Fushimi Inari-taisha',
    location: 'Kyoto, Japón',
    rating: 4.9,
    moods: ['historia', 'cultura', 'naturaleza'],
    description:
      'Diez mil torii bermellón forman un túnel que sube el monte Inari durante 4 kilómetros. Los primeros tramos son turismo puro; la cima, a una hora de caminata, es silencio total y vistas sobre todo Kyoto. Madruga o ve al anochecer, cuando los zorros de piedra parecen cobrar vida.',
    hours: 'Abierto 24 horas',
    entry: 'Gratuita',
    destinoId: 'kyoto',
    lat: 34.9671, lng: 135.7727,
  },
  {
    kind: 'lugar',
    id: 'arashiyama',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600',
    category: 'Bosque',
    title: 'Bosque de Bambú de Arashiyama',
    location: 'Kyoto, Japón',
    rating: 4.8,
    moods: ['naturaleza', 'relajo'],
    description:
      'El sonido del viento entre los tallos de bambú de 20 metros tiene designación oficial de "paisaje sonoro de Japón". El paseo dura quince minutos; la experiencia depende de la hora. Antes de las 8 de la mañana, tendrás el sendero para vos solo.',
    hours: 'Abierto 24 horas',
    entry: 'Gratuita',
    destinoId: 'kyoto',
    lat: 35.0094, lng: 135.6680,
  },
  {
    kind: 'lugar',
    id: 'kinkaku-ji',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600',
    category: 'Templo',
    title: 'Kinkaku-ji',
    location: 'Kyoto, Japón',
    rating: 4.8,
    moods: ['historia', 'cultura'],
    description:
      'El Pabellón Dorado es la postal de Kyoto: tres pisos cubiertos de pan de oro que se reflejan en el estanque como un espejismo. El edificio actual es una reconstrucción de 1955 (un monje quemó el original en 1950, historia que Mishima noveló). El jardín zen que lo rodea es lo que realmente merece la visita.',
    hours: 'Lun–Dom 9:00–17:00',
    entry: '¥500',
    destinoId: 'kyoto',
    lat: 35.0394, lng: 135.7292,
  },
]

// ─── Destinos ─────────────────────────────────────────────────────────────────

export const DESTINOS: Destino[] = [
  {
    kind: 'destino',
    id: 'venecia',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1400',
    category: 'Ciudad',
    title: 'Venecia',
    location: 'Italia',
    country: 'Italia',
    rating: 4.8,
    reviewCount: 2847,
    moods: ['historia', 'cultura', 'relajo'],
    editorial:
      'Venecia no se entiende desde los mapas. Se entiende perdiéndose: en un callejón sin salida que termina en un canal, en el silencio de una plaza que el turismo aún no ha encontrado, en el olor particular de la laguna según la estación. Es una ciudad que lleva siglos desafiando la lógica, construida sobre el agua por una sociedad de comerciantes que convirtieron la fragilidad en carácter.',
    facts: { clima: 'Mediterráneo', idioma: 'Italiano', moneda: 'Euro (€)', epoca: 'Abr–Jun · Sep–Nov' },
  },
  {
    kind: 'destino',
    id: 'cusco',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1400',
    category: 'Ciudad',
    title: 'Cusco',
    location: 'Perú',
    country: 'Perú',
    rating: 4.9,
    reviewCount: 1932,
    moods: ['aventura', 'historia', 'naturaleza'],
    editorial:
      'A 3.400 metros, Cusco obliga a caminar lento, y esa es su primera lección. La ciudad imperial inca sobrevive debajo de la colonial: muros de piedra perfecta sosteniendo iglesias barrocas, mercados donde el quechua se mezcla con el español, y la sensación constante de que cada calle sube. Aclimátate dos días antes de pensar en Machu Picchu.',
    facts: { clima: 'Andino seco', idioma: 'Español · Quechua', moneda: 'Sol (S/)', epoca: 'May–Sep (seca)' },
  },
  {
    kind: 'destino',
    id: 'patagonia',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400',
    category: 'Región',
    title: 'Patagonia',
    location: 'Chile / Argentina',
    country: 'Chile / Argentina',
    rating: 4.9,
    reviewCount: 1418,
    moods: ['aventura', 'naturaleza', 'relajo'],
    editorial:
      'La Patagonia es una escala distinta: distancias que se miden en días, vientos con nombre propio y glaciares que crujen como edificios vivos. No hay versión exprés que valga la pena. Elige un lado de la cordillera, Torres del Paine o El Chaltén, y dale el tiempo que pide. El clima cambia cuatro veces por tarde; el asombro, ninguna.',
    facts: { clima: 'Frío ventoso', idioma: 'Español', moneda: 'CLP · ARS', epoca: 'Nov–Mar (verano austral)' },
  },
  {
    kind: 'destino',
    id: 'marruecos',
    image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400',
    category: 'País',
    title: 'Marruecos',
    location: 'África del Norte',
    country: 'Marruecos',
    rating: 4.7,
    reviewCount: 2104,
    moods: ['aventura', 'cultura', 'gastronomia'],
    editorial:
      'Marruecos funciona por capas: la medina y la ville nouvelle, el regateo y la hospitalidad, el caos de Marrakech y el silencio del desierto a tres horas de distancia. Acepta el té de menta cuando te lo ofrezcan, pierde la mañana en un zoco sin rumbo y duerme al menos una noche bajo las estrellas del Sáhara.',
    facts: { clima: 'Árido · Mediterráneo', idioma: 'Árabe · Francés', moneda: 'Dírham (MAD)', epoca: 'Mar–May · Sep–Nov' },
  },
  {
    kind: 'destino',
    id: 'kyoto',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400',
    category: 'Ciudad',
    title: 'Kyoto',
    location: 'Japón',
    country: 'Japón',
    rating: 4.9,
    reviewCount: 3241,
    moods: ['historia', 'cultura', 'relajo', 'gastronomia'],
    editorial:
      'Kyoto guarda dos mil templos y la mitad de los tesoros nacionales de Japón, pero su verdadero lujo es el ritmo. Madruga para tener el bosque de bambú de Arashiyama en silencio, aprende a distinguir un jardín seco de uno de paseo, y cena donde no haya menú en inglés. La ciudad premia a quien la recorre despacio.',
    facts: { clima: 'Templado húmedo', idioma: 'Japonés', moneda: 'Yen (¥)', epoca: 'Mar–Abr · Oct–Nov' },
  },
]

// ─── Comercios ────────────────────────────────────────────────────────────────

export const COMERCIOS: Comercio[] = [
  {
    kind: 'comercio',
    id: 'rincon',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    category: 'Gastronomía',
    title: 'Restaurante El Rincón',
    location: 'Madrid, España',
    distance: '0.5 km',
    rating: 4.5,
    badge: '15% OFF',
    description:
      'Casa de comidas madrileña de tercera generación. Cocido los miércoles, callos los viernes y una barra donde el vermut de grifo sigue siendo ritual de mediodía. Carta corta, producto de mercado y cero prisa.',
    address: 'Calle de la Cava Baja 23, Madrid',
    hours: 'Mar–Dom 13:00–16:30 · 20:00–23:30',
    phone: '+34 913 65 42 17',
    website: 'elrincondelacava.es',
    benefit: '15% de descuento en carta (no incluye menú del día) al mostrar tu perfil Real Travel.',
    conditions: ['Válido de martes a jueves', 'No acumulable con otras promociones', 'Una vez por usuario'],
  },
  {
    kind: 'comercio',
    id: 'ceramica',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
    category: 'Artesanía',
    title: 'Taller Cerámica Artesanal',
    location: 'Toledo, España',
    distance: '1.1 km',
    rating: 4.7,
    badge: '20% OFF',
    description:
      'Obrador familiar donde la loza toledana se sigue pintando a pincel. Piezas únicas de reflejo metálico, encargos personalizados y demostraciones de torno los sábados por la mañana.',
    address: 'Callejón de San Pedro 4, Toledo',
    hours: 'Lun–Sáb 10:00–14:00 · 17:00–20:00',
    phone: '+34 925 22 81 36',
    website: 'ceramicatoledo.es',
    benefit: '20% de descuento en piezas de la colección propia al mostrar tu perfil Real Travel.',
    conditions: ['Compra mínima €25', 'No aplica a encargos personalizados', 'Una vez por usuario'],
  },
  {
    kind: 'comercio',
    id: 'boutique',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600',
    category: 'Tiendas',
    title: 'Boutique Local Moda',
    location: 'Barcelona, España',
    distance: '0.8 km',
    rating: 4.3,
    description:
      'Moda de autor barcelonesa: diseñadores emergentes del Raval, tiradas cortas y tejidos de proximidad. El escaparate cambia cada semana; lo que ves hoy probablemente no esté mañana.',
    address: 'Carrer dels Tallers 11, Barcelona',
    hours: 'Lun–Sáb 11:00–20:30',
    website: 'boutiquelocalbcn.com',
  },
  {
    kind: 'comercio',
    id: 'lounge',
    image: 'https://images.unsplash.com/photo-1567722066597-c43de4059abb?w=600',
    category: 'Aeropuertos',
    title: 'Lounge Viajero Plus',
    location: 'Barajas, Madrid',
    rating: 4.6,
    badge: '10% OFF',
    description:
      'Sala VIP en la T4 de Barajas con duchas, cocina en vivo y cabinas de siesta. Acceso por horas sin necesidad de volar en business: ideal para escalas largas.',
    address: 'Terminal 4, Aeropuerto Adolfo Suárez Madrid-Barajas',
    hours: 'Todos los días 5:00–24:00',
    phone: '+34 902 40 47 04',
    website: 'loungeviajeroplus.com',
    benefit: '10% de descuento en el acceso de 3 horas al mostrar tu perfil Real Travel.',
    conditions: ['Sujeto a aforo disponible', 'No válido en salidas de 6:00 a 9:00', 'Una vez por usuario'],
  },
  {
    kind: 'comercio',
    id: 'tapas',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600',
    category: 'Gastronomía',
    title: 'Bar de Tapas Tradicional',
    location: 'Sevilla, España',
    distance: '0.3 km',
    rating: 4.4,
    badge: '25% OFF',
    description:
      'Azulejos centenarios, jamones colgando y tapas que no han cambiado en cincuenta años: espinacas con garbanzos, montadito de pringá y manzanilla bien fría. De pie y con bullicio, como debe ser.',
    address: 'Calle Mateos Gago 9, Sevilla',
    hours: 'Lun–Dom 12:00–16:00 · 19:30–24:00',
    phone: '+34 954 21 76 50',
    benefit: '25% de descuento en la cuenta de tapas (bebidas no incluidas) al mostrar tu perfil Real Travel.',
    conditions: ['Válido solo en barra', 'Máximo 4 personas por mesa', 'Una vez por usuario'],
  },
  {
    kind: 'comercio',
    id: 'artesania-local',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    category: 'Artesanía',
    title: 'Mercado de Artesanías',
    location: 'Valencia, España',
    distance: '2.0 km',
    rating: 4.5,
    description:
      'Treinta puestos de artesanos valencianos bajo una nave modernista: abanicos pintados a mano, cestería de Carrícola y cerámica de Manises. Los productores atienden en persona los fines de semana.',
    address: 'Plaza Redonda s/n, Valencia',
    hours: 'Mar–Dom 10:00–20:00',
    website: 'mercadoartesaniasvalencia.es',
  },
  {
    kind: 'comercio',
    id: 'murano-glass',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
    category: 'Artesanía',
    title: 'Fornace Murano Glass',
    location: 'Murano, Venecia',
    rating: 4.8,
    badge: '15% OFF',
    description:
      'Taller artesanal de vidrio soplado en la isla de Murano, activo desde 1923. Maestros vidrieros en cuarta generación producen piezas únicas con técnicas medievales. Cada obra lleva el sello de autenticidad Murano y el nombre del artesano que la creó.',
    address: 'Fondamenta dei Vetrai 47, Murano, Venecia',
    hours: 'Lun–Sáb 9:00–18:00 · Dom 10:00–16:00',
    phone: '+39 041 739 201',
    website: 'muranoglass.com',
    benefit: '15% de descuento en todas las piezas de la colección permanente al mostrar tu perfil Real Travel.',
    conditions: ['Válido para compras superiores a €30', 'No acumulable con otras promociones', 'Válido hasta diciembre 2026', 'Una vez por usuario'],
    destinoId: 'venecia',
  },
  {
    kind: 'comercio',
    id: 'gondola-serenata',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600',
    category: 'Experiencia',
    title: 'Gondola Serenata',
    location: 'Gran Canal, Venecia',
    rating: 4.9,
    badge: '10% OFF',
    description:
      'Paseo en góndola de 40 minutos por los canales menores con música en vivo. Las salidas del atardecer recorren tramos sin tráfico turístico; reserva el primer turno de la tarde para la mejor luz.',
    address: 'Embarcadero Santa Maria del Giglio, Venecia',
    hours: 'Lun–Dom 10:00–20:00 (según clima)',
    phone: '+39 041 528 5075',
    website: 'gondolaserenata.it',
    benefit: '10% de descuento en el paseo del atardecer al mostrar tu perfil Real Travel.',
    conditions: ['Reserva con 24 horas de anticipación', 'Máximo 5 pasajeros por góndola', 'Una vez por usuario'],
    destinoId: 'venecia',
  },
  {
    kind: 'comercio',
    id: 'alle-testiere',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    category: 'Osteria',
    title: 'Alle Testiere',
    location: 'Venecia, Italia',
    rating: 4.8,
    description:
      'Nueve mesas y una carta que depende del mercado de Rialto de esa mañana. Mariscos de laguna, vinos del Véneto y dos turnos de cena estrictos. Sin reserva no hay mesa, así de simple.',
    address: 'Calle del Mondo Novo 5801, Venecia',
    hours: 'Mar–Sáb 12:30–14:30 · 19:00–22:00',
    phone: '+39 041 522 7220',
    website: 'osterialletestiere.it',
    destinoId: 'venecia',
  },
  {
    kind: 'comercio',
    id: 'antiche-carampane',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    category: 'Restaurante',
    title: 'Antiche Carampane',
    location: 'Venecia, Italia',
    rating: 4.7,
    description:
      'Escondido en un laberinto de San Polo, con un cartel que dice "no pizza, no lasagne, no menú turístico". Cocina veneciana sin concesiones: moeche fritas en temporada y spaghetti con cassopipa.',
    address: 'Rio Terà de le Carampane 1911, Venecia',
    hours: 'Mar–Sáb 12:45–14:30 · 19:30–22:30',
    phone: '+39 041 524 0165',
    website: 'antichecarampane.com',
    destinoId: 'venecia',
  },
  {
    kind: 'comercio',
    id: 'al-covo',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600',
    category: 'Trattoria',
    title: 'Al Covo',
    location: 'Venecia, Italia',
    rating: 4.9,
    description:
      "Matrimonio ítalo-texano al frente de una de las cocinas más respetadas de Castello. Pescado de la lonja de Chioggia, verduras de Sant'Erasmo y una carta de vinos naturales que vale el viaje.",
    address: 'Campiello de la Pescaria 3968, Venecia',
    hours: 'Vie–Mar 12:45–14:15 · 19:30–22:00',
    phone: '+39 041 522 3812',
    website: 'ristorantealcovo.com',
    destinoId: 'venecia',
  },
  {
    kind: 'comercio',
    id: 'chicha',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    category: 'Restaurante',
    title: 'Chicha por Gastón Acurio',
    location: 'Cusco, Perú',
    rating: 4.8,
    badge: '10% OFF',
    description:
      'Cocina cusqueña de autor en una casona colonial de la Plaza Regocijo. Gastón Acurio lleva los platos andinos a otro nivel: rocoto relleno, chicharrón de chancho y postres con cacao de Quillabamba.',
    address: 'Plaza Regocijo 261, 2do piso, Cusco',
    hours: 'Lun–Dom 12:00–23:00',
    phone: '+51 84 240 520',
    website: 'chicha.com.pe',
    benefit: '10% de descuento en la cuenta total al mostrar tu perfil Real Travel.',
    conditions: ['Válido de lunes a jueves', 'No incluye bebidas alcohólicas', 'Reserva requerida', 'Una vez por usuario'],
    destinoId: 'cusco',
  },
  {
    kind: 'comercio',
    id: 'cusco-textiles',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    category: 'Artesanía',
    title: 'Centro de Textiles Tradicionales',
    location: 'Cusco, Perú',
    rating: 4.7,
    description:
      'Cooperativa de tejedoras quechuas que trabajan con técnicas prehispánicas. Cada pieza lleva semanas de trabajo manual con tintes naturales. El museo explica la simbología detrás de cada patrón.',
    address: 'Av. El Sol 603, Cusco',
    hours: 'Lun–Sáb 8:00–20:00 · Dom 9:00–18:00',
    phone: '+51 84 228 117',
    website: 'textilescusco.org',
    destinoId: 'cusco',
  },
  {
    kind: 'comercio',
    id: 'nishiki-market',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600',
    category: 'Mercado',
    title: 'Nishiki Market',
    location: 'Kyoto, Japón',
    rating: 4.6,
    description:
      'Cinco cuadras de puestos bajo techo que los locales llaman "la cocina de Kyoto". Encurtidos de 400 años, dashi fresco, dulces de matcha artesanales y tamagoyaki hecho al momento. Visitá entre semana para evitar las multitudes.',
    address: 'Nishikikoji-dori, Nakagyo-ku, Kyoto',
    hours: 'Lun–Dom 9:00–18:00 (varía por puesto)',
    destinoId: 'kyoto',
  },
  {
    kind: 'comercio',
    id: 'kyoto-machiya',
    image: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=600',
    category: 'Alojamiento',
    title: 'Machiya Guesthouse Kiyomizu',
    location: 'Higashiyama, Kyoto',
    rating: 4.9,
    badge: '15% OFF',
    description:
      'Casa de madera tradicional de 120 años reconvertida en hospedaje boutique. Futones sobre tatami, baño de hinoki y desayuno kaiseki incluido. A cinco minutos a pie del templo Kiyomizu-dera.',
    address: 'Higashiyama-ku, Kiyomizu 2-chome, Kyoto',
    hours: 'Check-in 15:00–20:00 · Check-out 11:00',
    phone: '+81 75 541 7803',
    website: 'machiyakiyomizu.jp',
    benefit: '15% de descuento en la tarifa por noche al reservar con tu perfil Real Travel.',
    conditions: ['Estadía mínima 2 noches', 'Sujeto a disponibilidad', 'No válido en temporada de sakura', 'Una vez por usuario'],
    destinoId: 'kyoto',
  },
]

// ─── Reseñas ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  author: string
  avatar: string
  date: string
  rating: number
  text: string
  destinoId: string
}

export const REVIEWS: Review[] = [
  {
    id: 'r1', author: 'María García', avatar: 'M', date: '2026-03-15', rating: 5,
    text: 'Venecia en noviembre es otra ciudad. Sin las multitudes del verano pudimos perdernos por los callejones de Dorsoduro sin cruzarnos con ningún grupo con paraguas-banderín. El hotel que reservamos por Real Travel tenía vista al canal — algo que no esperábamos por ese precio.',
    destinoId: 'venecia',
  },
  {
    id: 'r2', author: 'Carlos Méndez', avatar: 'C', date: '2026-02-20', rating: 4,
    text: 'Hermosa pero cara. Los descuentos de la Red Travel ayudaron bastante con las comidas. Alle Testiere fue la mejor cena del viaje, aunque hay que reservar con semanas de anticipación.',
    destinoId: 'venecia',
  },
  {
    id: 'r3', author: 'Lucía Torres', avatar: 'L', date: '2026-01-08', rating: 5,
    text: 'El paseo en góndola al atardecer con el descuento Real Travel fue el punto alto del viaje. Los canales menores son incomparablemente más bonitos que el Gran Canal lleno de vaporettos.',
    destinoId: 'venecia',
  },
  {
    id: 'r4', author: 'Andrés Ruiz', avatar: 'A', date: '2026-04-10', rating: 5,
    text: 'Cusco te obliga a ir despacio y eso es lo mejor que le puede pasar a un viajero. Seguí el consejo de aclimatar dos días antes de ir a Machu Picchu y fue la mejor decisión. San Blas es un barrio que no querés dejar.',
    destinoId: 'cusco',
  },
  {
    id: 'r5', author: 'Valentina Paz', avatar: 'V', date: '2026-03-28', rating: 5,
    text: 'Chicha por Gastón Acurio con el descuento Real Travel: rocoto relleno que te cambia la vida. El Mercado de San Pedro a las 7am es pura magia.',
    destinoId: 'cusco',
  },
  {
    id: 'r6', author: 'Diego Herrera', avatar: 'D', date: '2026-05-02', rating: 4,
    text: 'Kyoto en otoño es de otro planeta. Fushimi Inari a las 6am, solos con los zorros de piedra. La machiya donde dormimos tenía un baño de hinoki que olía increíble. Único consejo: evitar los buses y moverse en bicicleta.',
    destinoId: 'kyoto',
  },
  {
    id: 'r7', author: 'Sofía Navarro', avatar: 'S', date: '2026-04-18', rating: 5,
    text: 'El bosque de bambú de Arashiyama antes de las 8am es una experiencia mística. Kyoto premia a los madrugadores como ninguna otra ciudad.',
    destinoId: 'kyoto',
  },
  {
    id: 'r8', author: 'Martín Vega', avatar: 'M', date: '2026-02-14', rating: 5,
    text: 'Patagonia es una escala distinta, literalmente. Cuatro días en El Chaltén, el Fitz Roy apareció limpio solo una mañana y valió toda la espera. No intenten hacer Torres y Chaltén en el mismo viaje si tienen menos de 10 días.',
    destinoId: 'patagonia',
  },
  {
    id: 'r9', author: 'Camila Rivas', avatar: 'C', date: '2026-01-22', rating: 4,
    text: 'Marruecos es un viaje sensorial completo. El caos de Marrakech me superó las primeras horas, pero después de aceptar el ritmo, fue maravilloso. La noche en el desierto es imperdible — estrellas como nunca vi.',
    destinoId: 'marruecos',
  },
]

export const reviewsDeDestino = (destinoId: string) => REVIEWS.filter(r => r.destinoId === destinoId)

// ─── Rutas ───────────────────────────────────────────────────────────────────

export interface Ruta {
  kind: 'ruta'
  id: string
  title: string
  description: string
  destinoId: string
  stops: string[]
  duration: string
  distance: string
}

export const RUTAS: Ruta[] = [
  {
    kind: 'ruta', id: 'venecia-clasica', title: 'Venecia clásica en 1 día',
    description: 'El recorrido esencial por los monumentos icónicos de Venecia, terminando con un aperitivo junto al Gran Canal.',
    destinoId: 'venecia',
    stops: ['palacio-ducal', 'basilica-san-marcos', 'puente-rialto'],
    duration: '6–8 horas', distance: '4.2 km',
  },
  {
    kind: 'ruta', id: 'cusco-historico', title: 'Cusco histórico a pie',
    description: 'Desde la Plaza de Armas hasta Sacsayhuamán, pasando por el barrio artesano de San Blas.',
    destinoId: 'cusco',
    stops: ['mercado-san-pedro', 'san-blas', 'sacsayhuaman'],
    duration: '4–5 horas', distance: '3.8 km',
  },
  {
    kind: 'ruta', id: 'kyoto-templos', title: 'Templos de Kyoto',
    description: 'Una jornada completa recorriendo los templos imperdibles de la antigua capital japonesa.',
    destinoId: 'kyoto',
    stops: ['fushimi-inari', 'kinkaku-ji', 'arashiyama'],
    duration: '8–10 horas', distance: '18 km (en bus y a pie)',
  },
]

export const findRuta = (id: string) => RUTAS.find(r => r.id === id)

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const findLugar = (id: string) => LUGARES.find(l => l.id === id)
export const findDestino = (id: string) => DESTINOS.find(d => d.id === id)
export const findComercio = (id: string) => COMERCIOS.find(c => c.id === id)

export const lugaresDeDestino = (destinoId: string) => LUGARES.filter(l => l.destinoId === destinoId)
export const comerciosDeDestino = (destinoId: string) => COMERCIOS.filter(c => c.destinoId === destinoId)

/** Resuelve un id de favorito contra los tres catálogos. */
export const findAny = (id: string): Lugar | Destino | Comercio | undefined =>
  findLugar(id) ?? findDestino(id) ?? findComercio(id)

/** Href canónico según el tipo de item. */
export const hrefFor = (item: Lugar | Destino | Comercio): string =>
  item.kind === 'lugar' ? `/explorar/${item.id}`
  : item.kind === 'destino' ? `/destinos/${item.id}`
  : `/red-travel/${item.id}`
