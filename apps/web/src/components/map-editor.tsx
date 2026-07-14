'use client'

import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type React from 'react'
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import Map, { NavigationControl, ScaleControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { logToServerAction } from '@/app/(app)/[slug]/dashboard/actions'
import mapboxgl from 'mapbox-gl'
import { env } from '@saas/env'

const MAPBOX_TOKEN = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export interface MapEditorProps {
  initialValue?: any
  onChange: (geoJson: any) => void
  center?: { longitude: number; latitude: number }
  forwardedRef?: React.Ref<MapEditorRef>
}

export interface MapEditorRef {
  finalize: () => any
}

export function MapEditor({
  initialValue,
  onChange,
  center,
  forwardedRef,
}: MapEditorProps) {
  const drawRef = useRef<MapboxDraw | null>(null)
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: -43.1729, // Rio de Janeiro as default
    latitude: -22.9068,
    zoom: 12,
  })

  // Synchronize dynamic center changes
  useEffect(() => {
    if (center) {
      setViewState((prev) => ({
        ...prev,
        ...center,
        zoom: 14,
      }))
    }
  }, [center])

  // Get user geolocation if no initial center/value
  useEffect(() => {
    if (!initialValue && !center && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState((prev) => ({
          ...prev,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 14,
        }))
      })
    }
  }, [initialValue, center])

  const onUpdate = useCallback(() => {
    logToServerAction('[DEBUG CL] MapEditor onUpdate called')
    if (drawRef.current) {
      const data = drawRef.current.getAll()
      logToServerAction(`[DEBUG CL] MapEditor data: ${JSON.stringify(data)}`)
      onChange(data)
    }
  }, [onChange])

  const onDelete = useCallback(() => {
    logToServerAction('[DEBUG CL] MapEditor onDelete called')
    if (drawRef.current) {
      const data = drawRef.current.getAll()
      logToServerAction(`[DEBUG CL] MapEditor data: ${JSON.stringify(data)}`)
      onChange(data)
    }
  }, [onChange])

  const handleMapLoad = useCallback(
    (evt: any) => {
      logToServerAction('[DEBUG CL] MapEditor onLoad triggered')
      const map = evt.target

      if (!drawRef.current) {
        logToServerAction('[DEBUG CL] MapEditor creating MapboxDraw')
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            line_string: true,
            trash: true,
          },
          defaultMode: initialValue ? 'simple_select' : 'draw_line_string',
        })
        map.addControl(draw, 'top-left')
        drawRef.current = draw

        map.on('draw.create', onUpdate)
        map.on('draw.update', onUpdate)
        map.on('draw.delete', onDelete)

        // Add initial value if style is loaded
        if (initialValue) {
          if (map.isStyleLoaded()) {
            draw.add(initialValue)
          } else {
            map.once('style.load', () => {
              draw.add(initialValue)
            })
          }
        }
        logToServerAction('[DEBUG CL] MapEditor MapboxDraw setup completed')
      }
    },
    [initialValue, onUpdate, onDelete]
  )

  useImperativeHandle(forwardedRef, () => ({
    finalize: () => {
      logToServerAction('[DEBUG CL] MapEditor finalize called')
      if (drawRef.current) {
        const mode = drawRef.current.getMode()
        logToServerAction(`[DEBUG CL] MapEditor current mode: ${mode}`)
        if (mode === 'draw_line_string') {
          try {
            drawRef.current.changeMode('simple_select')
            logToServerAction(
              '[DEBUG CL] MapEditor changeMode to simple_select succeeded'
            )
          } catch (e) {
            logToServerAction(`[DEBUG CL] MapEditor changeMode error: ${e}`)
          }
        }
        const allData = drawRef.current.getAll()
        logToServerAction(
          `[DEBUG CL] MapEditor finalize data: ${JSON.stringify(allData)}`
        )
        return allData
      }
      logToServerAction(
        '[DEBUG CL] MapEditor finalize drawRef.current is null!'
      )
      return null
    },
  }))

  // Dynamically synchronize initialValue changes (for async loaded routes)
  useEffect(() => {
    if (drawRef.current && initialValue && mapRef.current) {
      const currentFeatures = drawRef.current.getAll()
      if (currentFeatures.features.length === 0) {
        drawRef.current.deleteAll()
        drawRef.current.add(initialValue)

        // Center/fit bounds to the loaded route
        const coords = initialValue.features?.[0]?.geometry?.coordinates
        if (coords && coords.length > 0) {
          const map = mapRef.current.getMap()
          const bounds = new mapboxgl.LngLatBounds()
          for (const coord of coords) {
            bounds.extend(coord)
          }
          map.fitBounds(bounds, { padding: 40, duration: 1000 })
        }
      }
    }
  }, [initialValue])

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="top-right" />
        <ScaleControl />
      </Map>

      <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-white/90 p-3 font-bold text-[10px] text-gray-900 shadow-lg backdrop-blur-sm">
        <p className="mb-1 text-orange-500 uppercase tracking-widest">
          Dica de Percurso
        </p>
        <p>Clique no mapa para começar a desenhar o trajeto.</p>
      </div>
    </div>
  )
}
