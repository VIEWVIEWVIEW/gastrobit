import { stripe } from "@/stripe";
import { Database } from "@/types/supabase";
import { createRouteHandlerSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@supabase/auth-ui-shared";
import { NextApiHandler } from "next";
import { NextResponse } from "next/server";

const handler: NextApiHandler = async function (req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method not allowed, use POST'
    });
  }

  // get supabase
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
  const userId = session.user.id;


  // get params for new express stripe acc
  const { restaurantId } = req.query;

  const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).eq('owner_id', userId).single();

  console.log(userId, restaurantId, restaurant)

  if (error || !restaurant || !restaurant.stripe_account_id) {
    return res.status(400).json({
      error: 'restaurant not found'
    });
  }


  // create express account
  const account = await stripe.accounts.createLoginLink(
    restaurant.stripe_account_id
  );

  return res.redirect(account.url)
}

export default handler;