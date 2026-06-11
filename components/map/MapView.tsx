'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Pines categorizados con emoji y color pastel
const CATEGORY_PINS = [
  { id: 1, lat: 40.4168, lng: -3.7038, category: 'Iglesia', emoji: '⛪', color: '#E8D5C4', title: 'Santa Gemma', distance: '0.34 km' },
  { id: 2, lat: 40.4153, lng: -3.7022, category: 'Plaza', emoji: '🏛️', color: '#C8E6C9', title: 'Plaza Mayor', distance: '1.2 km' },
  { id: 3, lat: 40.4142, lng: -3.7065, category: 'Restaurante', emoji: '🍽️', color: '#FFCCBC', title: 'El Rincón', distance: '0.5 km' },
  { id: 4, lat: 40.4178, lng: -3.7010, category: 'Tienda', emoji: '🛍️', color: '#E1BEE7', title: 'Boutique Local', distance: '0.8 km' },
  { id: 5, lat: 40.4190, lng: -3.7055, category: 'Monumento', emoji: '🗿', color: '#B3E5FC', title: 'Arco del Triunfo', distance: '1.5 km' },
]

function createCategoryIcon(color: string, emoji: string) {
  return L.divIcon({
    html: `<div style="
      width:42px;height:42px;border-radius:50%;
      background:${color};border:2.5px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:19px;
      box-shadow:0 3px 10px rgba(0,0,0,0.18);
      cursor:pointer;
    ">${emoji}</div>`,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  })
}

const userIcon = L.divIcon({
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#2563EB;border:3px solid white;
    box-shadow:0 0 0 5px rgba(37,99,235,0.2);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function SetView() {
  const map = useMap()
  useEffect(() => {
    map.setView([40.4168, -3.7038], 16)
  }, [map])
  return null
}

export default function MapView() {
  return (
    <MapContainer
      center={[40.4168, -3.7038]}
      zoom={16}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <SetView />

      {/* Posición del usuario */}
      <Marker position={[40.4168, -3.7038]} icon={userIcon}>
        <Popup>
          <strong>Tu ubicación</strong>
        </Popup>
      </Marker>

      {/* Pines de lugares */}
      {CATEGORY_PINS.map(pin => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={createCategoryIcon(pin.color, pin.emoji)}
        >
          <Popup>
            <div style={{ minWidth: '120px' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{pin.title}</p>
              <p style={{ fontSize: '11px', color: '#6B7280' }}>{pin.category} · {pin.distance}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
