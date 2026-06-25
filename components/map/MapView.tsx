'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapPlace, MapDestino, MapComercio } from '@/app/mapa/page'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

// Two zoom layers: destinos (world/continental, zoom < 13) → lugares + comercios (city, zoom ≥ 13)
const DESTINO_MAX_ZOOM = 13
const PLACE_MIN_ZOOM = 13
const COMERCIO_MIN_ZOOM = 13

const OPACITY_TRANSITION = 'opacity 350ms ease'

// ── Category → icon + accent color ────────────────────────────────────────────
// Simple monochrome glyphs (not pixel-perfect Phosphor icons) — vanilla marker DOM can't render React icon components.

const ICON_CHURCH = '<path d="M12 2v4M9.5 5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M5 21V11l7-5 7 5v10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M9 21v-6h6v6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>'
const ICON_MUSEUM = '<path d="M3 9l9-5 9 5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M5 9v10M9.5 9v10M14.5 9v10M19 9v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 21h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
const ICON_TREE = '<circle cx="12" cy="9" r="6" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 15v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
const ICON_MONUMENT = '<path d="M12 2l4 8H8l4-8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M9 10v11M15 10v11M5 21h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
const ICON_CROWN = '<path d="M4 18h16M4 18l-1-9 5 4 4-7 4 7 5-4-1 9" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/>'
const ICON_SHOP = '<path d="M4 9l1-5h14l1 5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M4 9h16v11H4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M9 13a3 3 0 0 0 6 0" stroke="currentColor" stroke-width="1.6" fill="none"/>'
const ICON_BUILDINGS = '<path d="M4 21V9l6-4v16M14 21V13l6-4v12" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><path d="M2 21h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
const ICON_STAR = '<path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.1 1.3-6.6-4.9-4.6 6.6-.7Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>'
const ICON_PIN = '<path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="none"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" stroke-width="1.6" fill="none"/>'

interface CategoryMarker { color: string; icon: string }

const CATEGORY_MARKERS: Record<string, CategoryMarker> = {
  Iglesia: { color: '#c41230', icon: ICON_CHURCH },
  Basílica: { color: '#c41230', icon: ICON_CHURCH },
  Santuario: { color: '#c41230', icon: ICON_CHURCH },
  Monasterio: { color: '#c41230', icon: ICON_CHURCH },
  Templo: { color: '#c41230', icon: ICON_CHURCH },
  Museo: { color: '#8B5CF6', icon: ICON_MUSEUM },
  Parque: { color: '#16A34A', icon: ICON_TREE },
  Jardín: { color: '#16A34A', icon: ICON_TREE },
  Bosque: { color: '#16A34A', icon: ICON_TREE },
  Monumento: { color: '#D97706', icon: ICON_MONUMENT },
  Fuente: { color: '#D97706', icon: ICON_MONUMENT },
  Ruinas: { color: '#D97706', icon: ICON_MONUMENT },
  Palacio: { color: '#7C3AED', icon: ICON_CROWN },
  Castillo: { color: '#7C3AED', icon: ICON_CROWN },
  Barrio: { color: '#EA580C', icon: ICON_SHOP },
  Mercado: { color: '#EA580C', icon: ICON_SHOP },
  Plaza: { color: '#059669', icon: ICON_PIN },
  Rascacielos: { color: '#475569', icon: ICON_BUILDINGS },
  Experiencia: { color: '#0891B2', icon: ICON_STAR },
}

const DEFAULT_MARKER: CategoryMarker = { color: '#c41230', icon: ICON_PIN }

function getCategoryMarker(category: string): CategoryMarker {
  return CATEGORY_MARKERS[category] ?? DEFAULT_MARKER
}

// ── Place marker — icon by category, larger + stronger shadow when featured ──

const PLACE_MARKER_SIZE = 28
const PLACE_MARKER_ICON_SIZE = 15

function createPlaceMarkerEl(place: MapPlace, onSelect: () => void): HTMLElement {
  const { color, icon } = getCategoryMarker(place.category)
  const size = PLACE_MARKER_SIZE
  const iconSize = PLACE_MARKER_ICON_SIZE

  const el = document.createElement('div')
  // No position:relative on root element (CLAUDE.md rule)
  // Mapbox GL resets opacity on the root .mapboxgl-marker element — control visibility on the inner child instead
  el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;`
  el.dataset.layer = 'place'

  const inner = document.createElement('div')
  inner.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    background:white;border:2.5px solid ${color};
    display:flex;align-items:center;justify-content:center;
    box-shadow:${place.featured ? '0 4px 14px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.25)'};
    transition:transform 0.12s ease, opacity 350ms ease;
    color:${color};
    opacity:0;pointer-events:none;
  `
  inner.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">${icon}</svg>`
  inner.dataset.baseColor = color

  el.addEventListener('mouseenter', () => {
    if (!el.dataset.selected) inner.style.transform = 'scale(1.2)'
  })
  el.addEventListener('mouseleave', () => {
    if (!el.dataset.selected) inner.style.transform = 'scale(1)'
  })
  el.addEventListener('click', onSelect)

  el.appendChild(inner)
  return el
}

