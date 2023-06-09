import { stripe } from "@/stripe";
import { Database } from "@/types/supabase";
import { createRouteHandlerSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@supabase/auth-ui-shared";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async function (req, res) {
  if (req.method !== 'POST') {
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


  // get params for new express stripe acc
  const { business_type, business_name } = req.body;


  if (!business_type || !business_name) {
    return res.status(400).json({
      error: 'missing business_type or business_name'
    });
  }

  console.debug('creating express account', business_type, business_name);

  // create express account
  const account = await stripe.accounts.create({
    company: {
      name: business_name
    },
    email: session.user.email,
    type: 'express',
    country: 'DE',
    business_type,
    
    capabilities: {
      card_payments: {
        requested: true
      },
      transfers: {
        requested: true
      },
      sofort_payments: {
        requested: true
      },
    },

    metadata: {
      supabase_user_id: session.user.id
    }
  });

  // create supabase restaurant entry
  const { data: supabaseResponse, error } = await supabase.from('restaurants').insert([
    {
      stripe_account_id: account.id, owner_id: session.user.id, name: business_name, demo: false
    }])

  // if error on insert, we remove the account from stripe
  if (error) {
    console.error('error', error)
    // remove account from stripe
    await stripe.accounts.del(account.id);
    return res.status(500).json({ error: error.message })
  }

  // get account link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'http://localhost:3000',
    return_url: 'http://localhost:3000',
    type: 'account_onboarding',
  });

  // return account link
  return res.json(accountLink);




  res.json(account);
}

export default handler;