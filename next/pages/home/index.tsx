import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Auth } from '@supabase/auth-ui-react'
import { Navbar } from '@/components/home/navbar'

const inter = Inter({ subsets: ['latin'] })

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import MainLayout from '@/components/layouts/MainLayout'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '@/types/supabase'
import Link from 'next/link'

type Restaurants = Database['public']['Tables']['restaurants']['Row']

export default function Home() {
  return (
    <>
      <Head>
        <title>Gastrobit.de</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <MainLayout>
        {/* Make a div which uses the rest of the screen height */}
        <Wrapper />
      </MainLayout>
    </>
  )
}

function Wrapper() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  // if useer is logged in, we show restaurant list
  if (session) return <RestaurantList />

  // else we show our marketing material
  return (
    <div className='flex flex-col items-center my-5 '>
      <h1 className='text-4xl'>Gastrobit</h1>
      Marketing bla bla
    </div>
  )
}

const RestaurantList = () => {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()

  const [restaurants, setRestaurants] = useState<Restaurants[]>([])

  const fetchRestaurants = useCallback(
    async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) return console.log('error', userError)

      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select()
        .order('created_at', { ascending: true })
        .eq('owner_id', userData.user?.id)

      if (error) console.log('error', error)
      else setRestaurants(restaurants)
    },
    [supabase],
  )

  useEffect(() => {
    fetchRestaurants()
  }, [supabase, fetchRestaurants])

  return (
    <>
      <div className='container max-w-6xl mx-auto mt-12'>
        <Table restaurants={restaurants} />
      </div>
    </>
  )
}

const Table = ({ restaurants }: { restaurants: Restaurants[] }) => {
  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Deine Restaurants
          </h1>
          <p className='mt-2 text-sm text-gray-700'>
            Eine Liste deiner Restaurants mit den wichtigsten Informationen.
          </p>
        </div>
        <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
          <Link className='gastrobit-btn-primary' href={'/restaurant/add'}>
            Restaurant hinzufügen
          </Link>
        </div>
      </div>
      <div className='flex flex-col mt-8'>
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
                      className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'></th>
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
                  {restaurants.map(restaurant => (
                    <tr key={restaurant.name}>
                      <td className='py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6'>
                        {restaurant.name}
                      </td>
                      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                        <Link
                          href={`/restaurant/${restaurant.id}/bestellungen`}
                          className='py-3 hover:text-gray-400 hover:underline'>
                          Bestellungen
                        </Link>
                      </td>
                      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                        <a href={`/api/stripe/get-login-link?restaurantId=${restaurant.id}`}>Umsätze</a>
                      </td>
                      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                        <Link
                          href={`/restaurant/${restaurant.id}/settings`}
                          className='py-3 hover:text-gray-400 hover:underline'>
                          Restauranteinstellungen
                        </Link>
                      </td>
                      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                        <Link
                          href={`/restaurant/${restaurant.id}/menu`}
                          className='py-3 hover:text-gray-400 hover:underline'>
                          Karte editieren
                        </Link>
                      </td>
                      <td className='px-3 py-4 text-sm text-gray-500 whitespace-nowrap'>
                        <WebsiteLink id={restaurant.id} subdomain={restaurant.subdomain} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const WebsiteLink = ({ id, subdomain }: { id: string | number, subdomain?: string | null }) => {
  const [domain, setDomain] = useState<string | undefined>(undefined)
  const supabase = useSupabaseClient<Database>()

  useEffect(() => {
    const fetchDomain = async () => {
      const { data, error } = await supabase
        .from('custom_domains')
        .select()
        .eq('restaurant_id', id)
        .limit(1)
        .single()
      console.log(data, error)

      if (error) return console.log('error', error)
      if (data.domain) setDomain(data.domain)
    }
    fetchDomain()
  }, [supabase, id])



  const [useThisDomain, setUseThisDomain] = useState<string | null>(() => {
    if (domain) return domain
    if (subdomain) {
      // replace "gastrobit.de" with value in .env
      const newSubdomain = subdomain.replace('gastrobit.de', process.env.NEXT_PUBLIC_DOMAIN!)
      return newSubdomain
    }
    return null
  })

  if (!useThisDomain) return <></>

  return <a
    href={'https://' + (subdomain ?? domain)}
    className='py-3 hover:text-gray-400 hover:underline'>
    Zur Website
  </a>
}
