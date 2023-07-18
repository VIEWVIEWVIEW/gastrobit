import MainLayout from '@/components/layouts/MainLayout'
import { Database } from '@/types/supabase'
import { createBrowserSupabaseClient, createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { Dispatch, Fragment, useCallback, useEffect, useState } from 'react'



type Restaurant = Database['public']['Tables']['restaurants']['Row']

type Props = {
  restaurant: Restaurant
}

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }

  // else we fetch restaurant data
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select()
    .limit(1)
    .eq('id', ctx.params!.id)
    .single()


  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}

type Order = Database['public']['Tables']['orders']['Row']

function Page(props: Props) {
  const router = useRouter()
  const { id } = router.query

  const restaurant = props.restaurant

  const supabase = useSupabaseClient()
  const [orders, setOrders] = useState<Order[]>([])

  const fetchOrders = useCallback(
    async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select()
        .eq('restaurand_id', id)
        .order('created_at', { ascending: false })

      if (error) return console.log(error)
      if (!orders) return console.log('no orders')

      setOrders(orders)
    },
    [supabase, id],
  )

  // do realtime updates for orders
  useEffect(() => {
    const subscription = supabase.channel(`orders:id=eq.${id}`)
      .on<Order>('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      }, payload => {
        setOrders(orders => [payload.new, ...orders])
      })
      .on<Order>('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
      }, payload => {
        setOrders(orders => orders.map(order => order.id === payload.new.id ? payload.new : order))
      })
      .subscribe((status) => console.log(status))


    fetchOrders()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [id, supabase, fetchOrders])


  return (
    <MainLayout>
      <main className='container max-w-3xl mx-auto'>
        <div className='flex flex-col items-center my-5 '>
          <h1 className='text-4xl'>{restaurant.name}</h1>

          <div>Orders</div>


          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
              <div className='overflow-hidden border-2 border-black shadow ring-1 ring-black ring-opacity-5'>
                <table className='min-w-full divide-y divide-sepia-200'>
                  <thead className='bg-sepia-100'>
                    <tr>
                      <th
                        scope='col'
                        className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                        Bestelldatum
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Adresse
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>Lieferstatus</th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>Email</th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>Bezahlstatus</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-sepia-200 bg-sepia-50'>
                    {orders.length ? orders.map(order => <Order order={order} key={order.id} />) : <tr><td colSpan={6} className='text-center'>Keine Bestellungen bisher erhalten :(</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </MainLayout>
  )
}

const Order = ({ order }: { order: Order }) => {
  const supabase = useSupabaseClient()

  const [orderStatus, setOrderStatus] = useState(order.order_status)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const updateOrderStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsSubmitting(true)
    setOrderStatus(e.target.value)
    await supabase.from('orders').update({ order_status: e.target.value, updated_at: "now()" }).eq('id', order.id)
    setIsSubmitting(false)
  }

  return <>
    <tr>
      <td className='py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6'>
        {isSubmitting ? 'Updating...' : new Date(order.created_at).toLocaleString()}
      </td>
      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
        {order.address}
      </td>
      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
        <button className='gastrobit-btn-primary' onClick={() => setShowModal(true)}>Zeige Bestellinformationen</button>
        {showModal && <OrderModal order={order} setShowModal={setShowModal} />}
      </td>
      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
        <select className='gastrobit-input' value={orderStatus} onChange={updateOrderStatus}>
          <option value={'pending'}>Offen</option>
          <option value={'working'}>In Bearbeitung</option>
          <option value={'rejected'}>Abgelehnt</option>
          <option value={'completed'}>Ausgeliefert</option>
        </select>
      </td>
      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
        <a
          href={`/restaurant/${1}/menu`}
          className='py-3 hover:text-gray-400 hover:underline'>
          {order.email}
        </a>
      </td>
      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
        {order.payment_status}
      </td>
    </tr>
  </>
}

const OrderModal = ({ order, setShowModal }: { order: Order, setShowModal: Dispatch<boolean> }) => {
  const cart = order.order as Cart

  return <div className='fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none'>
    <div className='relative w-auto max-w-3xl mx-auto my-6'>
      {/*content*/}
      <div className='relative flex flex-col w-full bg-white border-0 shadow-lg outline-none focus:outline-none'>
        {/*header*/}
        <div className='flex items-start justify-between p-5 border-b border-solid border-blueGray-200'>
          <h3 className='text-3xl font-semibold'>
            Bestellinformationen
          </h3>
          <button
            className='float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none focus:outline-none'
            onClick={() => setShowModal(false)}
          >
            <span className='block w-6 h-6 text-2xl text-black bg-transparent outline-none focus:outline-none'>
              ×
            </span>
          </button>
        </div>
        {/*body*/}
        <div className='relative flex-auto p-6'>
          <div className='flex flex-col'>
            {cart.map((gericht, index) => <Row gericht={gericht} key={index} index={index} />)}
          </div>
        </div>
      </div>
    </div>
  </div>
}

import { cartSchema } from '@/pages/api/checkout/create-order'
import { z } from 'zod'

type Cart = z.infer<typeof cartSchema>

const Row = ({ gericht, index }: {
  gericht: {
    id: string | number;
    name: string;
    variante: string;
    preis: number;
    extras?: string | Record<string, string | number[]> | undefined;
  },
  index: number
}) => {

  return <div className='flex flex-row justify-start gap-x-1'>
    <span>
      {index + 1}.
    </span>
    <div>
      {gericht.name}
    </div>
    <b>{gericht.variante}</b>
    <div>
      {JSON.stringify(gericht.extras)}
    </div>
  </div>
}



export default Page
