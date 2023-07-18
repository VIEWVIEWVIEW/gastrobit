import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

import type { ParsedUrlQuery } from 'querystring'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs/dist'
import { Database } from '@/types/supabase'

import RestaurantLayout from '@/components/layouts/RestaurantLayout'

interface PathProps extends ParsedUrlQuery {
  site: string
  slug: string
}

type Restaurant = Database['public']['Tables']['restaurants']['Row']

type PageProps = {
  params: PathProps
  restaurant: Restaurant
}


export const getServerSideProps: GetServerSideProps = async function (ctx) {
  /**
   * 
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
    )
    */

  // fetch the current restaurant
  const supabase = createServerSupabaseClient<Database>(ctx)

  console.warn('Restaurant id', ctx.params!.id, "domain")
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select()
    .eq('id', ctx.params!.id)
    .single()

  console.debug(ctx.params!.id)
  console.debug(restaurant, error)

  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}

function Page(props: PageProps) {
  const router = useRouter()
  const { name, karte, extra_presets, theme } = props.restaurant


  return (
    <RestaurantLayout theme={theme || 'corporate'} restaurant={props.restaurant}>
      <div className='container mx-auto' suppressHydrationWarning>
        <div className='flex flex-col items-center justify-center'>

          Bei der Bestellung über Gastrobit wird ihre physische Adresse von OpenStreetMaps.org übermittelt, um festzustellen, ob sich ihre Adresse im Liefergebiet befindet.
          <br />
          Desweiteren speichern wir ihre E-Mail Adresse und ihre Telefonnummer, um sie über den Status ihrer Bestellung zu informieren.

          <br />

          Wir verwenden supabase.com mit einem Server bei Amazon Web Services in Frankfurt, Deutschland, um ihre Daten zu speichern.

          <h1 className='text-3xl font-bold text-center text-gray-900'>Betreiber Gastrobit.de:</h1>
          <div className='flex flex-col items-center justify-center'>
            <p>Marc Richts, Ernststraße 25, 58644 Iserlohn, Deutschland</p>
            <p>gastrobit@wertfrei.org</p>
          </div>

        </div>
      </div>

    </RestaurantLayout>
  )
}


export default Page