// ── Destino pin marker — circle photo + triangular tip ────────────────────────
// anchor: 'bottom' so the tip lands exactly on the coordinate

function createDestinoPinEl(destino: MapDestino): HTMLElement {
  const el = document.createElement('div')
  // No position:relative on root element (CLAUDE.md rule)
  // Mapbox GL resets opacity on root — use a wrapper child for visibility control
  el.style.cssText = `width:44px;height:52px;cursor:pointer;`
  el.dataset.layer = 'destino'

  const wrapper = document.createElement('div')
  wrapper.style.cssText = `width:44px;height:52px;display:flex;flex-direction:column;align-items:center;opacity:0;pointer-events:none;transition:${OPACITY_TRANSITION};`

  const circle = document.createElement('div')
  circle.style.cssText = `
    width:38px;height:38px;border-radius:50%;
    background:url('${destino.image}') center/cover;
    border:2.5px solid #c41230;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    flex-shrink:0;
    transition:transform 0.15s ease,box-shadow 0.15s ease;
  `

  const tip = document.createElement('div')
  tip.style.cssText = `
    width:0;height:0;
    border-left:8px solid transparent;
    border-right:8px solid transparent;
    border-top:11px solid #c41230;
    margin-top:-1px;
    pointer-events:none;
  `

  el.addEventListener('mouseenter', () => {
    circle.style.transform = 'scale(1.1)'
    circle.style.boxShadow = '0 5px 20px rgba(196,18,48,0.45)'
  })
  el.addEventListener('mouseleave', () => {
    circle.style.transform = 'scale(1)'
    circle.style.boxShadow = '0 3px 12px rgba(0,0,0,0.3)'
  })

  wrapper.appendChild(circle)
  wrapper.appendChild(tip)
  el.appendChild(wrapper)
  return el
}

// ── Comercio marker — store icon, intermediate zoom layer ────────────────────

function createComercioMarkerEl(comercio: MapComercio, onSelect: () => void): HTMLElement {
  const size = PLACE_MARKER_SIZE
  const iconSize = PLACE_MARKER_ICON_SIZE

  const el = document.createElement('div')
  // No position:relative on root element (CLAUDE.md rule)
  el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;`
  el.dataset.layer = 'comercio'

  const inner = document.createElement('div')
  inner.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    background:white;border:2.5px solid #EA580C;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
    transition:transform 0.12s ease, opacity 350ms ease;
    color:#EA580C;
    opacity:0;pointer-events:none;
  `
  inner.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none">${ICON_SHOP}</svg>`
  inner.dataset.baseColor = '#EA580C'

  el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.2)' })
  el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)' })
  el.addEventListener('click', onSelect)

  el.appendChild(inner)
  return el
}

// ── User location dot ─────────────────────────────────────────────────────────

