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
      <div className='container mx-auto' suppressHydrationWarning>
        {/* If we are on a mobile device, we have two columns.
          On Desktop, we have a single column but with a floating action button
        */}
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
  const [variante, setVariante] = useState(gericht.preise[0].name)

  const [attribute, setAttribute] = useState({} as Extras)

  const calcPrice = () => {
    let price = gericht.preise.find(preis => preis.name === variante)?.preis ?? 0

    // add the price of the extras
    Object.keys(attribute).forEach(key => {
      const extra = gericht.extras?.find(extra => extra.name === key)
      if (extra) {
        if (extra.typ === 'oneOf') {
          // @ts-ignore schnauze
          const item = extra.items.find(item => item.name === attribute[key])
          if (item) {
            price += item.preis
          }
        } else {
          // manyOf
          // @ts-ignore too lazy to add type checking
          const items = attribute[key] as number[]
          items.forEach(index => {
            const item = extra.items[index]
            if (item) {
              price += item.preis
            }
          })
        }
      }
    })

    return price
  }

  const cart = useCart()
  const handleAddToCart = () => {
    // add the gericht to the cart
    cart.addGericht(finalesGericht())

  }

  const finalesGericht = () => {
    return {
      id: gericht.id,
      name: gericht.ueberschrift,
      variante: variante,
      preis: calcPrice(),
      extras: attribute
    }
  }


  return (
    <dialog className="modal" open={open}>
      <form method="dialog" className="modal-box">

        <h3 className="text-lg font-bold">{gericht.ueberschrift}</h3>
        <h4 className="font-medium text-md">{gericht.unterschrift}</h4>


        {/* Variante */}
        <h5 className='mt-2'>Variante</h5>

        <select className='w-full p-2 mt-1 select select-bordered'
          value={variante}
          onChange={e => {
            setVariante(e.target.value)
          }}
        >
          {gericht.preise.map(preise => (
            <option key={preise.name} value={preise.name}>{preise.name} - {preise.preis} €</option>
          ))}
        </select>

        {/* Attribute */}
        {gericht.extras ? <h5 className='mt-5 font-bold'>Attribute</h5> : null}
        {gericht.extras && gericht.extras.map((extra, index) => (
          <div className='flex flex-col mb-5' key={index}>
            <h6 className='font-semibold'>
              {extra.name}
            </h6>
            <div className='flex flex-row'>

              {/* Oneof Attribute  */}
              {extra.typ === 'oneOf'
                ?
                <OneOf extra={extra} attribute={attribute} setAttribute={setAttribute} />
                : <>
                  {/* ManyOf Attribute */}
                  <div className='grid w-full grid-cols-2'>
                    <ManyOf extra={extra} attribute={attribute} setAttribute={setAttribute} />
                  </div>
                </>
              }
            </div>
          </div>
        )

        )}

        <div className="modal-action">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn-secondary btn" onClick={(e) => setOpen(false)}>Schließen</button>

          <button className='btn-primary btn'
            onClick={(e) => {
              e.preventDefault()
              handleAddToCart()
              setOpen(false)
            }}
          >Für {calcPrice()}€ zum Warenkorb hinzufügen</button>
        </div>
      </form>
    </dialog >
  )
}

const ManyOf = ({ extra, attribute, setAttribute }: {
  extra: {
    name: string;
    typ: "oneOf" | "manyOf";
    items: {
      name: string;
      preis: number;
    }[]
  },
  attribute: any,
  setAttribute: Dispatch<any>
}) => {
  const [activatedExtras, setActivatedExtras] = useState<number[]>([])
  const handleCheckboxChange = (index: number) => {
    if (activatedExtras.includes(index)) {
      // remove the index from the array
      setActivatedExtras(activatedExtras.filter(extra => extra !== index))
      setAttribute({
        ...attribute,
        [extra.name]: activatedExtras.filter(extra => extra !== index)
      })
    } else {
      // add the index to the array
      setActivatedExtras([...activatedExtras, index])
      setAttribute({
        ...attribute,
        [extra.name]: [...activatedExtras, index]
      })
    }
  }

  return <>
    {extra.items.map((item, index) => (
      <div className='flex flex-row items-center mt-1' key={index} >

        <input type='checkbox' className='checkbox checkbox-primary'
          checked={activatedExtras.includes(index)} onChange={(e) => handleCheckboxChange(index)}
        />

        <label className='label'>{item.name} +{item.preis}€</label>
      </div>
    )
    )}
  </>
}

