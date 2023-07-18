import { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiHandler, NextApiRequest } from 'next'


const handler: NextApiHandler = async function (req: NextApiRequest, res) {
  const { domain } = req.query

  if (!domain) {
    return res.status(400).json({ error: 'domain_missing' })
  }

  if (typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain_not_string' })
  }

  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient<Database>({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no user session, return error
  if (!session)
    return res.status(401).json({
      error: 'not_authenticated',
      description:
        'The user does not have an active session or is not authenticated',
    })

  // add domain to vercel
  const response = await removeDomainFromVercel(domain)


  // if something went wrong, we echo the error
  if (response.error) {
    console.error('error', response.error)

    return res.status(500).json({ ...response.error })
  }

  // remove the domain from supabase
  const { data: supabaseResponse, error } = await supabase.from('custom_domains').delete().eq('domain', domain).eq('user_id', session.user.id)
  // if error on delete on supabase, we echo the error

  if (error) {
    console.error('error', error)
    return res.status(500).json({ error: error.message })
  }



  return res.status(200).json({ success: true })
}


const removeDomainFromVercel = async (domain: string) => {
  const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${domain}`, {
    "headers": {
      Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
    },
    "method": "DELETE"
  })

  const json = await response.json()
  return json
}




export default handler
