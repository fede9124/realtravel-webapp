'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Lugar } from '@/lib/data'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface Props {
  stops: Lugar[]
  selectedIdx: number | null
  onMarkerClick: (idx: number) => void
}

function createStopMarkerEl(index: number) {
  // Outer wrapper: fixed size, NO position:relative (would override Mapbox's position:absolute)
  const el = document.createElement('div')
  el.style.cssText = `
    width: 48px; height: 48px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  `
  // Inner circle: scales on hover/select without affecting the anchor
  const inner = document.createElement('div')
  inner.style.cssText = `
    width: 32px; height: 32px; border-radius: 50%;
    background: #ffffff; border: 2.5px solid #c41230;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    color: #c41230;
    box-shadow: 0 2px 8px rgba(196,18,48,0.3);
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    transform-origin: center center;
    font-family: system-ui, sans-serif;
    pointer-events: none;
  `
  inner.textContent = String(index + 1)
  el.appendChild(inner)
  return { el, inner }
}

export default function RouteMapView({ stops, selectedIdx, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ marker: mapboxgl.Marker; inner: HTMLDivElement }[]>([])

  const stopsWithCoords = stops.filter(s => s.lat != null && s.lng != null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || stopsWithCoords.length === 0) return

    const coords = stopsWithCoords.map(s => [s.lng!, s.lat!] as [number, number])

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: coords[0],
      zoom: 13,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      // Route line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {},
        },
      })

      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 6 },
      })

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#c41230', 'line-width': 3, 'line-dasharray': [2, 1.5] },
      })

      // Fit map to all stops with padding
      const bounds = coords.reduce(
        (b, c) => b.extend(c as [number, number]),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      )
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 0 })

      // Markers
      stopsWithCoords.forEach((stop, i) => {
        const { el, inner } = createStopMarkerEl(i)
        el.addEventListener('click', () => onMarkerClick(i))
        el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.2)' })
        el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)' })

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([stop.lng!, stop.lat!])
          .addTo(map)

        markersRef.current.push({ marker, inner })
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync selected marker + flyTo
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(({ inner }, i) => {
      const isSelected = i === selectedIdx
      inner.style.background = isSelected ? '#c41230' : '#ffffff'
      inner.style.color = isSelected ? '#ffffff' : '#c41230'
      inner.style.transform = isSelected ? 'scale(1.3)' : 'scale(1)'
      inner.style.boxShadow = isSelected
        ? '0 4px 16px rgba(196,18,48,0.45)'
        : '0 2px 8px rgba(196,18,48,0.3)'
    })

    if (selectedIdx !== null && stopsWithCoords[selectedIdx]) {
      const stop = stopsWithCoords[selectedIdx]
      map.flyTo({ center: [stop.lng!, stop.lat!], zoom: 15, duration: 700 })
    }
  }, [selectedIdx, stopsWithCoords])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