const OneOf = ({ extra, attribute, setAttribute }: {
  extra: {
    name: string;
    typ: "oneOf" | "manyOf";
    items: {
      name: string;
      preis: number;
    }[]
  },
  attribute: any,
  setAttribute: Dispatch<any>
}) => {
  const [option, setOption] = useState(extra.items[0].name)

  useEffect(() => {
    setAttribute({
      ...attribute,
      [extra.name]: option
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>
    <select className='w-full p-2 mt-1 select select-bordered'
      onChange={e => {
        setOption(e.target.value)

        // set the attribute
        setAttribute({
          ...attribute,
          [extra.name]: e.target.value
        })
      }}
      value={option}
    >
      {extra.items.map((item, index) => (
        <option key={index} value={item.name}>{item.name} +{item.preis}€</option>
      ))}
    </select>
  </>
}


function GerichtRow({ gericht }: { gericht: Gericht }) {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex flex-row justify-between p-4 bg-neutral text-neutral-content'>
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
  const cart = useCart()

  const calculateCartPrice = () => {
    return cart.gerichte.reduce((acc, curr) => acc + curr.preis, 0)
  }

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
        <div className='flex flex-col' suppressHydrationWarning>
          {cart.gerichte.map((gericht, index) => <WarenkorbRow gericht={gericht} key={index} index={index} karte={karte} />)}
          {cart.gerichte.length > 0 ? <Link href='/checkout' className='mt-3 btn btn-primary'>Bestellen für {calculateCartPrice()}€</Link> : <p className='text-sm'>Warenkorb ist leer</p>}

        </div>
      </div>
    </div>
  )
}

function WarenkorbRow({ gericht, index, karte }: {
  karte: Karte,
  gericht: {
    id: string | number;
    name: string;
    variante: string;
    preis: number;
    extras: {
      name: string;
      typ: "oneOf" | "manyOf";
      items: {
        name: string;
        preis: number;
      }[];
    }[];
  },
  index: number
}) {
  const cart = useCart()
  const handleRemove = () => {
    cart.popIndex(index)
  }

  return <>
    <div className='flex flex-row justify-between p-4 bg-neutral text-neutral-content' suppressHydrationWarning>
      <div className='flex flex-col'>
        <h3 className='text-lg font-semibold'>{gericht.name} - <span className='text-sm'>
          {gericht.preis}€
        </span></h3>
        <p className='text-sm'>{gericht.variante}</p>
        <div className='text-xs'><ExtrasText extras={gericht.extras} karte={karte} /></div>
      </div>
      <div className='flex flex-col'>
        <button className='btn btn-error' onClick={handleRemove}>
          X
        </button>
      </div>
    </div>

  </>
}


function ExtrasText({ extras, karte }: { extras: Extras, karte: Karte }) {
  const resolveManyOf = (arr: number[], key: string) => {
    const extra = karte.flatMap(category => category.gerichte).flatMap(gericht => gericht.extras).find(extra => extra?.name === key)
    if (extra) {
      return arr.map(index => extra.items[index].name).join(', ')
    }
  }

  return (
    <div className='flex-col text-xs'>
      {Object.keys(extras).map(key => (
        // @ts-ignore fuck
        <div key={key}>{key}: {Array.isArray(extras[key]) ? resolveManyOf(extras[key], key) : extras[key]} </div>
      ))}
    </div>
  )
}

export default Page
