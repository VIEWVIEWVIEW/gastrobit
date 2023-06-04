import { NextApiHandler, NextApiRequest } from 'next'

type Config = {
  configuredBy: string | null,
  nameservers: string[],
  serviceType: 'external' | 'vercel',
  cnames: string[],
  aValues: string[],
  conflicts: string[],
  acceptedChallenges: string[],
  misconfigured: boolean
}

import { Domain } from '@/types/Domain'

const handler: NextApiHandler = async function (req: NextApiRequest, res) {
  // get domain ?domain=example.com
  const { domain: domainFromQuerystring  } = req.query

  if (!domainFromQuerystring) {
    return res.status(400).json({ error: 'domain_missing' })
  }

  // we make an array for the request to /config and /domains/:domain, so we can make both requests in parallel
  const requests = [
    // fetch config
    fetch(`https://api.vercel.com/v6/domains/${domainFromQuerystring}/config`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }),
    fetch(
      `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${domainFromQuerystring}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    ),
  ]

  // await both requests
  const [configRes, domainRes] = await Promise.all(requests)

  const config: Config = await configRes.json()
  const domain: Domain = await domainRes.json()

  if (domainRes.status !== 200) {
    return res.status(domainRes.status).send(domain)
  }

  
  // If domain is not verified, we try to verify now
  let verificationResponse = null
  if (!domain.verified) {
    const verificationRes = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.PROJECT_ID_VERCEL}/domains/${domainFromQuerystring}/verify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    )
    verificationResponse = await verificationRes.json()
  }

  //console.log(domain, config, verificationResponse)

  if (verificationResponse && verificationResponse.verified) {
    // Domain was just verified
    return res.status(200).json({
      configured: !config.misconfigured,
      ...verificationResponse,
    })
  }

  return res.status(200).json({
    configured: !config.misconfigured,
    ...domain,
    ...(verificationResponse ? { verificationResponse } : {}),
  })
}

export default handler
