// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import {
  SupabaseClient,
  createServerSupabaseClient,
} from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Domain } from '../../types/Domain'

type NotAutenticated = {
  error?: string
  description?: string
}

type Response = any

type Pagination = {
  count: number
  next: EpochTimeStamp | null
  previous: EpochTimeStamp | null
}

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<NotAutenticated | Response>,
) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient<Database>({ req, res })
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, return error
  if (!session)
    return res.status(401).json({
      error: 'not_authenticated',
      description:
        'The user does not have an active session or is not authenticated',
    })

  // get all domains from supabase
  const { data: domains, error } = await supabase
    .from('custom_domains')
    .select('*')

  // get all domains from vercel
  const vercelDomains = await fetchDomainsFromVercel()

  // find all domains from vercel which are in supabase
  const domainsInVercelAndSupabase = vercelDomains.filter(vercelDomain => {
    return domains?.find(domain => domain.domain === vercelDomain.name)
  })

  // filter out all domains from supabase which are not in vercel
  const domainsInVercelButNotInSupabase = vercelDomains.filter(vercelDomain => {
    return !domains?.find(domain => domain.domain === vercelDomain.name)
  })

  // filter out all domains in supabase which are not in vercel AND don't contain "localhost:3000", "gastrobit.de" or "www.gastrobit.de" etc
  // this means we will only return domains which don't fit the pattern below.
  const domainsInSupabaseButNotInVercel = domains?.filter(domain => {
    return !vercelDomains.find(vercelDomain => {
      return (
        domain.domain === vercelDomain.name ||
        domain.domain.includes('localhost:3000') ||
        domain.domain.includes('www.gastrobit.de') ||
        domain.domain.includes('gastrobit.de') ||
        domain.domain == '*.gastrobit.de' ||
        domain.domain == 'gastrobit.vercel.app' ||
        domain.domain == 'www.gastrobit.vercel.app'
      )
    })
  })

  // if there are domains in supabase but not in vercel
  // add these domains to vercel
  if (
    domainsInSupabaseButNotInVercel &&
    domainsInSupabaseButNotInVercel.length > 0
  ) {
    for (const domain of domainsInSupabaseButNotInVercel) {
      const response = await addDomainToVercel(domain?.domain)

      // We won't return this error to the user, as this is simply a sync function between supabase <=> vercel. But an admin might be interested in this.
      if (response.error) {
        console.error({
          ...response,
          ...(await supabase.auth.getUser()),
          message: 'Error while adding domain to vercel.',
        })
      }
    }
  }

  // if there is an error, return it
  if (error) return res.status(500).json({ error })

  res.status(200).json(domainsInVercelAndSupabase)
}

async function addDomainToVercel(domain: string) {
  console.log('addDomainToVercel', domain)

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains`,
    {
      body: `{\n  "name": "${domain}"\n}`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  const data = await response.json()

  return data
}

async function fetchDomainsFromVercel() {
  let vercelDomains: Domain[] = []

  // vercel has pagination, so we loop till there is no "pagination.next" key.
  let next = 0 as EpochTimeStamp | null
  do {
    // fetch all domains from vercel
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${
        process.env.PROJECT_ID_VERCEL
      }/domains?limit=100${next ? `&until=${next}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      },
    )

    // parse
    const json: { domains: Domain[]; pagination: Pagination } =
      await response.json()

    // add to array
    vercelDomains = [...vercelDomains, ...json.domains]

    // set next to the next pagination key. If the key is null, we are done
    next = json.pagination.next
  } while (next)

  return vercelDomains
}

export default handler
