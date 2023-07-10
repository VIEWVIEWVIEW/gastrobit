import { MapContainer, TileLayer, useMap, Marker, Popup, MapContainerProps, Polygon, useMapEvents } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import { useState, useMemo, useRef } from 'react'

type Props = {
  containerProps: MapContainerProps
}

type polygon = {
  color: string
  vertices: [number, number][]
}

const Map = (props: Props) => {
  const { containerProps } = props

  const [center, setCenter] = useState<[number, number]>([51.505, -0.09])

  const [polygons, setPolygons] = useState<polygon[]>([
    {
      color: 'purple',
      vertices: [
        [51.515, -0.09],
        [51.52, -0.1],
        [51.52, -0.12],
      ]
    }, {
      color: 'green',
      vertices: [
        [51.53, -0.09],
        [51.524, -0.15],
        [51.52, -0.13],
      ],
    }
  ])

  const [isSelected, setSelected] = useState<number>(-1)

  return <>
    <MapContainer {...containerProps} zoom={13} center={center} >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polygons.map((polygon, index) => <DraggablePolygon key={index} polygon={polygon} polygons={polygons} setPolygons={setPolygons} isSelected={index === isSelected} setSelected={setSelected} />)}
    </MapContainer>
  </>
}

const DraggablePolygon = ({
  polygon,
  polygons,

  setPolygons,
  isSelected,
  setSelected
}: {
  polygon: polygon,
  polygons: polygon[],
  setPolygons: (polygons: polygon[]) => void
  isSelected: boolean
  setSelected: (index: number) => void
}) => {
  const [draggable, setDraggable] = useState(true)

  const map = useMapEvents({
    click: (e) => {
      if (isSelected && e.originalEvent.ctrlKey) {
      
        // add current point to polygon
        const currentLatLng = e.latlng
  
        const currentIndex = polygons.indexOf(polygon)
  
        const newPolygons = polygons.map((poly, index) => {
          if (index === currentIndex) {
            poly.vertices.push([currentLatLng.lat, currentLatLng.lng])
            console.log(currentIndex, index, poly)
          }
          return poly
        })
        console.log(newPolygons)
        setPolygons(newPolygons)
      }
    }
  })

  const mapReference = useMap()




  const toggleDraggable = () => {
    setDraggable(!draggable)
  }

  const polyRef = useRef()



  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const polygon = polyRef.current
        if (polygon != null) {

        }
      },
      dragstart() {
        alert('poly drag start')
      },
      click() {
        setSelected(polygons.indexOf(polygon))
      }
    }),
    [],
  )

  return (
    <Polygon
      pathOptions={{ color: isSelected ? 'blue' : polygon.color }}
      positions={polygon.vertices}
      eventHandlers={eventHandlers}
      interactive={draggable}
      ref={polyRef}
    />
  )
}


export default Map