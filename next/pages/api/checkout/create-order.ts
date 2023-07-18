import { Karte } from "@/types/schema";
import { Database } from "@/types/supabase";

import { Coordinate } from "@freenow/react-polygon-editor/src/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs/dist";
import { NextApiHandler } from "next";
import * as Nominatim from "nominatim-client";

import { stripe } from "@/stripe";
import { Gericht } from "@/components/restaurant/cartContext";
import { z } from "zod";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

// Cart schema
/**
// this is how a cart looks like. The schema further below checks for the generic structure
const example = [
  {
    "id": "6a88261c-4fff-4275-91d4-1b0cc108c6bb",
    "name": "Cheeseburger",
    "variante": "standard",
    "preis": 7.5,
    "extras": {
      "Ihre Burgersoße": "Ketchup"
    }
  },
  {
    "id": 3,
    "name": "Gemischter Salat",
    "variante": "standard",
    "preis": 7.5,
    "extras": {
      "Ihr Dressing": "French Dressing"
    }
  },
  {
    "id": "a237e9fe-2f2d-4ede-8fa7-39dd58aabfbd",
    "name": "Eisbergsalat",
    "variante": "standard",
    "preis": 7.5,
    "extras": {}
  },
  {
    "id": "lol",
    "name": "Pizza Prosciutto ",
    "variante": "groß (30cm)",
    "preis": 11,
    "extras": {
      "Ihre Pizzasoße": "Hollondaise",
      "Ihre Pizzaaextras": [
        1,
        3
      ]
    }
  }
]
*/

export const cartSchema = z.array(z.object({
  id: z.number().or(z.string()),
  name: z.string(),
  variante: z.string(),
  preis: z.number(),
  extras:
    z.union(
      [z.record(
        z.string(),
        z.union([z.string(), z.array(z.number())])
      ),
      z.string()])
      .optional()
}))


// Adapted from https://wrfranklin.org/Research/Short_Notes/pnpoly.html & @freenow/react-polygon-editor 
const isCoordinateInPolygon = (coordinate: Coordinate, polygon: Coordinate[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const intersect =
      polygon[i].longitude > coordinate.longitude !== polygon[j].longitude > coordinate.longitude &&
      coordinate.latitude <
      ((polygon[j].latitude - polygon[i].latitude) * (coordinate.longitude - polygon[i].longitude)) /
      (polygon[j].longitude - polygon[i].longitude) +
      polygon[i].latitude;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

const client = Nominatim.createClient({
  useragent: "gastrobit.de-user",             // The name of your application
  referer: 'https://gastrobit.de',  // The referer link
});

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

  // get params for new express stripe acc
  const { restaurantId, address, karte, cart, host } = req.body;

  console.log("restaurantId", restaurantId)

  const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();

  const restaurantKarte = restaurant?.karte as Karte

  if (!restaurantKarte) {
    return res.status(400).json({
      error: 'Mit diesem Restaurant ist etwas falsch. Bitte kontaktieren Sie den Support'
    });
  }

  const polygon = restaurant?.delivery_area as Coordinate[]



  if (error || !restaurant || !restaurant.stripe_account_id) {
    return res.status(400).json({
      error: 'Bei diesem Restaurant wurde noch keine Auszahlungsmethode hinterlegt. Wenn Sie der Restaurantbesitzer sind, klicken Sie bitte einmalig auf "Umsätze" in ihrer Restaurantliste..'
    });
  }

  // check if karte is up to date
  if (!isKarteUpToDate(karte, restaurant.karte as Karte)) {
    return res.status(400).json({
      error: 'Die Karte wurde während des Bestellvorgangs vom Gastronomen geändert. Bitte aktualisiere die Seite und versuche es erneut.'
    });
  }

  try {

    cartSchema.parse(cart)
  } catch (error) {
    console.error(error)
    return res.status(400).json({
      error: 'Mit dem Warenkorb ist etwas falsch. Bitte leeren Sie den Warenkorb und laden Sie die Seite neu..'
    });
  }
  // at this point we can trust the cart

  // check if delivery area is set
  if (polygon.length < 3) {
    return res.status(400).json({
      error: 'Für dieses Restaurant wurde noch kein Liefergebiet festgelegt. Wenn Sie der Besitzer sind, legen Sie eines Fest unter gastrobit.de > Restauranteinstellungen > Liefergebiet festlegen.'
    });
  }

  // check if address is in delivery area
  const result = await client.search({
    q: `${address.strasse} ${address.plz} ${address.ort}`,
    addressdetails: 1,
  })


  if (result.length === 0) {
    console.error("No results found for address", address)
    return res.status(400).json({
      error: 'Adresse nicht gefunden'
    });
  }

  const point = {
    latitude: Number(result[0].lat),
    longitude: Number(result[0].lon)
  }

  const isInside = isCoordinateInPolygon(point, polygon)

  /**
   * Write an Postgresql RLS policy to only allow selects where auth.uid equals the owner_id of the restaurant 
   */

  if (!isInside) {
    return res.status(400).json({
      error: 'Adresse liegt nicht im Liefergebiet'
    });
  }

  // reassignment bc i i did some refactoring without thinking and am too lazy to clean up :))
  const gerichte = cart

  const lineItems = (gerichte: Gericht[]) => {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    gerichte.forEach(gericht => {
      lineItems.push({
        quantity: 1,
        price_data: {
          unit_amount: gericht.preis * 100,
          currency: 'eur',
          product_data: {
            name: gericht.name,
            description: `${gericht.variante} ${gericht.extras ? JSON.stringify(gericht.extras) : ""}`,
            metadata: {
              restaurantId: restaurant.id,
              variante: gericht.variante,
              extras: gericht.extras ? JSON.stringify(gericht.extras) : "keine extras",
            },
          },
        },
      })
    })
    return lineItems
  }



  // create destination charge for the connect account of the restaurant
  const paymentIntent = await stripe.checkout.sessions.create({
    currency: 'eur',
    line_items: lineItems(gerichte),
    payment_method_types: ['card', 'sofort', 'giropay', 'klarna'],
    mode: 'payment',
    success_url: `http://${host}/success?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: address.email,
    submit_type: 'pay',
  });

  const paymentIntentId = paymentIntent.id


  console.debug("paymentIntent", paymentIntent)

  // create order in supabase
  const { data: orderRes, error: orderError } = await supabase.from('orders').insert({
    order: cart,
    address: `${address.name}, ${address.strasse}, ${address.plz} ${address.ort} ${address.handy}`,
    email: address.email,
    restaurand_id: restaurant.id,
    checkout_link: paymentIntent.url,
    order_status: "pending",
    payment_status: "pending",
    id: paymentIntent.id,
  }).single()

  if (orderError) {
    console.error(error)
    return res.status(400).json({
      error: orderError.details
    });
  }

  return res.json({
    address: `${address.name}, ${address.strasse}, ${address.plz} ${address.ort} ${address.handy}`,
    email: address.email,
    restaurand_id: restaurant.id,
    checkout_link: paymentIntent.url,
    order_status: "pending",
    payment_status: "pending",
    id: paymentIntent.id,
  })
}

import { isEqual } from "lodash-es";
import Stripe from "stripe";

function isKarteUpToDate(uploadedKarte: Karte, restaurantKarte: Karte) {
  // exit guards
  if (!uploadedKarte || !restaurantKarte) {
    return false;
  }

  if (uploadedKarte.length !== restaurantKarte.length) {
    return false;
  }

  // deep equal from lodash
  return isEqual(uploadedKarte, restaurantKarte)
}




export default handler;