import MainLayout from '@/components/layouts/MainLayout'
import React, { useEffect } from 'react'
import {
  useUser,
  useSupabaseClient,
  Session,
} from '@supabase/auth-helpers-react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

import { EnrollMFA } from '@/components/home/enrollmfa'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Props = {
  user: Session['user']
  data: any[]
}

type Inputs = {
  email: string
  password: string
}

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  const supabase = createServerSupabaseClient(ctx)
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

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  }
}

function Profile({ user }: Props) {
  const supabase = useSupabaseClient<Database>()

  // form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({ defaultValues: { email: user.email } })
  // on submit handler

  const onSubmit: SubmitHandler<Inputs> = async data => {
    if (data.email !== user.email) {
      console.log('Email has changed')
      const { data: result, error } = await supabase.auth.updateUser({
        email: data.email,
      })
    }

    if (data.password !== '') {
      console.log('Password has changed')

      const { data: result, error } = await supabase.auth.updateUser({
        password: data.password,
      })

      console.log(result)
    }
  }

  return (
    <MainLayout>
      <main className='container mx-auto'>
        <div className='flex flex-col px-10 m-2'>
          <form
            className='container p-4 mx-auto space-y-8 divide-y divide-taubmanspurple-500'
            onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-8 divide-y divide-taubmanspurple-500 sm:space-y-5'>
              <div>
                <div>
                  <h3 className='text-lg font-medium leading-6 text-gray-900'>
                    Nutzereinstellungen
                  </h3>
                  <p className='max-w-2xl mt-1 text-sm '>
                    Hier kannst du die Einstellungen deines Accounts ändern.
                  </p>
                </div>

                <div className='mt-6 space-y-6 sm:mt-5 sm:space-y-5'>
                  <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-taubmanspurple-400 sm:pt-5'>
                    {/**Email */}
                    <label
                      htmlFor='email'
                      className='block font-medium text-gray-700 text-md sm:mt-px sm:pt-2'>
                      E-Mail
                    </label>
                    <div className='mt-1 sm:mt-0 sm:col-span-2'>
                      <div className='flex max-w-lg rounded-md shadow-sm'>
                        <input
                          type='text'
                          id='email'
                          autoComplete='email'
                          className='flex-1 block w-full min-w-0 input'
                          placeholder='name@domain.com'
                          {...register('email')}
                        />
                      </div>
                    </div>

                    {/**Password */}
                    <label
                      htmlFor='password'
                      className='block font-medium text-gray-700 text-md sm:mt-px sm:pt-2'>
                      Neues Passwort
                    </label>

                    <div className='mt-1 sm:mt-0 sm:col-span-2'>
                      <div className='flex max-w-lg '>
                        <input
                          type='password'
                          id='password'
                          autoComplete='password'
                          className='flex-1 block w-full min-w-0 input'
                          placeholder='Passwort'
                          {...register('password')}
                        />
                      </div>
                    </div>

                    <div className='col-start-2 col-end-3'>
                      <input
                        value='Speichern'
                        type='submit'
                        className='w-full mt-10 cursor-pointer btn-primary'
                      />
                    </div>

                    {/**MFA 
                    <label
                      htmlFor='password'
                      className='block font-medium text-gray-700 text-md sm:mt-px sm:pt-2'>
                      2-Faktor-Authentifizierung
                    </label>

                    <div className='mt-1 sm:mt-0 sm:col-span-2'>
                      <div className='flex max-w-lg rounded-md shadow-sm'>
                        <Link
                          className='flex-1 w-full min-w-0 btn-secondary'
                          href='/mfa'>
                          Aktivieren
                        </Link>
                      </div>
                    </div>
                    */}
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

export default Profile
