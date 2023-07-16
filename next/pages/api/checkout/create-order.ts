import { stripe } from "@/stripe";
import { Database } from "@/types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs/dist";
import { NextApiHandler } from "next";

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
  const { restaurantId, address, bestellung } = req.body;

  const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();



  if (error || !restaurant || !restaurant.stripe_account_id) {
    return res.status(400).json({
      error: 'restaurant not found'
    });
  }



  return res.json({
    order_id: 1337
  })
}


export default handler;