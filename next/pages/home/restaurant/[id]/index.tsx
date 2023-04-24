import MainLayout from '@/Layouts/MainLayout'
import { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'

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

function Index(props: Props) {
  const router = useRouter()
  const { id } = router.query

  const restaurant = props.restaurant
  return (
    <MainLayout>
      <main className='container max-w-3xl mx-auto'>
        <div className='flex flex-col items-center my-5 '>
          <h1 className='text-4xl'>{restaurant.name}</h1>
          
          <div>Einstellungen</div>
        </div>
      </main>
    </MainLayout>
  )
}

export default Index
