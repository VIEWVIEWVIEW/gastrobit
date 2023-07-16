import MainLayout from '@/components/layouts/MainLayout'
import { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs/dist'

import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
type Restaurant = Database['public']['Tables']['restaurants']['Row']

type Props = {
  restaurant: Restaurant
}

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }

  // else we fetch restaurant data
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select()
    .limit(1)
    .eq('id', ctx.params!.id)
    .single()

  console.debug(restaurant)

  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}

import { PolygonWrapper } from '@/components/home/PolygonWrapper'



function DeliveryArea(props: Props) {
  const router = useRouter()
  const { id } = router.query

  const restaurant = props.restaurant



  const [consent, setConsent] = React.useState(false)

  const requestConsent = () => {
    const consent = window.confirm(
      'Wir möchten deine Position verwenden um zu Erlauben die Liefergebiete anzuzeigen. Hierfür werden Daten an openstreetmap.org übertragen. Mehr informationen findest du in unserer Privacy Policy.',
    )
    setConsent(consent)
    localStorage.setItem('consent', consent.toString())
    console.log(consent)
  }

  useEffect(() => {
    const localConsent = Boolean(localStorage.getItem('consent'))
    setConsent(localConsent)

    if (!localConsent) {
      requestConsent()
    }
  }, [])



  return (<>
    <MainLayout>
      <main className='container flex flex-col items-center w-full max-w-3xl mx-auto grow'>

          <h1 className='text-4xl'>{restaurant.name}</h1>

          <div>Liefergebiet</div>

          {/* Fill rest of flex-col with red bg div */}

          {consent ? <div className="w-full h-40 mb-96 grow"><PolygonWrapper initialPolygon={props.restaurant.delivery_area} /></div> : <button onClick={requestConsent} className='btn btn-primary'>Zustimmung erforderlich</button>}

          {/* Wir müssen consent für das weiterschicken der Daten an OpenStreetmap einsammeln */}

      </main>
    </MainLayout>
  </>
  )
}


/**
 * 

const MapWrapper = () => {
  const [position, setPosition] = React.useState<[number, number]>([50.868, 10.887]) // default position
  
  const Map = React.useMemo(() => dynamic(
    () => import('@/components/restaurant/map'),
    {
      loading: () => <p>A map is loading</p>,
      ssr: false // prevent SSR
    }
    ), []) // list variables which should trigger a re-render here ])
    return <Map containerProps={
      {
      center: position,
      zoom: 6,
      scrollWheelZoom: false,
      style: { height: 700, width: "100%" }
    }
  } />
}
*/


const getGeoLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position)
      },
      (error) => {
        console.log(error)
      },
    )
  } else
    console.log(
      'Geolocation is not supported by this browser. Please use a modern browser.',
    )
}

// show example code for getting


export default DeliveryArea
