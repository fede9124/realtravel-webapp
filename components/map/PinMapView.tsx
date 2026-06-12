'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface Props {
  lat: number
  lng: number
  title: string
}

function createPinEl() {
  const el = document.createElement('div')
  el.style.cssText = `
    width: 28px; height: 28px; border-radius: 50%;
    background: #c41230; border: 2.5px solid white;
    box-shadow: 0 2px 8px rgba(196,18,48,0.4);
    display: flex; align-items: center; justify-content: center;
  `
  const dot = document.createElement('div')
  dot.style.cssText = `
    width: 6px; height: 6px; border-radius: 50%; background: white;
  `
  el.appendChild(dot)
  return el
}

export default function PinMapView({ lat, lng, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: 14,
      interactive: true,
      attributionControl: false,
    })

    new mapboxgl.Marker({ element: createPinEl(), anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false }).setText(title))
      .addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, title])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
