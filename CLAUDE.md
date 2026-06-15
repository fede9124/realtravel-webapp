# CLAUDE.md — Real Travel Webapp

Instrucciones para Claude Code al trabajar en este proyecto.

## Contexto del proyecto

Maqueta de PWA de turismo editorial. **Sin base de datos** — todos los datos están hardcodeados en `lib/data.ts`. El objetivo es validar diseño e interacción, no construir un backend.

## Stack obligatorio

- **Next.js 16.2.9 con Turbopack** — no cambiar a webpack, no actualizar Next sin validar
- **React 19.2.7** — hooks modernos (`use()` para params, no `useParams`)
- **Tailwind CSS v4.3.0** con `@tailwindcss/postcss` — sintaxis diferente a v3
- **Mapbox GL JS 3.24.0** — reemplazó a Leaflet; no volver a Leaflet
- **TypeScript estricto** — no usar `any`, tipar todo correctamente

## Reglas de dependencias

> El usuario tiene otros proyectos corriendo con el mismo ecosistema Node.

- **Antes de instalar cualquier paquete**: verificar que tenga al menos 1 día de antigüedad
- **Revisar qué está instalado** actualmente antes de agregar dependencias nuevas
- **No usar `npm audit fix --force`** — bajaría Next.js a v9 (breaking change conocido)
- Las 2 vulnerabilidades de `postcss` son internas de Next.js; ignorar hasta parche oficial

## Datos hardcodeados

Todo el contenido vive en `lib/data.ts`. Para agregar o modificar contenido:
- Agregar entradas a `LUGARES`, `DESTINOS`, `COMERCIOS` o `RUTAS`
- Incluir `lat` y `lng` en todos los `Lugar` que aparezcan en mapas
- **IDs deben ser únicos globalmente** — verificar con `LUGARES.map(l => l.id)` antes de agregar
- Las URLs de imágenes son de Unsplash: `https://images.unsplash.com/photo-XXXXXXXXX?w=600`
- Verificar que los photo IDs de Unsplash existan antes de commitear (algunos retornan 404)
- `Comercio` puede tener `rutaIds?: string[]` para vincularlos con rutas propias

## Mapas — reglas críticas

### No poner `position: relative` en el elemento raíz del marcador

Mapbox GL aplica `transform: translate(Xpx, Ypx)` al elemento del marcador para posicionarlo. Si el elemento tiene `position: relative`, Mapbox calcula mal la posición y el marcador se desplaza con el zoom.

**Patrón correcto** (dos elementos):
```tsx
// el: elemento raíz del marcador — SIN position:relative, SIN transform
// inner: elemento visual hijo — aquí van scale, colores, hover
const el = document.createElement('div')
el.style.cssText = `width: 48px; height: 48px; ...` // NO position:relative
const inner = document.createElement('div')
inner.style.cssText = `width: 32px; height: 32px; border-radius: 50%; ...`
el.appendChild(inner)
// Hover: inner.style.transform = 'scale(1.2)' — nunca el.style.transform
```

### MapView — marcadores individuales, zoom y geolocalización

`MapView` usa **`mapboxgl.Marker` HTML** para todos los puntos — sin GeoJSON ni clustering. Hay tres tipos de marcadores:

| Marcador | Función | Ancla | Visible cuando |
|---|---|---|---|
| Punto de lugar | `createPlaceMarkerEl` | `center` | `zoom >= PLACE_MIN_ZOOM (6)` |
| Pin de destino | `createDestinoPinEl` | `bottom` | `zoom < DESTINO_MAX_ZOOM (9)` |
| Punto de usuario | `createUserMarkerEl` | `center` | Una vez, tras geolocalización |

La visibilidad por zoom se controla con un listener único `map.on('zoom', ...)` que actúa sobre los refs de marcadores:
- zoom < 6: solo pins de destino (vista continental/mundial)
- zoom 6–8: ambos tipos superpuestos
- zoom ≥ 9: solo puntos de lugar (vista de ciudad)

