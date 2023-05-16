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

  // fetch all domains from vercel
  const vercelDomains = await fetchDomainsFromVercel()

  // find all domains from vercel which are in supabase
  const domainsInVercelAndSupabase = vercelDomains.filter((vercelDomain) => {
    return domains?.find((domain) => domain.domain === vercelDomain.name)
  })

  // find subdomain which ends with .gastrobit.de
  const gastrobitSubdomain = domains?.find((domain) => {
    return domain.domain.endsWith('.gastrobit.de')
  })


  // if there is an error, return it
  if (error) return res.status(500).json({ error })

  res.status(200).json(domainsInVercelAndSupabase)
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
