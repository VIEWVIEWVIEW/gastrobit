import MainLayout from '@/components/layouts/MainLayout'
import { Database } from '@/types/supabase'
import { createBrowserSupabaseClient, createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'



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
    const subscription = supabase.channel(`restaurants:id=eq.${id}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
    }, payload => {
      console.log(payload)
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
                        Name
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Bestellungen
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'> xD</th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'></th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        <span className='sr-only'>Edit</span>
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-sepia-200 bg-sepia-50'>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className='py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6'>
                          {restaurant.name} {order.id}
                        </td>
                        <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          <a
                            href={`/restaurant/${restaurant.id}/bestellungen`}
                            className='py-3 hover:text-gray-400 hover:underline'>
                            {Math.round(Math.random() * 100) % 10} Bestellungen
                            offen
                          </a>
                        </td>
                        <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          <a href={`/api/stripe/get-login-link?restaurantId=${restaurant.id}`}>Umsätze</a>
                        </td>
                        <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          <a
                            href={`/restaurant/${restaurant.id}/settings`}
                            className='py-3 hover:text-gray-400 hover:underline'>
                            Restauranteinstellungen
                          </a>
                        </td>
                        <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          <a
                            href={`/restaurant/${restaurant.id}/menu`}
                            className='py-3 hover:text-gray-400 hover:underline'>
                            Karte editieren
                          </a>
                        </td>
                        <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          b
                        </td>
                      </tr>
                    ))}
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

export default Page
