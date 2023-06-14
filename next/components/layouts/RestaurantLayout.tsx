import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Navbar } from '../restaurant/navbar'

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  ctx.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  )
  const supabase = createServerSupabaseClient(ctx)

  // get the theme

  // get restaurant

  return {
    props: {
      params: ctx.params,
    },
  }
}

function RestaurantLayout({
  children,
  className,
  theme,
}: {
  children: React.ReactNode
  className?: string
  theme?: string
}) {
  return (
    <>
      <div data-theme={theme}>
        <Navbar restaurantName='Restaurant' />

        <div
          className='flex flex-col justify-between min-h-screen '>
          <div>{children}</div>
        </div>
      </div>
    </>
  )
}

export default RestaurantLayout
