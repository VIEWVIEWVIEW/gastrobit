import React from 'react'

import {
  SupabaseClient,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import locale from '@/components/home/supabaseAuthLocale.json'

import MainLayout from '@/components/layouts/MainLayout'
import { useRouter } from 'next/router'

function Login() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  if (session) {
    router.push('/')
  }

  return (
    <>
      <MainLayout>
        <div className='container mx-auto mt-5 mb-10'>
          <Supabase supabase={supabase} />
        </div>
      </MainLayout>
    </>
  )
}

function Supabase({ supabase }: { supabase: SupabaseClient }) {
  return (
    <div className='flex flex-row justify-center'>
      <div className='flex flex-col items-center justify-center p-4 bg-sepia-200 '>
        <h2 className='self-start text-2xl font-semibold'>Anmelden</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          magicLink={true}
          socialLayout='vertical'
          localization={{
            variables: locale,
          }}
          appearance={{
            extend: false,
            className: {
              button:
                'btn-primary flex flex-row justify-center items-center focus:ring-0 w-80 break-normal',
              container: 'mb-4 mt-2  flex flex-col justify-center items-center',
              anchor: 'text-taubmanspurple-600 hover:text-taubmanspurple-400',
              divider: 'w-full border-t border-gray-300 my-4',
              label: 'text-sm flex',
              input: 'input mb-2 w-80 ',
              loader: 'loader',
              message:
                'text-semibold text-white bg-taubmanspurple-500 mt-4  text-lg p-4 flex flex-row justify-center text-center underline decoration-double decoration-white word-wrap break-word w-80',
            },
          }}
        />
      </div>
    </div>
  )
}

export default Login
