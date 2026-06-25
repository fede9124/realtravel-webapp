'use client'

import { useState, useCallback } from 'react'

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useNearby() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyMode, setNearbyMode] = useState(false)
  const [nearbyLoading, setNearbyLoading] = useState(false)

  const toggleNearby = useCallback(() => {
    if (nearbyMode) { setNearbyMode(false); return }
    if (userCoords) { setNearbyMode(true); return }
    setNearbyLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearbyMode(true)
        setNearbyLoading(false)
      },
      () => setNearbyLoading(false),
      { timeout: 8000 }
    )
  }, [nearbyMode, userCoords])

  return { userCoords, nearbyMode, nearbyLoading, toggleNearby }
}
