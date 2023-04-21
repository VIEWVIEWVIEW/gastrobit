import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

import type { ParsedUrlQuery } from 'querystring'
import RestaurantLayout from '@/Layouts/RestaurantLayout'

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

  return {
    props: {
      params,
    },
  }
}

function Page(props: any) {
  const router = useRouter()
  return (
    <RestaurantLayout>
      <div>
        Index {router.route} {JSON.stringify(props)}{' '}
      </div>
    </RestaurantLayout>
  )
}

export default Page