Los **pins de destino** tienen forma de marcador clásico: foto circular encima + triángulo apuntando abajo (`border` CSS trick). El ancla `'bottom'` alinea el vértice del triángulo con las coordenadas:
```tsx
const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
  .setLngLat([destino.lng, destino.lat])
  .addTo(map)
```

Al inicializar, llama `navigator.geolocation.getCurrentPosition` y hace `flyTo` si el usuario concede el permiso. Si deniega, mantiene la vista global (`center: [0, 20], zoom: 1.5`).

**Guard de geolocalización**: el callback es asíncrono. Verificar `if (!mapRef.current) return` al inicio para no crashear si el componente desmontó antes de recibir la respuesta.

Las labels de POI y subdivisiones están ocultas vía `setLayoutProperty`:
```tsx
for (const layerId of ['poi-label', 'settlement-subdivision-label']) {
  if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', 'none')
}
```

### MapView — filtro por viewport

`MapView` expone `onBoundsChange` que reporta los límites actuales en cada `moveend`. En `mapa/page.tsx` se usan dos memos separados:
- `mapPlaces`: filtrado solo por categoría — se pasa a `<MapView places={...}>` para renderizar marcadores
- `filtered`: filtrado además por bounds + orden por proximidad — se usa para el panel lateral

```tsx
const mapPlaces = useMemo(() =>
  activeCategory === 'Todos' ? ALL_PLACES : ALL_PLACES.filter(p => p.category === activeCategory),
  [activeCategory]
)

const filtered = useMemo(() => {
  let list = mapPlaces
  if (mapBounds) {
    list = list.filter(p =>
      p.lat >= mapBounds.south && p.lat <= mapBounds.north &&
      p.lng >= mapBounds.west && p.lng <= mapBounds.east
    )
  }
  // ... ordenar por proximidad si nearbyMode
  return list
}, [mapPlaces, mapBounds, nearbyMode, userCoords])
```

### Carga de componentes de mapa

Todos los mapas se importan con `dynamic()` + `ssr: false`:
```tsx
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })
```

## Tailwind v4 — diferencias con v3

- Las reglas custom van dentro de `@layer base` o `@layer components` — nunca fuera de una capa
- Si una utilidad calcula en `0px`, es porque hay un reset sin capa sobreescribiendo la utilidad
- No usar `@apply` con utilidades que dependan de variables CSS sin capa

## Grids de cards — patrón estándar

**Siempre usar `auto-fill` con un máximo fijo de columna**. Nunca `1fr` como máximo — una sola card se expande al ancho completo del contenedor.

```tsx
// Cards de lugar / destino / comercio
gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))'

// Ruta cards (más anchas por el listado de paradas)
gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 420px))'
```

Para **secciones de preview con 1 fila máxima** (ej. en `/explorar`):
```tsx
{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))',
  gridTemplateRows: 'auto',
  gridAutoRows: '0',   // filas extra con altura 0
  overflow: 'hidden',  // recorta el contenido que sobresale
}
```

## Evitar nested `<a>` tags

Las ruta cards y similares usan `<div role="button" onClick={...}>` como wrapper para evitar el error de hidratación de `<a>` dentro de `<a>`. No cambiar el wrapper a `<Link>` si hay `<Link>` internos.

## View Transitions

Las transiciones de página usan `document.startViewTransition` en `components/ui/TransitionLink.tsx`.

**Regla crítica**: el callback debe resolver de forma **síncrona** (sin `setTimeout` ni `await`). App Router renderiza de forma asíncrona; cualquier espera artificial puede superar el timeout del browser y lanzar `TimeoutError: Skipped ViewTransition due to timeout`.

```tsx
// Correcto — resuelve inmediatamente
document.startViewTransition(() => {
  router.push(url)
})

// Incorrecto — timeout en páginas con Mapbox o Suspense
document.startViewTransition(async () => {
  router.push(url)
  await new Promise(resolve => setTimeout(resolve, 120)) // ← NO
})
```

