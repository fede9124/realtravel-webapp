'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapPlace } from '@/app/mapa/page'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const USER_CENTER: [number, number] = [-3.7038, 40.4168]

function createMarkerEl(color: string, emoji: string) {
  const el = document.createElement('div')
  el.style.cssText = `
    width:42px;height:42px;border-radius:50%;
    background:${color};border:2.5px solid white;
    display:flex;align-items:center;justify-content:center;
    font-size:19px;cursor:pointer;
    box-shadow:0 3px 10px rgba(0,0,0,0.18);
    transition:transform 0.2s ease;
  `
  el.textContent = emoji
  return el
}

function createUserMarkerEl() {
  const el = document.createElement('div')
  el.style.cssText = `
    width:18px;height:18px;border-radius:50%;
    background:#2563EB;border:3px solid white;
    box-shadow:0 0 0 5px rgba(37,99,235,0.2);
  `
  return el
}

interface Props {
  places: MapPlace[]
  selectedId: string | null
}

export default function MapView({ places, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: USER_CENTER,
      zoom: 15.5,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    new mapboxgl.Marker({ element: createUserMarkerEl() })
      .setLngLat(USER_CENTER)
      .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML('<strong>Tu ubicación</strong>'))
      .addTo(map)

    for (const place of places) {
      const el = createMarkerEl(place.color, place.emoji)
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 24 }).setHTML(`
            <div style="min-width:120px">
              <p style="font-weight:700;font-size:13px;margin:0 0 2px">${place.title}</p>
              <p style="font-size:11px;color:#6B7280;margin:0">${place.category} · ${place.distance}</p>
            </div>
          `)
        )
        .addTo(map)
      markersRef.current.set(place.id, { marker, el })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [places])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(({ el }, id) => {
      const isSelected = id === selectedId
      el.style.transform = isSelected ? 'scale(1.35)' : 'scale(1)'
      el.style.zIndex = isSelected ? '10' : '1'
    })

    if (selectedId) {
      const place = places.find(p => p.id === selectedId)
      if (place) {
        map.flyTo({ center: [place.lng, place.lat], zoom: 17, duration: 800 })
      }
    }
  }, [selectedId, places])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
