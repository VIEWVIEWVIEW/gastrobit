import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /examples (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
  ],
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host') || 'localhost:3000'

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname

  /*  You have to replace ".vercel.pub" with your own domain if you deploy this example under your domain.
      You can also use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      in this case, our team slug is "platformize", thus *.platformize.vercel.app works. Do note that you'll
      still need to add "*.platformize.vercel.app" as a wildcard domain on your Vercel dashboard. */
  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(`.gastrobit.de`, '')
      : hostname.replace(`.localhost:3000`, '')

  // rewrite root application to `/home` folder
  if (
    hostname === 'localhost:3000' ||
    hostname === 'www.localhost:3000' ||
    hostname === 'gastrobit.de' ||
    hostname === 'www.gastrobit.de'
  ) {
    return NextResponse.rewrite(new URL(`/home${path}`, req.url))
  }

  // else we are on a user page
  // therefore we need the restaurant id from db
  const supabase = new SupabaseClient<Database>(
    'https://cdnbppscedvrlglygkyn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmJwcHNjZWR2cmxnbHlna3luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDU2NjkwMiwiZXhwIjoxOTk2MTQyOTAyfQ.yFo5jlzaEu31TjrGH_sGJiSXMQk7u3mxSshcCtsRI3U',
  )

  console.log('currentHost', hostname)

  // get the restaurant id of our current host
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .overlaps('domains', ['hostname'])
    .single()

  const restaurantId = data?.id

  // if no restaurant id is found, the restaurant does not exist. We redirect to home
  if (!restaurantId) {
    return NextResponse.rewrite(new URL(`/404.tsx`, req.url))
  }

  // rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(
    new URL(`/_sites/${restaurantId}${path}`, req.url),
  )
}
