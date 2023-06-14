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

import { Category, Gericht, Karte } from "@/types/schema"
import { Fragment, useState } from 'react'
import { useCart } from '@/components/restaurant/cartContext'

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
  const { name, karte, extra_presets } = props.restaurant

  const cart = useCart()

  return (
    <RestaurantLayout theme={'corporate'} restaurant={props.restaurant}>
      <div className='container mx-auto'>
        {/* If we are on a mobile device, we have two columns.
          On Desktop, we have a single column but with a floating action button
        */}
        {JSON.stringify(cart)}
        {karte ? <Karte karte={karte as Karte} /> : "Keine Karte vorhanden. Bitte erstellen Sie eine auf Gastrobit.de"}
      </div>

    </RestaurantLayout>
  )
}

function Kategorie({ category }: { category: Category }) {
  return (<>
    <div className='mt-1'>
      <div
        className={`relative w-full h-40 bg-center bg-cover group ${category.headerUrl ?? 'hidden'}`}
        style={{ backgroundImage: `url(${category.headerUrl ?? ''})` }}
      ></div>
      <h2 className='my-1 text-xl font-semibold'>{category.name}</h2>
      <div>
        {category.gerichte.map(gericht => (
          <Fragment key={gericht.id}>
            <GerichtRow gericht={gericht} />
          </Fragment>
        ))}
      </div>
    </div>
    <hr className='w-full my-10 border-b-secondary border-secondary' />
  </>
  )
}

function GerichtModal({ gericht, open, setOpen }: { gericht: Gericht, open: boolean, setOpen: (open: boolean) => void }) {
  return (
    <dialog className="modal" open={open}>
      <form method="dialog" className="modal-box">
        <h3 className="text-lg font-bold">{gericht.ueberschrift}</h3>
        <h4 className="font-medium text-md">{gericht.unterschrift}</h4>


        <h5 className='mt-2'>Variante</h5>
        <select className='w-full p-2 mt-1 input'>
          {gericht.preise.map(preise => (
            <option key={preise.name} value={preise.name}>{preise.name} - {preise.preis} €</option>
          ))}
        </select>

        <p className="py-4">
          {JSON.stringify(gericht)}

        </p>
        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn-secondary btn" onClick={(e) => setOpen(false)}>Schließen</button>
        </div>
      </form>
    </dialog>
  )
}

function GerichtRow({ gericht }: { gericht: Gericht }) {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex flex-row justify-between p-4 bg-neutral-content'>
      <div className='flex flex-col'>
        <h3 className='text-lg font-semibold'>{gericht.ueberschrift}</h3>
        <p className='text-sm'>{gericht.unterschrift}</p>
      </div>
      <div className='flex flex-col'>
        <p className='text-sm'></p>
        <button className='btn btn-secondary' onClick={() => setOpen(true)}>
          ab {gericht.preise.sort(({ preis: a }, { preis: b }) => a - b)[0].preis} €
        </button>
      </div>
      <GerichtModal gericht={gericht} open={open} setOpen={setOpen} />
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
