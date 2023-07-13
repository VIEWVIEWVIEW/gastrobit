import { useRouter } from "next/router"
import useCart from "./cartContext"
import { SubmitHandler, useForm } from "react-hook-form"
import * as Nominatim from "nominatim-browser";

import { Fragment, useEffect } from "react";
import RestaurantLayout from "../layouts/RestaurantLayout";
import { WarenkorbRow } from "@/pages/_sites/[id]";
import { Karte } from "@/types/schema";
import Link from "next/link";
import { Database } from "@/types/supabase";
import { ParsedUrlQuery } from "querystring";

interface PathProps extends ParsedUrlQuery {
  site: string
  slug: string
}

type Restaurant = Database['public']['Tables']['restaurants']['Row']

type PageProps = {
  params: PathProps
  restaurant: Restaurant
}

import { isCoordinateInPolygon } from '@freenow/react-polygon-editor/src/helpers';
import { Coordinate } from "@freenow/react-polygon-editor/src/types";

function Page(props: PageProps) {
  const router = useRouter()
  const { name, karte, extra_presets, delivery_area } = props.restaurant

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


      } catch (error) {

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

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()



  const polygon = delivery_area as Coordinate[]

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = await Nominatim.geocode({
      q: `${data.strasse} ${data.plz} ${data.ort}`,
      addressdetails: false,
      limit: 1
    })

    const point = {
      latitude: result[0].lat,
      longitude: result[0].lon
    }

    const isInside = isCoordinateInPolygon(point, polygon)

    console.log("is inside?", isInside)

    console.log("point", point)

    console.log("polygon", polygon)

  }


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
          <form onSubmit={handleSubmit(onSubmit)} className='gap-3 form-control'>
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
            {/* cart.gerichte.length > 0 ? <Link href='/checkout' className='mt-3 btn btn-primary'>Jetzt kostenpflichtig für {calculateCartPrice()}€ bestellen</Link> : <p className='text-sm'>Warenkorb ist leer</p> */}
            <button type='submit' className='btn btn-primary'>Kostenpflicht Bestellen für {calculateCartPrice()}€</button>
          </form>
        </div>


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