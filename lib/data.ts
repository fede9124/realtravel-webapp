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
  },
  {
    kind: 'lugar',
    id: 'plaza-mayor',
    image: 'https://images.unsplash.com/photo-1543702303-55e3b3e73cef?w=600',
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
  },
  {
    kind: 'lugar',
    id: 'sagrada-familia',
    image: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57?w=600',
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
    entry: 'Basílica €3 · Pala d’Oro y museo aparte',
    destinoId: 'venecia',
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
      'Matrimonio ítalo-texano al frente de una de las cocinas más respetadas de Castello. Pescado de la lonja de Chioggia, verduras de Sant’Erasmo y una carta de vinos naturales que vale el viaje.',
    address: 'Campiello de la Pescaria 3968, Venecia',
    hours: 'Vie–Mar 12:45–14:15 · 19:30–22:00',
    phone: '+39 041 522 3812',
    website: 'ristorantealcovo.com',
    destinoId: 'venecia',
  },
]

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
