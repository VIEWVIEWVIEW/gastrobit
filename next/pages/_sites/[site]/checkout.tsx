import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

import type { ParsedUrlQuery } from "querystring"

interface PathProps extends ParsedUrlQuery {
  site: string
  slug: string
}

export const getServerSideProps: GetServerSideProps = async function ({
  req,
  res,
  params,
}) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  )

  // get the current subdomain

  console.log('fetched', params)

  return {
    props: {
      params,
    },
  }
}

function Page(props: any) {
  const router = useRouter()
  return (
    <div>
      Checkout {router.route} {JSON.stringify(props)}{' '}
    </div>
  )
}

export default Page
