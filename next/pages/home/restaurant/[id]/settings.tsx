import MainLayout from '@/components/layouts/MainLayout'
import { Database } from '@/types/supabase'
import {
  useSession,
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { createBrowserSupabaseClient, createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import DomainCard from '@/components/home/domainCard'
import useSWR from 'swr'
import { toast } from 'react-hot-toast'

type Restaurant = Database['public']['Tables']['restaurants']['Row']
type Domain = Database['public']['Tables']['custom_domains']['Row']

type Props = {
  restaurant: Restaurant
  domains: Domain[]
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
  const restaurantPromise = supabase // no await here so we can run both queries in parallel
    .from('restaurants')
    .select()
    .limit(1)
    .eq('id', ctx.params!.id)
    .single()

  // and custom domains
  const domainsPromise = supabase
    .from('custom_domains')
    .select()
    .eq('restaurant_id', ctx.params!.id)



  // wait for both promises to resolve.
  const [{ data: restaurant }, { data: domains }] = await Promise.all([
    restaurantPromise,
    domainsPromise,
  ])

  return {
    props: {
      params: ctx.params,
      restaurant,
      domains,
    },
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface GetDomainsAnswer {
  name: string;
  apexName: string;
  projectId: string;
  redirect: null;
  redirectStatusCode: null;
  gitBranch: null | string;
  updatedAt: number;
  createdAt: number;
  verified: boolean;
}


function Restaurant({ restaurant, domains }: Props) {
  const router = useRouter()
  const { id } = router.query

  const user = useUser()
  const supabase = useSupabaseClient<Database>()

  // we find the domain which ends on 'gastrobit.de', and split off everything after the dot. If no *.gastrobit.de domain is used, we use an empty string.
  const [gastrobitSubdomain, setGastrobitSubdomain] = useState(restaurant.subdomain?.split('.')[0] || '')

  // set list of customdomains, which don't belong to the subdomain 'gastrobit.de'

  const [newCustomDomain, setNewCustomDomain] = useState('')

  const { data: domainList, mutate: revalidateDomains, isLoading } =
    useSWR<GetDomainsAnswer[]>(`/api/get-domains?restaurant=${restaurant.id}`, fetcher, {
      refreshInterval: 15000,
    })


  const [addCustomDomainLoadingAnimation, setAddCustomDomainLoadingAnimation] = useState(false)
  const [updatingSubdomain, setUpdatingSubdomain] = useState(false)

  // add a new custom domain
  const addDomainToRestaurant = async (e: any) => {
    e.preventDefault()
    setAddCustomDomainLoadingAnimation(true)

    const fetchData = new Promise((resolve, reject) => {
      fetch(`/api/add-domain`, {
        method: 'POST',
        body: JSON.stringify({
          restaurantId: restaurant.id,
          domain: newCustomDomain,
        }),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async res => {
        if (res.status === 200) {
          revalidateDomains()
          resolve(await res.json())
        } else {
          reject(await res.json())
        }
      })
    })

    toast.promise(fetchData, {
      loading: 'Domain wird hinzugefügt...',
      success: (data: any) => `Erfolgreich gespeichert: ${data.name}`,
      error: (err) => err.message,
    })

    setAddCustomDomainLoadingAnimation(false)
  }

  // update the .gastrobit.de subdomain
  const updateSubdomain = async (e: any) => {
    e.preventDefault()

    setUpdatingSubdomain(true)

    const supabase = createBrowserSupabaseClient<Database>()

    const { data, error } = await supabase
      .from('restaurants')
      .update({ subdomain: `${gastrobitSubdomain}.gastrobit.de` })
      .eq('id', restaurant.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Subdomain erfolgreich geändert.')
    }

    setUpdatingSubdomain(false)
  }





  if (!restaurant)
    return (
      <MainLayout>
        <div className='container px-96 mx-aut'>
          <div className='flex flex-col justify-end px-10 m-20'>
            <h1 className='text-3xl font-bold text-center'>
              Bisher hast du kein Restaurant erstellt.
            </h1>
            <a href='/restaurant/create' className='btn-primary'>
              Erstelle jetzt dein Restaurant
            </a>
          </div>
        </div>
      </MainLayout >
    )

  return (
    <MainLayout>
      <main className='container mx-auto'>
        <div className='flex flex-col px-10 m-2'>
          <h1 className='text-3xl font-bold text-center'>
            Restaurant &quot;{restaurant.name}&quot;
          </h1>

          <form className='container p-4 mx-auto space-y-8 divide-y divide-gray-200'>
            <div className='space-y-8 divide-y sm:space-y-5'>
              {/** Settings */}

              <div>
                <div>
                  <h3 className='mt-10 text-lg font-medium leading-6 text-gray-900'>
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
                      <div className='flex max-w-lg'>
                        <input
                          type='text'
                          name='subdomain'
                          id='subdomain'
                          autoComplete='subdomain'
                          className='flex-1 block w-full min-w-0 input'
                          placeholder='pizzapalast-hagen'
                          value={gastrobitSubdomain}
                          onChange={e => setGastrobitSubdomain(e.target.value)}
                        />
                        <span className='inline-flex items-center px-3 text-gray-500 border-l-0 input bg-slate-200'>
                          .gastrobit.de
                        </span>
                      </div>

                      <button className='mt-2 btn-primary' onClick={updateSubdomain}>Speichern</button>
                    </div>

                    <hr className='col-span-3' />
                    <label
                      htmlFor='customDomain'
                      className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                      Eigene Domain hinzufügen
                    </label>
                    <div className='mt-1 sm:mt-0 sm:col-span-2'>
                      <div className='flex max-w-lg'>
                        <input
                          type='text'
                          name='customDomain'
                          id='customDomain'
                          autoComplete='customDomain'
                          className='flex-1 block w-full min-w-0 input'
                          placeholder='pizzapalast.de'
                          value={newCustomDomain}
                          onChange={e => setNewCustomDomain(e.target.value)}
                        />
                        <button className='inline-flex items-center px-3 text-white border-l-0 cursor-pointer input bg-taubmanspurple-500'
                          onClick={addDomainToRestaurant} disabled={isLoading}>
                          Hinzufügen
                        </button>
                      </div>
                    </div>




                  </div>

                  <div>
                    {/** Custom Domains */}
                    {!isLoading && domainList?.map((domain, index) => (
                      <Fragment key={index}>
                        <DomainCard domain={domain.name} revalidateDomains={revalidateDomains} index={index} />
                      </Fragment>
                    ))}
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

/**
 * Render 5 textboxes for custom domains.
 */
const CustomDomains = ({
  domains,
  setDomains,
}: {
  domains: string[]
  setDomains: Dispatch<string[]>
}) => {
  return (
    <>
      {domains.map((domain, index) => (
        <Fragment key={index}>
          <label
            htmlFor='subdomain'
            className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
            Eigene Domain #{index + 1} {index === 0 && '(Primärdomain)'}
          </label>
          <div className='mt-1 sm:mt-0 sm:col-span-2'>
            <div className='flex max-w-lg'>
              <input
                type='text'
                name='subdomain'
                id='subdomain'
                autoComplete='subdomain'
                className='flex-1 block w-full min-w-0 input'
                value={domain}
                onChange={e => {
                  const newDomains = [...domains]
                  newDomains[index] = e.target.value
                  setDomains(newDomains)
                }}
              />
              <span
                className='inline-flex items-center px-3 text-white border-l-0 cursor-pointer input bg-taubmanspurple-600'
                onClick={() => {
                  const newDomains = [...domains]
                  newDomains.splice(index, 1)
                  setDomains(newDomains)
                }}>
                Löschen
              </span>
            </div>
          </div>
        </Fragment>
      ))}
    </>
  )
}

export default Restaurant
