import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import 'leaflet/dist/leaflet.css'

const POLYGON_ONE = [
  { longitude: 9.99927520751953, latitude: 53.61511726495334 },
  { longitude: 9.959793090820312, latitude: 53.59046705636403 },
  { longitude: 10.050430297851562, latitude: 53.58659505554131 },
  { longitude: 9.99927520751953, latitude: 53.61511726495334 },
]

export const POLYGON_TWO = [
  { longitude: 9.936790466308594, latitude: 53.575588484564 },
  { longitude: 9.894561767578125, latitude: 53.54397962810946 },
  { longitude: 10.000648498535156, latitude: 53.550507262191466 },
  { longitude: 9.936790466308594, latitude: 53.575588484564 },
]

export const POLYGON_THREE = [
  { longitude: 10.037727355957031, latitude: 53.58292651697834 },
  { longitude: 9.976272583007812, latitude: 53.576811578422124 },
  { longitude: 10.084762573242188, latitude: 53.53806309007896 },
  { longitude: 10.037727355957031, latitude: 53.58292651697834 },
]

const SAMPLES: Coordinate[][] = [POLYGON_ONE, POLYGON_TWO, POLYGON_THREE];

import { useGeolocated } from "react-geolocated";

import type { Coordinate } from '@freenow/react-polygon-editor/src/types';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs/dist';

import { Database } from '@/types/supabase'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

type DeliveryArea = Database['public']['Tables']['restaurants']['Row']['delivery_area']


export const PolygonWrapper = ({ initialPolygon }: { initialPolygon: DeliveryArea }) => {
  const router = useRouter()
  const { id } = router.query

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 5000,
      },
      userDecisionTimeout: 15000,
    })

  const supabase = createBrowserSupabaseClient<Database>()

  const [activeIndex, setActiveIndex] = useState(0);
  const [polygons, setPolygons] = useState<Coordinate[]>(initialPolygon as Coordinate[] || [])
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);

  const savePolygon = async () => {
    // save polygon to database
    return supabase.from('restaurants').update({ delivery_area: polygons }).eq('id', id).single()
  }

  const handlePolygonSave = async () => {
    // save polygon to database + show promise
    toast.promise(
      savePolygon(),
      {
        loading: 'Speichere Liefergebiet...',
        success: 'Liefergebiet gespeichert!',
        error: 'Fehler beim Speichern des Liefergebiets. Bitte versuche es erneut.'
      }
    )
  }

  // Load the map component dynamically
  const PolygonDrawWrapper = React.useMemo(() => dynamic(
    () => import('@freenow/react-polygon-editor').then((module) => module.PolygonDraw),
    {
      loading: () => <p>A map is loading</p>,
      ssr: false // prevent SSR
    }
  ), [])

  const LiefergebietSpeichernButton = () => <button onClick={handlePolygonSave} className='w-full mt-4 gastrobit-btn-primary'>Liefergebiet speichern</button>

  if (!isGeolocationEnabled || !coords?.latitude || !coords?.longitude) {
    return <>
      <PolygonDrawWrapper
        polygon={polygons}
        activeIndex={activeIndex}
        highlightedIndex={highlightedIndex}
        editable={true}
        onClick={setActiveIndex}
        onChange={(newPolygons, isValid) => {
          setPolygons([...newPolygons])
        }}
        initialCenter={{ latitude: 51.5, longitude: 11.3 }}
        initialZoom={coords ? 13 : 6}
        onMouseEnter={(index) => setHighlightedIndex(index)}
        onMouseLeave={(index) => setHighlightedIndex((oldIndex) => (oldIndex === index ? undefined : oldIndex))}
      />

      <LiefergebietSpeichernButton />
    </>
  }


  return <>
    <PolygonDrawWrapper
      polygon={polygons}
      activeIndex={activeIndex}
      highlightedIndex={highlightedIndex}
      editable={true}
      onClick={setActiveIndex}
      onChange={(newPolygons, isValid) => {
        setPolygons([...newPolygons])
      }}
      initialCenter={{ longitude: coords!.longitude, latitude: coords!.latitude }}
      initialZoom={13}
      onMouseEnter={(index) => setHighlightedIndex(index)}
      onMouseLeave={(index) => setHighlightedIndex((oldIndex) => (oldIndex === index ? undefined : oldIndex))}
    />

    <LiefergebietSpeichernButton />
  </>
}

const PolygonsList = ({ polygons, setPolygons, activeIndex, setActiveIndex, highlightedIndex, setHighlightedIndex }: {
  polygons: Coordinate[][],
  setPolygons: (polygons: Coordinate[][]) => void,
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  highlightedIndex: number | undefined,
  setHighlightedIndex: (index: number | undefined) => void
}) => {

  return <>
    {polygons.map((polygon, index) => (
      <div key={index}>
        <button onClick={() => setActiveIndex(index)} className='btn btn-secondary'>Polygon {index}</button>
        <button onClick={() => setPolygons(polygons.filter((_, i) => i !== index))} className='btn btn-secondary'>Delete</button>
      </div>
    ))}
  </>
}