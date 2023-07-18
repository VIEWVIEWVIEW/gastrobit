import { Menu, Popover, Transition } from '@headlessui/react'
import {
  Bars4Icon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import Image from 'next/image'

import { Session } from '@supabase/auth-helpers-react'
import { useSession } from '@supabase/auth-helpers-react'

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { supabase } from '@supabase/auth-ui-shared'
import { Database } from '@/types/supabase'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Restaurants = Database['public']['Tables']['restaurants']['Row']



const Navbar = () => {
  const navigation = [{ name: 'Startseite', href: '/' }]
  const session = useSession()
  const supabase = useSupabaseClient()

  if (session && session.user)
    return (
      <>
        <LoggedInNavbar session={session} />
      </>
    )

  return (
    <>
      <Popover as='header' className='relative'>
        <div className='py-6 bg-taubmanspurple-500'>
          <nav
            className='relative flex items-center justify-between px-4 mx-auto max-w-7xl sm:px-6'
            aria-label='Global'>
            <div className='flex items-center flex-1'>
              <div className='flex items-center justify-between w-full md:w-auto'>
                <a href='#'>
                  <span className='sr-only'>Workflow</span>
                  <Image
                    className='w-auto h-8 sm:h-10 hover'
                    src='/Gastrobit.svg'
                    alt='Gastrobit Logo'
                    width={100}
                    height={100}
                  />
                </a>
                <div className='flex items-center -mr-2 md:hidden'>
                  <Popover.Button className='inline-flex items-center justify-center p-2 text-gray-400 bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white'>
                    <span className='sr-only'>Open main menu</span>
                    <Bars4Icon className='w-6 h-6' aria-hidden='true' />
                  </Popover.Button>
                </div>
              </div>
              <div className='hidden space-x-8 md:flex md:ml-10'>
                {navigation.map(item => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='text-base font-medium text-white hover:text-gray-300'>
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            <div className='hidden md:flex md:items-center md:space-x-6'>
              <Link href='/login' className='gastrobit-btn-primary'>
                Anmelden
              </Link>
            </div>
          </nav>
        </div>

        <Transition
          as={Fragment}
          enter='duration-150 ease-out'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='duration-100 ease-in'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'>
          <Popover.Panel
            focus
            className='absolute inset-x-0 top-0 p-2 transition origin-top transform md:hidden'>
            <div className='overflow-hidden rounded-lg shadow-md bg-taubmanspurple-700 ring-1 ring-black ring-opacity-5'>
              <div className='flex items-center justify-between px-5 pt-4'>
                <div>
                  <Image
                    className='w-auto h-8'
                    src='/Gastrobit.svg'
                    alt='Gastrobit Logo'
                    width={200}
                    height={200}
                  />
                </div>
                <div className='-mr-2'>
                  <Popover.Button className='inline-flex items-center justify-center p-2 text-white rounded-md bg-taubmanspurple-600 hover:bg-taubmanspurple-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-600'>
                    <span className='sr-only'>Close menu</span>
                    <XMarkIcon className='w-6 h-6' aria-hidden='true' />
                  </Popover.Button>
                </div>
              </div>
              <div className='pt-5 pb-6'>
                <div className='px-2 space-y-1'>
                  {navigation.map(item => (
                    <a
                      key={item.name}
                      href={item.href}
                      className='block px-3 py-2 text-base font-medium rounded-md text-gray-50 hover:bg-taubmanspurple-500'>
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className='px-5 mt-6'>
{/**
 *                   <a
                    href='#'
                    className='block w-full px-4 py-3 font-medium text-center text-white rounded-md shadow bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'>
                    Start free trial
                  </a>
 */}
                </div>
                <div className='px-5 mt-6'>
                  <p className='text-base font-medium text-center text-gray-500'>
                    Existing customer?{' '}
                    <a href='#' className='text-gray-900 hover:underline'>
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  )
}

/**
 * List of Restaurants for the navbar
 */
const Restaurants = ({
  restaurants,
  buttonClassNames,
  chevronClassNames,
}: {
  restaurants: Restaurants[]
  buttonClassNames?: string
  chevronClassNames?: string
}) => {
  // if we have more than 3 restaurants, we show them in a dropdown menu
  // else, we render the restaurants as seperate buttons in the navbar
  if (restaurants.length > 3)
    return (
      <>
        <Menu>
          {/** If we have custom class names, we don't render the default (needed for mobile hamburger menu) */}
          <Menu.Button
            className={
              buttonClassNames
                ? buttonClassNames
                : 'flex flex-row justify-center px-4 py-2 border border-transparent text-base font-medium text-white focus:ring-2 focus:ring-taubmanspurple-100  hover:bg-taubmanspurple-700 focus:outline-none'
            }>
            Restaurants
            <ChevronDownIcon
              className={chevronClassNames ? chevronClassNames : 'w-6 h-6'}
            />
          </Menu.Button>
          <Menu.Items
            className={'absolute z-10 w-screen max-w-xs px-2 mt-3  sm:px-0'}>
            <div className='overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5'>
              <div className='relative grid gap-6 px-5 py-6 bg-taubmanspurple-800 sm:gap-8 sm:p-8'>
                {restaurants.map((restaurant, index) => (
                  <Menu.Item key={restaurant.id}>
                    {({ active }) => (
                      <a
                        className={`-m-3 p-3 ${
                          active && ' block bg-taubmanspurple-600 '
                        }`}
                        href={`/restaurant/${restaurant.id}/settings`}>
                        <p className='text-sm font-medium text-white'>
                          {restaurant.name}
                        </p>
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </div>
          </Menu.Items>
        </Menu>
      </>
    )

  // render the restaurants as seperate buttons in the navbar
  return (
    <>
      {restaurants.map((restaurant, index) => (
        <a
          key={index}
          href={`/restaurant/${restaurant.id}/settings`}
          className='block px-3 py-2 text-base font-medium text-gray-50 hover:bg-taubmanspurple-600'>
          {restaurant.name}
        </a>
      ))}
    </>
  )
}

/**
 * This is the navbar that is shown when the user is logged in
 */
const LoggedInNavbar = ({ session }: { session: Session }) => {
  const navigation = [{ name: 'Dashboard', href: '/' }]
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()

  const [restaurants, setRestaurants] = useState<Restaurants[]>([])

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select()
        .order('created_at', { ascending: true })

      if (error) console.log('error', error)
      else setRestaurants(restaurants)
    }

    fetchRestaurants()
  }, [supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <Popover as='header' className='relative'>
        <div className='py-6 bg-taubmanspurple-500'>
          <nav
            className='relative flex items-center justify-between px-4 mx-auto max-w-7xl sm:px-6'
            aria-label='Global'>
            <div className='flex items-center flex-1'>
              <div className='flex items-center justify-between w-full md:w-auto'>
                <Link href='/'>
                  <span className='sr-only'>Gastrobit</span>
                  <Image
                    className='w-auto h-8 sm:h-10 hover'
                    src='/Gastrobit.svg'
                    alt='Gastrobit Logo'
                    width={100}
                    height={100}
                  />
                </Link>
                <div className='flex items-center -mr-2 md:hidden'>
                  <Popover.Button className='inline-flex items-center justify-center p-2 mx-4 text-gray-400 bg-taubmanspurple-700 hover:bg-taubmanspurple-800 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white'>
                    <span className='sr-only'>Open main menu</span>
                    <Bars4Icon className='w-6 h-6' aria-hidden='true' />
                  </Popover.Button>
                </div>
              </div>
              <div className='hidden space-x-2 md:flex md:ml-10'>
                {navigation.map(item => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='flex flex-row justify-center px-4 py-2 text-base font-medium text-white border border-transparent focus:ring-2 focus:ring-taubmanspurple-100 hover:bg-taubmanspurple-700 focus:outline-none'>
                    {item.name}
                  </a>
                ))}

                <Restaurants restaurants={restaurants} />
              </div>
            </div>
            <div className='flex-row items-center hidden space-x-6 md:flex '>
              <a
                className='text-base font-medium text-white hover:text-gray-300'
                href='/profile'>
                {session.user.email}
              </a>
              <a
                onClick={logout}
                className='text-base font-medium text-white cursor-pointer hover:text-gray-300'>
                Logout
              </a>
            </div>
          </nav>
        </div>

        <Transition
          as={Fragment}
          enter='duration-150 ease-out'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='duration-100 ease-in'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'>
          <Popover.Panel
            focus
            className='absolute inset-x-0 top-0 p-2 transition origin-top transform md:hidden'>
            <div className='overflow-hidden shadow-md bg-taubmanspurple-700 ring-1 ring-black ring-opacity-5'>
              <div className='flex items-center justify-between px-5 pt-4'>
                <div>
                  <Image
                    className='w-auto h-8'
                    src='/Gastrobit.svg'
                    alt='Gastrobit Logo'
                    width={200}
                    height={200}
                  />
                </div>
                <div className='-mr-2'>
                  <Popover.Button className='inline-flex items-center justify-center p-2 text-white border-0 border-none focus:outline-white bg-taubmanspurple-600 hover:bg-taubmanspurple-500 focus:outline-none focus:ring-2 focus:ring-inset ring-0'>
                    <span className='sr-only'>Close menu</span>
                    <XMarkIcon className='w-6 h-6' aria-hidden='true' />
                  </Popover.Button>
                </div>
              </div>
              <div className='pt-5 pb-6'>
                <div className='px-2 space-y-1'>
                  {navigation.map(item => (
                    <a
                      key={item.name}
                      href={item.href}
                      className='block px-3 py-2 text-base font-medium text-gray-50 hover:bg-taubmanspurple-600'>
                      {item.name}
                    </a>
                  ))}
                  <Restaurants
                    restaurants={restaurants}
                    buttonClassNames='block px-3 py-2 text-base font-medium text-gray-50 hover:bg-taubmanspurple-600 flex flex-row w-full'
                  />
                </div>
                <div className='px-5 mt-6'>
                  <a
                    href='#'
                    className='block w-full px-4 py-3 font-medium text-center text-white rounded-md shadow bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'>
                    Start free trial
                  </a>
                </div>
                <div className='px-5 mt-6'>
                  <p className='text-base font-medium text-center text-gray-500'>
                    Existing customer?{' '}
                    <a href='#' className='text-gray-900 hover:underline'>
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  )
}

export { Navbar }
