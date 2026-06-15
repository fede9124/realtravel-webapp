'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapPlace, MapDestino } from '@/app/mapa/page'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

// Place markers visible from this zoom level onwards (city-region level)
const PLACE_MIN_ZOOM = 6
// Destino pin markers hidden above this zoom (individual places dominate at city level)
const DESTINO_MAX_ZOOM = 9

// ── Place marker — simple crimson dot ────────────────────────────────────────

function createPlaceMarkerEl(onSelect: () => void): HTMLElement {
  const el = document.createElement('div')
  // No position:relative on root element (CLAUDE.md rule)
  el.style.cssText = 'width:22px;height:22px;cursor:pointer;'

  const inner = document.createElement('div')
  inner.style.cssText = `
    width:22px;height:22px;border-radius:50%;
    background:#c41230;border:2.5px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
    transition:transform 0.12s ease,background 0.12s ease;
  `

  el.addEventListener('mouseenter', () => {
    if (!el.dataset.selected) inner.style.transform = 'scale(1.25)'
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
  el.style.cssText = 'width:52px;height:60px;display:flex;flex-direction:column;align-items:center;cursor:pointer;'

  const circle = document.createElement('div')
  circle.style.cssText = `
    width:46px;height:46px;border-radius:50%;
    background:url('${destino.image}') center/cover;
    border:3px solid #c41230;
    box-shadow:0 3px 12px rgba(0,0,0,0.3);
    flex-shrink:0;
    transition:transform 0.15s ease,box-shadow 0.15s ease;
  `

  const tip = document.createElement('div')
  tip.style.cssText = `
    width:0;height:0;
    border-left:10px solid transparent;
    border-right:10px solid transparent;
    border-top:14px solid #c41230;
    margin-top:-2px;
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

  el.appendChild(circle)
  el.appendChild(tip)
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
  selectedId: string | null
  onSelect?: (id: string) => void
  onBoundsChange?: (bounds: MapBounds) => void
}

export default function MapView({ places, destinos, selectedId, onSelect, onBoundsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const placeMarkersRef = useRef<{ marker: mapboxgl.Marker; id: string }[]>([])
  const destinoMarkersRef = useRef<mapboxgl.Marker[]>([])

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

  // ── Zoom-based visibility — controls place + destino markers by zoom ───────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const updateVisibility = () => {
      const zoom = map.getZoom()
      const showPlaces = zoom >= PLACE_MIN_ZOOM
      const showDestinos = zoom < DESTINO_MAX_ZOOM

      placeMarkersRef.current.forEach(({ marker }) => {
        marker.getElement().style.display = showPlaces ? 'block' : 'none'
      })
      destinoMarkersRef.current.forEach(m => {
        m.getElement().style.display = showDestinos ? 'flex' : 'none'
      })
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
      const el = createPlaceMarkerEl(() => { onSelectRef.current?.(place.id) })
      el.style.display = showMarkers ? 'block' : 'none'

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
      el.style.display = showDestinos ? 'flex' : 'none'
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

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applySelectionStyle(el: HTMLElement, isSelected: boolean) {
  const inner = el.firstElementChild as HTMLElement | null
  if (!inner) return
  el.dataset.selected = isSelected ? 'true' : ''
  if (isSelected) {
    inner.style.background = '#7a0a1e'
    inner.style.transform = 'scale(1.45)'
    inner.style.boxShadow = '0 3px 12px rgba(196,18,48,0.5)'
  } else {
    inner.style.background = '#c41230'
    inner.style.transform = 'scale(1)'
    inner.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)'
  }
}