La animación CSS (`globals.css`) solo aplica fade sobre `::view-transition-old/new(root)`. No usar `height`, `object-fit` ni `overflow` en esos pseudo-elementos — no son propiedades válidas para view transitions y pueden bloquear la animación.

### viewTransitionName — regla de unicidad

Solo puede haber **un elemento** con un `viewTransitionName` dado en el DOM en un mismo instante. Si hay dos, el browser lanza `Duplicate view-transition-name value while capturing old state`.

- El `Card` pone `viewTransitionName: 'card-${id}'` en la imagen
- El hero de la página de detalle recibe ese nombre para el morph
- **Nunca poner `viewTransitionName` en un carousel o banner** si los mismos IDs aparecen también en cards en la misma página — genera duplicados

## SideNav — subitems de Explorar

`Explorar` en el sidebar tiene tres subitems que se expanden cuando la ruta activa es `/explorar`, `/lugares`, `/destinos` o `/rutas`. El dropdown usa animación `max-height: 0 → 200px`.

```tsx
const explorarActive = isActive('/explorar') || isActive('/lugares') || isActive('/destinos') || isActive('/rutas')
const explorarExpanded = explorarActive && !isCollapsed
```

## Rutas disponibles

| Ruta | Descripción |
|---|---|
| `/explorar` | Preview de Lugares, Destinos y Rutas (1 fila cada sección) + carousel hero |
| `/explorar/[id]` | Detalle de lugar con mapa embed (PinMapView) |
| `/lugares` | Listado completo de lugares con filtro por categoría |
| `/destinos` | Listado completo de destinos con filtro por mood |
| `/destinos/[id]` | Detalle de destino con secciones: lugares, gastronomía, Red Travel |
| `/rutas` | Listado completo de rutas con filtro por destino |
| `/rutas/[id]` | Detalle de ruta: sidebar interactivo + RouteMapView |
| `/mapa` | Mapa global con marcadores individuales, geolocalización y filtro por viewport |
| `/favoritos` | Colección guardada en localStorage (tabs: lugares, destinos, rutas) |
| `/red-travel` | Comercios locales con beneficios exclusivos |
| `/red-travel/[id]` | Detalle de comercio; muestra rutas vinculadas si `rutaIds` existe |
| `/perfil` | Perfil del viajero |

## Testing con Playwright CLI

Disponible como `/playwright-cli`. Útil para:
- Verificar errores de consola después de cambios
- Tomar screenshots para validar diseño
- Medir métricas de performance (`eval` con `performance.timing`)

El directorio `.playwright-cli/` está en `.gitignore`. Los logs y snapshots son artefactos de sesión temporales — se pueden borrar del disco libremente. No commitear screenshots sueltos en el raíz del proyecto.

## Archivos clave

| Archivo | Qué contiene |
|---|---|
| `lib/data.ts` | Todos los datos del catálogo (97 lugares, 10 destinos, 25 comercios, 12 rutas) |
| `app/globals.css` | Variables CSS y configuración de Tailwind |
| `next.config.ts` | Config de imágenes, optimizaciones, headers PWA |
| `components/map/MapView.tsx` | Mapa global con marcadores HTML individuales, zoom-visibility y geolocalización |
| `components/map/RouteMapView.tsx` | Mapa de rutas con lógica de marcadores |
| `components/map/PinMapView.tsx` | Mapa embed en detalle de lugar |
| `components/ui/Card.tsx` | Card genérica con viewTransitionName en imagen |
| `components/ui/TransitionLink.tsx` | Link con View Transition síncrono |
| `app/explorar/page.tsx` | Carousel hero + preview de 1 fila por sección |
| `app/rutas/[id]/page.tsx` | Layout split sidebar+mapa para rutas |
| `.env.local` | Token de Mapbox (no commitear) |