function createUserMarkerEl() {
  const el = document.createElement('div')
  el.style.cssText = `
    width:18px;height:18px;border-radius:50%;
    background:#2563EB;border:3px solid white;
    box-shadow:0 0 0 5px rgba(37,99,235,0.2);
  `
  return el
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MapBounds { north: number; south: number; east: number; west: number }

interface Props {
  places: MapPlace[]
  destinos?: MapDestino[]
  comercios?: MapComercio[]
  selectedId: string | null
  flyToTarget?: { lat: number; lng: number; zoom?: number } | null
  onSelect?: (id: string) => void
  onBoundsChange?: (bounds: MapBounds) => void
}

export default function MapView({ places, destinos, comercios, selectedId, flyToTarget, onSelect, onBoundsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const placeMarkersRef = useRef<{ marker: mapboxgl.Marker; id: string }[]>([])
  const destinoMarkersRef = useRef<mapboxgl.Marker[]>([])
  const comercioMarkersRef = useRef<mapboxgl.Marker[]>([])

  // Keep callbacks current so event listeners don't go stale
  const onSelectRef = useRef(onSelect)
  const onBoundsChangeRef = useRef(onBoundsChange)
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange }, [onBoundsChange])

  // ── Map initialization (once) ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1.5,
      attributionControl: false,
    })

    const reportBounds = () => {
      const b = map.getBounds()
      if (!b) return
      onBoundsChangeRef.current?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    }

    // Fly to user location once on mount and place marker at real position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          // Guard: map may have been removed before callback fires
          if (!mapRef.current) return
          const center: [number, number] = [pos.coords.longitude, pos.coords.latitude]
          map.flyTo({ center, zoom: 11, duration: 1800, essential: true })
          new mapboxgl.Marker({ element: createUserMarkerEl() })
            .setLngLat(center)
            .addTo(map)
        },
        () => {
          // Permission denied or unavailable — keep default world view, no user marker
        },
        { timeout: 6000 }
      )
    }

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      // Remove visual noise
      for (const layerId of ['poi-label', 'settlement-subdivision-label']) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'none')
        }
      }

      reportBounds()
      setMapLoaded(true)
    })

    // Report bounds whenever the viewport settles after pan or zoom
    map.on('moveend', reportBounds)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Zoom-based visibility — 3 gradual layers: destinos → comercios → lugares ─
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const setVisible = (el: HTMLElement, visible: boolean) => {
      const child = el.firstElementChild as HTMLElement | null
      if (!child) return
      child.style.opacity = visible ? '1' : '0'
      child.style.pointerEvents = visible ? 'auto' : 'none'
    }

    const updateVisibility = () => {
      const zoom = map.getZoom()
      const showPlaces = zoom >= PLACE_MIN_ZOOM
      const showDestinos = zoom < DESTINO_MAX_ZOOM
      const showComercios = zoom >= COMERCIO_MIN_ZOOM

      placeMarkersRef.current.forEach(({ marker }) => setVisible(marker.getElement(), showPlaces))
      destinoMarkersRef.current.forEach(m => setVisible(m.getElement(), showDestinos))
      comercioMarkersRef.current.forEach(m => setVisible(m.getElement(), showComercios))
    }

    map.on('zoom', updateVisibility)
    updateVisibility() // apply at current zoom immediately

    return () => { map.off('zoom', updateVisibility) }
  }, [mapLoaded])

  // ── Place markers — recreate when places list or map changes ──────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    // Remove previous markers
    placeMarkersRef.current.forEach(({ marker }) => marker.remove())
    placeMarkersRef.current = []

    const zoom = map.getZoom()
    const showMarkers = zoom >= PLACE_MIN_ZOOM

    places.forEach(place => {
      const el = createPlaceMarkerEl(place, () => { onSelectRef.current?.(place.id) })
      const inner = el.firstElementChild as HTMLElement
      if (showMarkers) { inner.style.opacity = '1'; inner.style.pointerEvents = 'auto' }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map)

      placeMarkersRef.current.push({ marker, id: place.id })
    })

    // Sync selection style on newly created markers
    placeMarkersRef.current.forEach(({ marker, id }) => {
      applySelectionStyle(marker.getElement(), id === selectedId)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, mapLoaded])

  // ── Comercio markers — intermediate zoom layer ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || !comercios?.length) return

    comercioMarkersRef.current.forEach(m => m.remove())
    comercioMarkersRef.current = []

    const zoom = map.getZoom()
    const showComercios = zoom >= COMERCIO_MIN_ZOOM

    comercios.forEach(comercio => {
      const el = createComercioMarkerEl(comercio, () => { onSelectRef.current?.(comercio.id) })
      const inner = el.firstElementChild as HTMLElement
      if (showComercios) { inner.style.opacity = '1'; inner.style.pointerEvents = 'auto' }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([comercio.lng, comercio.lat])
        .addTo(map)

      comercioMarkersRef.current.push(marker)
    })

    return () => {
      comercioMarkersRef.current.forEach(m => m.remove())
      comercioMarkersRef.current = []
    }
  }, [comercios, mapLoaded])

  // ── Selected highlight + flyTo ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    placeMarkersRef.current.forEach(({ marker, id }) => {
      applySelectionStyle(marker.getElement(), id === selectedId)
    })

    if (selectedId) {
      const place = places.find(p => p.id === selectedId)
      if (place) {
        map.flyTo({
          center: [place.lng, place.lat],
          zoom: Math.max(map.getZoom(), 13),
          duration: 800,
        })
      }
    }
  }, [selectedId, places, mapLoaded])

  // ── Destino pin markers ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || !destinos?.length) return

    destinoMarkersRef.current.forEach(m => m.remove())
    destinoMarkersRef.current = []

    const zoom = map.getZoom()
    const showDestinos = zoom < DESTINO_MAX_ZOOM

    destinos.forEach(destino => {
      const el = createDestinoPinEl(destino)
      const wrapper = el.firstElementChild as HTMLElement
      if (showDestinos) { wrapper.style.opacity = '1'; wrapper.style.pointerEvents = 'auto' }
      el.addEventListener('click', () => {
        map.flyTo({ center: [destino.lng, destino.lat], zoom: 10, duration: 1200, essential: true })
      })

      // anchor:'bottom' places the pin tip exactly at the coordinate
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([destino.lng, destino.lat])
        .addTo(map)

      destinoMarkersRef.current.push(marker)
    })

    return () => {
      destinoMarkersRef.current.forEach(m => m.remove())
      destinoMarkersRef.current = []
    }
  }, [destinos, mapLoaded])

  // ── External flyTo target (e.g. search result selection) ──────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || !flyToTarget) return
    map.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? Math.max(map.getZoom(), 13),
      duration: 1000,
      essential: true,
    })
  }, [flyToTarget, mapLoaded])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applySelectionStyle(el: HTMLElement, isSelected: boolean) {
  const inner = el.firstElementChild as HTMLElement | null
  if (!inner) return
  const baseColor = inner.dataset.baseColor ?? '#c41230'
  el.dataset.selected = isSelected ? 'true' : ''
  if (isSelected) {
    inner.style.background = baseColor
    inner.style.color = 'white'
    inner.style.transform = 'scale(1.35)'
    inner.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)'
  } else {
    inner.style.background = 'white'
    inner.style.color = baseColor
    inner.style.transform = 'scale(1)'
    inner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)'
  }
}
