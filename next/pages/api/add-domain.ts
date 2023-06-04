import { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiHandler, NextApiRequest } from 'next'


const handler: NextApiHandler = async function (req: NextApiRequest, res) {
  const { domain, restaurantId } = req.body

  console.log(req.body)

  if (!domain) {
    return res.status(400).json({ error: 'domain_missing' })
  }
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurant_missing', description: 'The restaurant id is missing in the query string. Use ?restaurant=1 to add a restaurant id' })
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
  const response = await addDomainToVercel(domain)


    

  // if something went wrong, we remove the domain from vercel
  if (response.error) {
    console.error('error', response.error)
    // remove domain from vercel 
    await removeDomainFromVercel(domain)
    return res.status(500).json({ ...response.error})
  }

  // else, we add the domain to supabase
  const { data: supabaseResponse, error } = await supabase.from('custom_domains').insert([
    { domain, restaurant_id: restaurantId, user_id: session.user.id }
  ])

  // if error on insert into supabase, we remove the domain from vercel
  if (error) {
    console.error('error', error)
    // remove domain from vercel
    await removeDomainFromVercel(domain)
    return res.status(500).json({ error: error.message })
  }



  return res.status(200).json(response)
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


const addDomainToVercel = async (domain: string) => {
  const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.PROJECT_ID_VERCEL}/domains`, {
    "body": JSON.stringify({
      "name": domain,
      "gitBranch": process.env.GIT_BRANCH_FOR_DOMAINS,
      "redirect": null,
      "redirectStatusCode": 307
    }),
    "headers": {
      "Authorization": `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
    },
    "method": "post"
  })

  const json = await response.json()

  console.log('addDomainToVercel', json)
  return json
}

export default handler
