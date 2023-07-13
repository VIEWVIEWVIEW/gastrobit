import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import useCart from '@/components/restaurant/cartContext'
import Link from 'next/link'
import type { ParsedUrlQuery } from "querystring"
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
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
  ctx.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  )

  // get the current subdomain

  const supabase = createServerSupabaseClient<Database>(ctx)

  console.warn('Restaurant id', ctx.params!.id, "domain")
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select()
    .eq('id', ctx.params!.id)
    .single()

  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}


import { gerichtSchema } from '@/components/restaurant/cartContext'
import { Fragment, useEffect } from 'react'
import { WarenkorbRow } from '.'
import { Karte } from '@/types/schema'
import { SubmitHandler, useForm } from 'react-hook-form'

import * as Nominatim from "nominatim-browser";
import dynamic from 'next/dynamic'


const PageWrapper = (props: PageProps) => {
  const Page = dynamic(() => import('@/components/restaurant/checkout'), {
    ssr: false
  })
  return <Page {...props} />
}

export default PageWrapper
