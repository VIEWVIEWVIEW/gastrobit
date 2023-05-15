import MainLayout from '@/layouts/MainLayout'
import { Database } from '@/types/supabase'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export default function EnrollMFA() {
  const supabase = useSupabaseClient<Database>()
  const [factorId, setFactorId] = useState('')
  const [qr, setQR] = useState('') // holds the QR code image SVG
  const [verifyCode, setVerifyCode] = useState('') // contains the code entered by the user
  const [error, setError] = useState('') // holds an error message

  const onEnrolled = () => {
    console.log('onEnrolled')
  }

  const onCancelled = () => {
    console.log('onCancelled')
  }

  const onEnableClicked = () => {
    setError('')
    ;(async () => {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) {
        setError(challenge.error.message)
        throw challenge.error
      }

      const challengeId = challenge.data.id

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      })
      if (verify.error) {
        setError(verify.error.message)
        throw verify.error
      }

      onEnrolled()
    })()
  }

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (error) {
        throw error
      }

      setFactorId(data.id)

      // Supabase Auth returns an SVG QR code which you can convert into a data
      // URL that you can place in an <img> tag.
      setQR(data.totp.qr_code)
    })()
  }, [])

  return (
    <>
      <MainLayout>
        <div className='container mx-auto'>
          {error && <div className='error'>{error}</div>}
          <img src={qr} />
          <input
            type='text'
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.trim())}
          />
          <input type='button' value='Enable' onClick={onEnableClicked} />
          <input type='button' value='Cancel' onClick={onCancelled} />
        </div>
      </MainLayout>
    </>
  )
}
