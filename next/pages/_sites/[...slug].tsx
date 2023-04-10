import { useRouter } from 'next/router'
import { GetServerSideProps  } from 'next'

export const getServerSideProps: GetServerSideProps = async function ({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  )

  console.log("fetched")

  return {
    props: {},
  }
}

function Page(props: any) {
  const router = useRouter()
  return <div>User site {router.route} {JSON.stringify(props)} </div>
}

export default Page
