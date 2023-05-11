// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import {
  SupabaseClient,
  createServerSupabaseClient,
} from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

type NotAutenticated = {
  error?: string
  description?: string
}

type Response = {
  domains: Domain[]
}

type Domain = {
  name: string
  apexName: string
  projectId: string
  redirect: null
  redirectStatusCode: null
  gitBranch: string
  updatedAt: EpochTimeStamp
  createdAt: EpochTimeStamp
  verified: boolean
}

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

  // get all domains which match vercel + current user. RLS (row level security) is applied, as we use the user-session
  let domains: Domain[] = []
  try {
    domains = await getDomains(supabase)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'internal_server_error' })
  }

  res.status(200).json({ domains: domains })
}

async function getDomains(supabase: SupabaseClient<Database>) {
  const vercelDomains = await fetchDomainsFromVercel()

  // get all domains from the current user from supabase
  const { data: supabaseDomains, error } = await supabase
    .from('custom_domains')
    .select('*')

  console.log('Vercel Domains', vercelDomains)
  console.log('Supabase Domains', supabaseDomains)

  // if we have data
  if (!supabaseDomains) throw new Error('no data')

  // get all domains which are contained in supabase AND vercel
  const filteredDomains = vercelDomains.filter(vercelDomain =>
    supabaseDomains.find(domain => domain.domain === vercelDomain.name),
  )

  // get all domains which are in supabase, but not in vercel
  const unusedDomains = supabaseDomains.filter(
    supabaseDomain =>
      !vercelDomains.find(domain => domain.name === supabaseDomain.domain),
  )

  await removeUnusedDomains(unusedDomains.map(el => el.domain), supabase)
  console.log('unusedDomains', unusedDomains)

  return filteredDomains
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

    // check if there is a next page
    next = json.pagination.next
  } while (next)

  return vercelDomains
}

async function removeUnusedDomains(
  unusedDomains: string[],
  supabase: SupabaseClient<Database>,
) {
  await removeUnusedDomainsFromVercel(unusedDomains)
  await removeUnusedDomainsFromGastrobit(unusedDomains, supabase)

  async function removeUnusedDomainsFromVercel(domains: string[]) {
    console.log("Removing domains from vercel:", domains)
    for (const domain of domains) {
      /**
       * await fetch(`https://api.vercel.com/v6/domains/${domain}`, {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        },
        method: 'delete',
      })
      **/
    }
  }

  async function removeUnusedDomainsFromGastrobit(
    domains: string[],
    supabase: SupabaseClient<Database>,
  ) {
    console.log("Removing domain from supabase:", domains)
    for (const domain of domains) {
      //await supabase.from('custom_domains').delete().match({ domain: domain })
    }
  }
}

export default handler
