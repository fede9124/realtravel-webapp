# Real Travel

Guía de viaje editorial PWA — maqueta de producto con datos hardcodeados para validación de diseño e interacción.

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 16.2.9 | Framework (Turbopack) |
| React | 19.2.7 | UI |
| TypeScript | 5.8.3 | Tipado |
| Tailwind CSS | 4.3.0 | Estilos (CSS cascade layers) |
| Mapbox GL JS | 3.24.0 | Mapas interactivos |
| Phosphor Icons | 2.1.10 | Iconografía |

**Fuentes**: Fraunces (display/titulares) · DM Sans (cuerpo)  
**Color de marca**: Carmesí `#C41230`  
**Paleta de superficie**: `#faf9f6` (warm off-white)

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crear .env.local con:
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_aqui

# 3. Arrancar servidor de desarrollo
npm run dev
# → http://localhost:3000
```

> **Nota sobre dependencias**: antes de instalar paquetes nuevos, verificar que tengan al menos 1 día de antigüedad. Revisar el ecosistema instalado actualmente para no romper otros proyectos.

---

## Estructura del proyecto

```
realtravel-webapp/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Layout raíz (fuentes, shell, PWA)
│   ├── page.tsx                # Redirect → /explorar
│   ├── not-found.tsx           # Página 404 personalizada
│   ├── globals.css             # Variables CSS, capas de Tailwind
│   ├── explorar/
│   │   ├── page.tsx            # Listado de Lugares, Destinos y Rutas
│   │   └── [id]/page.tsx       # Detalle de lugar (mapa + reseñas)
│   ├── destinos/
│   │   └── [id]/page.tsx       # Detalle de destino
│   ├── rutas/
│   │   └── [id]/page.tsx       # Detalle de ruta (sidebar + mapa de ruta)
│   ├── mapa/page.tsx           # Mapa global con todos los lugares
│   ├── favoritos/page.tsx      # Colección guardada (localStorage)
│   ├── red-travel/
│   │   ├── page.tsx            # Listado de comercios locales
│   │   └── [id]/page.tsx       # Detalle de comercio
│   ├── perfil/page.tsx         # Perfil del viajero
│   └── offline/page.tsx        # Fallback sin conexión (PWA)
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Wrapper principal con sidebar
│   │   └── SideNav.tsx         # Navegación lateral desktop/mobile
│   ├── map/
│   │   ├── MapView.tsx         # Mapa global (streets-v12, Mapbox)
│   │   ├── RouteMapView.tsx    # Mapa de ruta (línea + marcadores numerados)
│   │   └── PinMapView.tsx      # Mapa embed en detalle de lugar (light-v11)
│   ├── ui/
│   │   ├── Card.tsx            # Card genérica (lugar/destino/comercio)
│   │   ├── Accordion.tsx       # Acordeón para reseñas y detalles
│   │   ├── ChipFilter.tsx      # Chips de filtro por categoría/mood
│   │   ├── SearchBar.tsx       # Barra de búsqueda de texto
│   │   └── TransitionLink.tsx  # Link con animación de transición
│   └── pwa/
│       └── PwaRegister.tsx     # Registro del service worker
│
├── hooks/
│   ├── useFavorites.ts         # Favoritos persistidos en localStorage
│   └── useScrollReveal.ts      # Animaciones de entrada al hacer scroll
│
├── lib/
│   └── data.ts                 # Todos los datos hardcodeados del catálogo
│
└── public/
    ├── sw.js                   # Service worker (caché offline)
    ├── manifest.json           # Web App Manifest (PWA)
    └── icons/                  # Íconos de la PWA
```

---

## Datos del catálogo (`lib/data.ts`)

Todo el contenido es hardcodeado — no hay base de datos ni API. El archivo exporta:

| Export | Tipo | Descripción |
|---|---|---|
| `LUGARES` | `Lugar[]` | Puntos de interés turístico (13 items) |
| `DESTINOS` | `Destino[]` | Ciudades/regiones destino |
| `COMERCIOS` | `Comercio[]` | Comercios locales con beneficios |
| `RUTAS` | `Ruta[]` | Rutas temáticas (3 items: Venecia, Cusco, Kyoto) |
| `findLugar(id)` | función | Busca un lugar por ID |
| `findDestino(id)` | función | Busca un destino por ID |
| `findRuta(id)` | función | Busca una ruta por ID |
| `findAny(id)` | función | Busca en todos los tipos |
| `hrefFor(item)` | función | Genera la URL de navegación para cualquier item |

### IDs de rutas disponibles

| ID | Título |
|---|---|
| `venecia-clasica` | Venecia clásica en 1 día |
| `cusco-historico` | Cusco histórico a pie |
| `kyoto-templos` | Templos de Kyoto |

---

## Mapas (Mapbox GL JS)

Todos los componentes de mapa usan `dynamic()` con `ssr: false` para evitar errores de hidratación.

| Componente | Estilo Mapbox | Uso |
|---|---|---|
| `MapView` | `streets-v12` | Mapa global `/mapa` — todos los lugares |
| `RouteMapView` | `light-v11` | Rutas — línea GeoJSON + marcadores numerados |
| `PinMapView` | `light-v11` | Embed en detalle de lugar |

**Token**: `NEXT_PUBLIC_MAPBOX_TOKEN` en `.env.local`

### Marcadores — patrón anti-drift

Los marcadores de Mapbox usan una estructura de dos elementos para evitar que el transform de escala en hover sobreescriba el `transform: translate(Xpx, Ypx)` que Mapbox calcula internamente:

```
el (outer, 48px) ← Mapbox ancla aquí, NO aplicar position:relative ni transform
└── inner (32px, círculo visual) ← aquí van scale y cambios de color
```

---

## Sistema de favoritos

`useFavorites` persiste en `localStorage` bajo la clave `rt-favorites`. Acepta IDs de cualquier tipo (lugar, destino, comercio). Los favoritos se muestran en `/favoritos` con tabs por categoría.

---

## PWA

- **Service worker**: `public/sw.js` — caché de activos estáticos
- **Manifest**: `public/manifest.json` — instalable en móvil
- **Offline fallback**: `/offline` — página de error sin conexión
- **Theme color**: `#C41230` (carmesí de marca)

---

## CSS y Tailwind

Tailwind v4 con `@tailwindcss/postcss`. Todas las utilidades custom y resets van dentro de `@layer base` / `@layer components` para no romper la cascada de Tailwind.

**Variables CSS principales** (definidas en `globals.css`):

```css
--color-crimson: #c41230
--color-surface: #faf9f6
--color-card: #ffffff
--color-text-primary: #1a1a1a
--color-text-muted: #6b7280
--color-border: #e5e0d8
--font-family-display: Fraunces
--font-family-heading: DM Sans
```

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo (Turbopack, puerto 3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
```

---

## Notas de desarrollo

- **No mockar imágenes**: las URLs de Unsplash están hardcodeadas en `lib/data.ts`. Si una imagen da 404, reemplazar el photo ID directamente en ese archivo.
- **No hay API routes**: el proyecto es completamente estático desde el punto de vista del servidor.
- **Turbopack obligatorio**: el proyecto usa `next dev` (Turbopack por defecto en Next 16). No cambiar a webpack.
- **Vulnerabilidades npm**: hay 2 vulnerabilidades moderadas en `postcss` interno de Next.js. El "fix" automático bajaría Next a v9 (breaking). Ignorar hasta que Next.js publique un parche.
