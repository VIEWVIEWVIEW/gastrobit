import { useRouter } from "next/router"
import useCart from "./cartContext"
import { SubmitHandler, useForm } from "react-hook-form"

import { Fragment, useEffect, useState } from "react";
import RestaurantLayout from "../layouts/RestaurantLayout";
import { WarenkorbRow } from "@/pages/_sites/[id]";
import { Extras, Karte } from "@/types/schema";
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

// address types
export type Address = {
  name: string
  strasse: string
  plz: string // postleittahgl
  ort: string
  handy?: string // optional, aber wäre nice für rückrufe :)
  email: string // rechnung und bestellbestätigung
  datenverarbeitung: boolean // der kunde muss der datenverarbeitung zustimmen, da wir schauen müssen ob die adresse in der lieferzone ist
  // dafür verwenden wir nominatim von openstreetmap, es wird die adresse in koordinaten umgewandelt und dann geschaut ob die koordinaten in der lieferzone sind
  // email usw wird nicht weitergegeben, nur die adresse und unterliegt der openstreetmap datenschutzerklärung
}

function Page(props: PageProps) {
  const router = useRouter()
  const { name, karte, extra_presets, delivery_area, id } = props.restaurant

  const cart = useCart()


  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // if cart is empty, redirect to '/'
    if (cart.gerichte.length === 0) {
      router.push('/')
    }
  }, [cart, cart.gerichte, router])

  // calculate total price of cart
  const calculateCartPrice = () => {
    return cart.gerichte.reduce((acc, curr) => acc + curr.preis, 0)
  }

  // form handlers
  const { register, handleSubmit, formState: { errors } } = useForm<Address>()


  // cast delivery area to Coordinate[]
  const polygon = delivery_area as Coordinate[]

  // cart stuff
  // we need to decode the extras which are encoded as numbers in an array in case of ManyOf and a single number in case of OneOf
  // [1, 4] => "Käse, Tomaten"
  function ExtrasText({ extras, karte }: { extras: Extras, karte: Karte }) {
    const resolveManyOf = (arr: number[], key: string) => {
      const extra = karte.flatMap(category => category.gerichte).flatMap(gericht => gericht.extras).find(extra => extra?.name === key)
      if (extra) {
        return arr.map(index => extra.items[index].name).join(', ')
      }
    }

    // This  merges the extras ALL extras (oneOf and manyOf) into a single array
    return Object.keys(extras).map((key: any) => (
      // check if it's a manyOf array or not
      Array.isArray(extras[key]
      )
        ?
        // manyOf case
        // @ts-ignore
        resolveManyOf(extras[key], key)
        :
        // oneOf case
        extras[key]))
      // join the array into a single string
      .join(', ')
  }

  const onSubmit: SubmitHandler<Address> = async (address) => {
    // ok, so we need to submit the following data:
    // restaurantId
    // address, email and all that jazz for the fullfillment of the order
    // cart of what we want to order
    // we also sent the full "karte", so we can check on the backend for a race-condition in case the restaurant changes the menu while the user is checking out

    // console log each gericht with the extras. use ExtrasText to resolve the extras


    const cartCopy = cart.gerichte.map(gericht => ({ ...gericht, extras: ExtrasText({ extras: gericht.extras, karte: karte as Karte }) }))

    const result = await fetch('/api/checkout/create-order', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: id,
        address,
        cart: cartCopy,
        karte
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const json = await result.json()




    // error handling




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
              <label htmlFor='name'><b>Name</b> auf der Klingel</label>
              <input className='input input-bordered input-secondary' type='text' autoComplete="name" {...register('name', { required: true })} />
              {errors.name && <span className='text-red-500'>Name ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='strasse'><b>Straße</b> und <b>Hausnummer</b></label>
              <input className='input input-bordered input-secondary' type='text' autoComplete="street-address" {...register('strasse', { required: true })} />
              {errors.strasse && <span className='text-red-500'>Straße & Hausnummer ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='plz'><b>Postleitzahl</b></label>
              <input className='input input-bordered input-secondary' type='text' autoComplete="postal-code" {...register('plz', { required: true })} />
              {errors.plz && <span className='text-red-500'>Postleitzahl ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='ort'><b>Ort</b></label>
              <input className='input input-bordered input-secondary' type='text' autoComplete="address-level2" {...register('ort', { required: true })} />
              {errors.ort && <span className='text-red-500'>Ort ist ein Pflichtfeld</span>}
            </div>
            <div className='flex flex-col'>
              <label htmlFor='email'><b>Email</b> (für Rechnung und Bestellbestätigung)</label>
              <input className='input input-bordered input-secondary' type='email' autoComplete="email" {...register('email', { required: true })} />
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

            <div className="form-control">
              <label className="cursor-pointer label">
                <input type="checkbox" className="shadow-sm checkbox"  {...register('datenverarbeitung', { required: true })} />
                <span>Ich stimme der Verarbeitung meiner Daten gemäß der <Link href={'/datenschutz'} className="link link-primary">Datenschutzerklärung</Link> zu. </span>
              </label>
              {errors.datenverarbeitung && <div className='text-red-500'>Ihre Einwilligung wird benötigt um Ihre Bestellung zu verarbeiten</div>}
            </div>
            {/* cart.gerichte.length > 0 ? <Link href='/checkout' className='mt-3 btn btn-primary'>Jetzt kostenpflichtig für {calculateCartPrice()}€ bestellen</Link> : <p className='text-sm'>Warenkorb ist leer</p> */}
            <button type='submit' className='btn btn-primary'>Kostenpflichtig bestellen für {calculateCartPrice()}€</button>
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