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
import { useForm } from 'react-hook-form'

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

  // calculate total price of cart
  const calculateCartPrice = () => {
    return cart.gerichte.reduce((acc, curr) => acc + curr.preis, 0)
  }


  // address types
  type Inputs = {
    name: string
    strasse: string
    plz: string // postleittahgl
    ort: string
    handy?: string // optional, aber wäre nice für rückrufe :)
    email: string // rechnung und bestellbestätigung
  }

  const { register, handleSubmit, formState: { errors } } = useForm()


  return (
    <RestaurantLayout theme={'corporate'} restaurant={props.restaurant}>
      <div className='container grid grid-cols-2 gap-3 mx-auto' suppressHydrationWarning>

        <div>
          <h2 className='my-3 text-xl font-bold'>Einkaufswagen</h2>
          {/* If we are on a mobile device, we have two columns.
          On Desktop, we have a single column but with a floating action button
        */}
          {cart.gerichte.length > 0 ? <>
            {cart.gerichte.map((gericht, index) => <WarenkorbRow gericht={gericht} key={index} index={index} karte={karte as Karte} />)}
          </> : "Keine Gerichte im Einkaufswagen"}
        </div>

        <div>
          <h2 className='my-3 text-xl font-bold'>Lieferadresse</h2>
          <form onSubmit={handleSubmit(data => console.log(data))} className='gap-3 form-control'>
            <div className='flex flex-col'>
              <label htmlFor='name'>Name</label>
              <input className='input input-bordered input-secondary' type='text' {...register('name', { required: true })} />
              {errors.name && <span className='text-red-500'>Name ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='strasse'>Straße</label>
              <input className='input input-bordered input-secondary' type='text' {...register('strasse', { required: true })} />
              {errors.strasse && <span className='text-red-500'>Straße ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='plz'>Postleitzahl</label>
              <input className='input input-bordered input-secondary' type='text' {...register('plz', { required: true })} />
              {errors.plz && <span className='text-red-500'>Postleitzahl ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='ort'>Ort</label>
              <input className='input input-bordered input-secondary' type='text' {...register('ort', { required: true })} />
              {errors.ort && <span className='text-red-500'>Ort ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='email'>Email (für Rechnung und Bestellbestätigung)</label>
              <input className='input input-bordered input-secondary' type='email' {...register('email', { required: true })} />
              {errors.email && <span className='text-red-500'>Email ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='handy'><div className="tooltip cursor-help" data-tip="Dies erleichtert die Kontaktaufnahme bei Rückfragen zur Bestellung. Deine Daten bleiben 48h lang gespeichert.">
                Handynummer (optional)
                <div className="ml-1 badge badge-primary badge-sm">i</div>
              </div>
              </label>
              <input className='input input-bordered input-secondary' type='tel' {...register('handy')} />
            </div>
            <button type='submit' className='btn btn-primary'>Bestellen</button>
          </form>
        </div>


        {cart.gerichte.length > 0 ? <Link href='/checkout' className='mt-3 btn btn-primary'>Jetzt kostenpflichtig für {calculateCartPrice()}€ bestellen</Link> : <p className='text-sm'>Warenkorb ist leer</p>}
      </div>

    </RestaurantLayout>
  )
}

const Warenkorb = () => {
  const cart = useCart()
  return <>
    <div className='flex flex-col'>
      {cart.gerichte.map((gericht, index) => <Fragment key={index}>
        <div className='flex flex-row justify-between'>
          {gericht.name} {gericht.variante}
        </div>
      </Fragment>)}
    </div>
  </>
}
export default Page
