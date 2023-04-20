import MainLayout from '@/Layouts/MainLayout'
import { Database } from '@/types/supabase'
import {
  useSession,
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

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

  console.debug(restaurant)

  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}
function Restaurant(props: Props) {
  const router = useRouter()
  const { id } = router.query

  const user = useUser()
  const supabase = useSupabaseClient<Database>()

  const restaurant = props.restaurant

  const [subdomain, setSubdomain] = useState('')
  const getGastrobitSubdomain = useCallback(() => {
    if (!restaurant || !restaurant.domains) return
    
    const subdomain = restaurant?.domains.find(domain =>
      domain.includes('gastrobit.de'),
    )

    if (subdomain) {
      const subdomainWithoutTld = subdomain.split('.')[0]
      setSubdomain(subdomainWithoutTld)
    }
  }, [restaurant])

  useEffect(() => {
    getGastrobitSubdomain()
  }, [getGastrobitSubdomain, restaurant])

  if (!restaurant)
    return (
      <MainLayout>
        <div className='container mx-auto'>
          <div className='flex flex-col justify-end px-10 m-2'>
            <h1 className='text-3xl font-bold text-center'>
              Bisher hast du kein Restaurant erstellt.
            </h1>
            <a href='/restaurant/create' className='btn-primary'>
              Erstelle jetzt dein Restaurant
            </a>
          </div>
        </div>
      </MainLayout>
    )

  return (
    <MainLayout>
      <main className='container mx-auto'>
        <div className='flex flex-col px-10 m-2'>
          <h1 className='text-3xl font-bold text-center'>
            Restaurant &quot;{restaurant.name}&quot;
          </h1>

          <form className='container p-4 mx-auto space-y-8 divide-y divide-gray-200'>
            <div className='space-y-8 divide-y divide-gray-200 sm:space-y-5'>
              <div>
                <div>
                  <h3 className='text-lg font-medium leading-6 text-gray-900'>
                    Einstellungen
                  </h3>
                  <p className='max-w-2xl mt-1 text-sm text-gray-500'>
                    Hier kannst du die Einstellungen deines Restaurants ändern.
                  </p>
                </div>

                <div className='mt-6 space-y-6 sm:mt-5 sm:space-y-5'>
                  <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5'>
                    <label
                      htmlFor='subdomain'
                      className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                      Subdomain
                    </label>
                    <div className='mt-1 sm:mt-0 sm:col-span-2'>
                      <div className='flex max-w-lg rounded-md shadow-sm'>
                        <input
                          type='text'
                          name='subdomain'
                          id='subdomain'
                          autoComplete='subdomain'
                          className='flex-1 block w-full min-w-0 input'
                          placeholder='pizzapalast-hagen'
                          value={subdomain}
                          onChange={e => setSubdomain(e.target.value)}
                        />
                        <span className='inline-flex items-center px-3 text-gray-500 border-l-0 input bg-slate-200'>
                          .gastrobit.de
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </MainLayout>
  )
}

export default Restaurant
