import { stripe } from "@/stripe";
import { Database } from "@/types/supabase";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { NextApiHandler } from "next";
import { NextResponse } from "next/server";

const handler: NextApiHandler = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method not allowed, use POST'
    });
  }

  // get supabase
  const supabase = createServerSupabaseClient<Database>({ req, res })

  return res.json({ received: true })
}

export default handler;