import { stripe } from "@/stripe";
import { Database } from "@/types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { NextApiHandler } from "next";
import { NextResponse } from "next/server";
import Cors from 'micro-cors';
import { buffer } from "node:stream/consumers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    // We need the raw buffer to be able to verify the signature later
    // so we initially have to disable parsing
    bodyParser: false,
  },
}

const handler: NextApiHandler = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method not allowed, use POST'
    });
  }

  // Build buffer from request
  const buf = await buffer(req)

  const sig = req.headers['stripe-signature']!

  let event: Stripe.Event

  try {
    // Verify signature
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret)
  } catch (err: any) {
    // Webhook signature verification failed.
    // Log it to console and return it to stripe API
    console.log(`❌ Error message: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // get supabase
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)


  // handle evnets
  switch (event.type) {
    case 'checkout.session.completed':
      console.log("checkout.session.completed", event)
      // @ts-expect-error
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id)

      // @ts-expect-error
      console.log("updating", event.data.object.id)

      const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        // @ts-ignore
        .eq('id', event.data.object.id)

      break;
    // ... handle other event types
    default:
    // console.log(`Unhandled event type ${event.type}, ${event}`);
  }

  return res.json({ received: true })
}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

export default cors(handler as any);