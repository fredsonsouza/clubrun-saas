'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/mapbox'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import mapboxgl from 'mapbox-gl'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

interface MapEditorProps {
  initialValue?: any
  onChange: (geoJson: any) => void
  center?: { longitude: number; latitude: number }
}

export function MapEditor({ initialValue, onChange, center }: MapEditorProps) {
  const drawRef = useRef<MapboxDraw | null>(null)
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: -43.1729, // Rio de Janeiro as default
    latitude: -22.9068,
    zoom: 12
  })

  // Set initial location based on browser geolocation
  useEffect(() => {
    if (!initialValue && !center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState((prev) => ({
          ...prev,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 14
        }))
      })
    }
  }, [initialValue, center])

  // Sync with center prop
  useEffect(() => {
    if (center) {
      setViewState((prev) => ({
        ...prev,
        ...center,
        zoom: 14
      }))
    }
  }, [center])

  const onUpdate = useCallback(() => {
    if (drawRef.current) {
      const data = drawRef.current.getAll()
      onChange(data)
    }
  }, [onChange])

  const onDelete = useCallback(() => {
    if (drawRef.current) {
      const data = drawRef.current.getAll()
      onChange(data)
    }
  }, [onChange])

  const setupDraw = useCallback((map: any) => {
    mapRef.current = map
    if (drawRef.current) return

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      defaultMode: 'draw_line_string'
    })

    map.addControl(draw)
    drawRef.current = draw

    if (initialValue) {
      draw.add(initialValue)
    }

    map.on('draw.create', onUpdate)
    map.on('draw.update', onUpdate)
    map.on('draw.delete', onDelete)
  }, [initialValue, onUpdate, onDelete])

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={(e) => setupDraw(e.target)}
      >
        <NavigationControl position="top-right" />
        <ScaleControl />
      </Map>
      
      <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/90 p-3 text-[10px] font-bold text-gray-900 shadow-lg backdrop-blur-sm">
        <p className="mb-1 uppercase tracking-widest text-orange-500">Dica de Percurso</p>
        <p>Clique no mapa para começar a desenhar o trajeto.</p>
      </div>
    </div>
  )
}
