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
import { useEffect } from 'react'

function Page(props: PageProps) {
  const router = useRouter()
  const { name, karte, extra_presets } = props.restaurant

  const cart = useCart()

  useEffect(() => {
    // validate state of cart
    // if cart is empty, redirect to '/

    if (cart.gerichte.length === 0) {
      router.push('/')
    }

    // if cart is not empty, check if all items are valid
    // if not, remove them from cart
    cart.gerichte.forEach((gericht, index) => {
      try {
        gerichtSchema.parse(gericht)
      } catch (error) {
        console.error(error)

      }
    }
    )
  }, [cart, cart.gerichte, router])

  return (
    <RestaurantLayout theme={'corporate'} restaurant={props.restaurant}>
      <div className='container mx-auto' suppressHydrationWarning>
        {/* If we are on a mobile device, we have two columns.
          On Desktop, we have a single column but with a floating action button
        */}
        {cart.gerichte.length > 0 ? JSON.stringify(cart.gerichte) : "No items in cart"}
      </div>

    </RestaurantLayout>
  )
}

export default Page
