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

import { Category, Extra, Extras, Gericht, Karte } from "@/types/schema"
import { Dispatch, Fragment, useEffect, useState } from 'react'
import useCart from '@/components/restaurant/cartContext'
import Link from 'next/link'
import FloatingActionButton from '@/components/restaurant/floatingActionButton'

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

  const cart = useCart()

  return (
    <RestaurantLayout theme={theme || 'corporate'} restaurant={props.restaurant}>
      <div className='container flex flex-col mx-auto' suppressHydrationWarning>
        <p>
          Ihr Bestellung ist erfolgreich eingegangen. Sie erhalten in Kürze eine Bestellbestätigung per E-Mail.
        </p>

        <Link href='/' className='mt-5 w-60 btn btn-primary'>Zurück zur Startseite</Link>
      </div>

    </RestaurantLayout>
  )
}







export default Page
