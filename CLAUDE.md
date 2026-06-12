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
- Las URLs de imágenes son de Unsplash: `https://images.unsplash.com/photo-XXXXXXXXX?w=600`
- Verificar que los photo IDs de Unsplash existan antes de commitear (algunos retornan 404)

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

### Carga de componentes de mapa

Todos los mapas se importan con `dynamic()` + `ssr: false`:
```tsx
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })
```

## Tailwind v4 — diferencias con v3

- Las reglas custom van dentro de `@layer base` o `@layer components` — nunca fuera de una capa
- Si una utilidad calcula en `0px`, es porque hay un reset sin capa sobreescribiendo la utilidad
- No usar `@apply` con utilidades que dependan de variables CSS sin capa

## Evitar nested `<a>` tags

Los cards de rutas y favoritos usan `<div role="button" onClick={...}>` como wrapper para evitar el error de hidratación de `<a>` dentro de `<a>`. No cambiar el wrapper a `<Link>` si hay `<Link>` internos.

## Rutas disponibles

| Ruta | Descripción |
|---|---|
| `/explorar` | Listado con filtros; incluye Lugares, Destinos y Rutas |
| `/explorar/[id]` | Detalle de lugar con mapa embed (PinMapView) |
| `/destinos/[id]` | Detalle de destino |
| `/rutas/[id]` | Detalle de ruta: sidebar interactivo + RouteMapView |
| `/mapa` | Mapa global con selección de lugar (MapView) |
| `/favoritos` | Colección guardada en localStorage |
| `/red-travel` | Comercios locales |
| `/red-travel/[id]` | Detalle de comercio |
| `/perfil` | Perfil del viajero |

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

## Testing con Playwright CLI

Disponible como `/playwright-cli`. Útil para:
- Verificar errores de consola después de cambios
- Tomar screenshots para validar diseño
- Medir métricas de performance (`eval` con `performance.timing`)

El directorio `.playwright-cli/` está en `.gitignore`. Los logs y snapshots son artefactos de sesión temporales — se pueden borrar del disco libremente.

## Archivos clave

| Archivo | Qué contiene |
|---|---|
| `lib/data.ts` | Todos los datos del catálogo |
| `app/globals.css` | Variables CSS y configuración de Tailwind |
| `next.config.ts` | Config de imágenes, optimizaciones, headers PWA |
| `components/map/RouteMapView.tsx` | Mapa de rutas con lógica de marcadores |
| `components/map/MapView.tsx` | Mapa global con flyTo al seleccionar |
| `app/rutas/[id]/page.tsx` | Layout split sidebar+mapa para rutas |
| `.env.local` | Token de Mapbox (no commitear) |
