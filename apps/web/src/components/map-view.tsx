'use client'

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import Map, {
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Box, Globe, Layers } from 'lucide-react'
import mapboxgl from 'mapbox-gl'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

interface MapViewProps {
  routeData: any
}

export function MapView({ routeData }: MapViewProps) {
  const mapRef = useRef<any>(null)
  const [is3D, setIs3D] = useState(false)
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/outdoors-v12'
  )

  const MAP_STYLES = [
    {
      id: 'mapbox://styles/mapbox/outdoors-v12',
      name: 'Outdoor',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'mapbox://styles/mapbox/satellite-streets-v12',
      name: 'Satélite',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: 'mapbox://styles/mapbox/light-v11',
      name: 'Light',
      icon: <Layers className="h-4 w-4 opacity-50" />,
    },
    {
      id: 'mapbox://styles/mapbox/dark-v11',
      name: 'Dark',
      icon: <Layers className="h-4 w-4 text-gray-400" />,
    },
  ]

  const initialViewState = useMemo(() => {
    if (routeData?.features && routeData.features.length > 0) {
      const coords = routeData.features[0].geometry.coordinates[0]
      if (coords) {
        return {
          longitude: coords[0],
          latitude: coords[1],
          zoom: 14,
          pitch: 0,
          bearing: 0,
        }
      }
    }
    return {
      longitude: -43.1729,
      latitude: -22.9068,
      zoom: 12,
      pitch: 0,
      bearing: 0,
    }
  }, [routeData])

  const onLoad = useCallback(
    (evt: any) => {
      const map = evt.target
      if (is3D) {
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
      }
    },
    [is3D]
  )

  const toggle3D = useCallback(() => {
    if (!mapRef.current) return

    const next3D = !is3D
    setIs3D(next3D)

    if (next3D) {
      mapRef.current.flyTo({
        pitch: 60,
        bearing: -20,
        duration: 2000,
      })
    } else {
      mapRef.current.flyTo({
        pitch: 0,
        bearing: 0,
        duration: 2000,
      })
    }
  }, [is3D])

  // Dynamically set terrain when is3D or mapStyle changes
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const applyTerrain = () => {
      if (is3D) {
        if (map.getSource('mapbox-dem')) {
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
        }
      } else {
        map.setTerrain(null)
      }
    }

    if (map.isStyleLoaded()) {
      applyTerrain()
    } else {
      map.once('style.load', applyTerrain)
    }
  }, [is3D, mapStyle])

  if (!routeData) return null

  return (
    <div className="relative h-[650px] w-full overflow-hidden rounded-[3rem] border border-gray-100 shadow-2xl">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={onLoad}
      >
        <NavigationControl position="top-right" />
        <ScaleControl />

        {/* TERRAIN SOURCE */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* SKY LAYER FOR 3D EFFECT */}
        <Layer
          id="sky"
          type="sky"
          paint={{
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15,
          }}
        />

        <Source id="route" type="geojson" data={routeData}>
          <Layer
            id="route-line-casing"
            type="line"
            paint={{
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 1,
            }}
          />
          <Layer
            id="route-line"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
            paint={{
              'line-color': '#f97316', // orange-500
              'line-width': 5,
              'line-opacity': 1,
            }}
          />
        </Source>
      </Map>

      {/* OVERLAY INFO & CONTROLS */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
        <div className="rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur-md">
          <h4 className="font-black text-orange-500 text-xs uppercase tracking-widest">
            Percurso Oficial
          </h4>
          <p className="font-bold text-gray-900 text-sm">
            Explore o trajeto da prova
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-3xl bg-white/90 p-2 shadow-xl backdrop-blur-md">
          <div className="flex gap-1">
            {MAP_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id)}
                className={`flex h-10 items-center gap-2 rounded-2xl px-4 font-black text-[10px] uppercase tracking-tighter transition-all ${
                  mapStyle === style.id
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {style.icon}
                {style.name}
              </button>
            ))}
          </div>
          <div className="mx-2 h-px bg-gray-100" />
          <button
            onClick={toggle3D}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-black text-[10px] uppercase tracking-widest transition-all ${
              is3D
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {is3D ? (
              <Layers className="h-4 w-4" />
            ) : (
              <Box className="h-4 w-4" />
            )}
            {is3D ? 'Ver em 2D' : 'Ativar Modo 3D'}
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-10 hidden rounded-2xl bg-black/40 px-4 py-2 font-bold text-[10px] text-white backdrop-blur-sm sm:block">
        Use o botão direito do mouse para rotacionar e inclinar manualmente
      </div>
    </div>
  )
}
