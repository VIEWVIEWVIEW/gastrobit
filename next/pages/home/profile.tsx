import MainLayout from '@/Layouts/MainLayout'
import React, { useEffect } from 'react'
import {
  useUser,
  useSupabaseClient,
  Session,
} from '@supabase/auth-helpers-react'

type Props = {
  session: Session
}

function Profile({ session }: Props) {
  const supabase = useSupabaseClient()
  const user = useUser()

  return (
    <MainLayout>

    </MainLayout>
  )
}

export default Profile
