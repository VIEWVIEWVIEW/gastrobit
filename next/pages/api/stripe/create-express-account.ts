import { stripe } from "@/stripe";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async function (req, res) {
  const account = await stripe.accounts.create({
    type: 'express',
  });

  res.json(account);
}