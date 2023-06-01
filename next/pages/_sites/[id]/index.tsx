import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

import type { ParsedUrlQuery } from 'querystring'
import { createServerComponentSupabaseClient, createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
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

import { Category, Karte } from "@/types/schema"

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

  return (
    <RestaurantLayout theme={'retro'}>
      Index {router.route} {}{' '}
      <div className='container mx-auto'>
        <Karte karte={props.restaurant.karte as Karte} />
      </div>
    </RestaurantLayout>
  )
}

function Kategorie({ category }: { category: Category }) {
  return (
    <div className='mt-10'>
      <h2 className='text-xl font-semibold'>{category.name}</h2>
      <div>
        {category.gerichte.map(gericht => (
          <div key={gericht.id}>{gericht.ueberschrift}</div>
        ))}
      </div>
    </div>
  )
}

function Karte({ karte }: { karte: Karte }) {
  return (
    <div className='grid grid-cols-3 space-x-5'>
      <div className='flex flex-col col-span-2'>
        <h1 className='mt-12 mb-8 text-5xl'>Speisekarte</h1>
        <div>
          {karte.map(category => (
            <Kategorie category={category} key={category.id} />
          ))}
        </div>
      </div>

      <div className='flex-col items-center justify-center h-screen mt-12 mb-8 text-2xl align-middle'>
        <p>Warenkorb</p>
      </div>
    </div>
  )
}

export default Page
