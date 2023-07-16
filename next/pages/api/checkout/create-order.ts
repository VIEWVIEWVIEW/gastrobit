import { Karte } from "@/types/schema";
import { Database } from "@/types/supabase";

import { Coordinate } from "@freenow/react-polygon-editor/src/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs/dist";
import { NextApiHandler } from "next";
import * as Nominatim from "nominatim-client";

import { stripe } from "@/stripe";
import { Gericht } from "@/components/restaurant/cartContext";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

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
  const { restaurantId, address, karte, cart } = req.body;

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
      error: 'Mit diesem Restaurant ist etwas falsch. Bitte kontaktieren Sie den Support help@gastrobit.de mit einem Link zu diesem Restaurant.'
    });
  }

  // check if karte is up to date
  if (!isKarteUpToDate(karte, restaurant.karte as Karte)) {
    return res.status(400).json({
      error: 'Die Karte wurde während des Bestellvorgangs vom Gastronomen geändert. Bitte aktualisiere die Seite und versuche es erneut.'
    });
  }

  // at this point we can trust the cart

  // check if address is in delivery area
  const result = await client.search({
    q: `${address.strasse} ${address.plz} ${address.ort}`,
    addressdetails: 1,
  })


  if (result.length === 0) {
    console.error("No results found")
    return
  }

  const point = {
    latitude: Number(result[0].lat),
    longitude: Number(result[0].lon)
  }

  const isInside = isCoordinateInPolygon(point, polygon)

  if (!isInside) {
    return res.status(400).json({
      error: 'Adresse liegt nicht im Liefergebiet'
    });
  }

  // calculate total
  const exampleCart = {
    "cart": {
      "gerichte": [
        {
          "extras": {
            "Ihre Burgersoße": "Ketchup"
          },
          "id": "6a88261c-4fff-4275-91d4-1b0cc108c6bb",
          "name": "Cheeseburger",
          "preis": 7.5,
          "variante": "standard"
        },
        {
          "extras": {
            "Ihr Dressing": "French Dressing"
          },
          "id": 3,
          "name": "Gemischter Salat",
          "preis": 7.5,
          "variante": "standard"
        },
        {
          "extras": {},
          "id": "a237e9fe-2f2d-4ede-8fa7-39dd58aabfbd",
          "name": "Eisbergsalat",
          "preis": 7.5,
          "variante": "standard"
        },
        {
          "extras": {
            "Ihre Pizzaaextras": [
              1,
              3
            ],
            "Ihre Pizzasoße": "Hollondaise"
          },
          "id": "lol",
          "name": "Pizza Prosciutto ",
          "preis": 11,
          "variante": "groß (30cm)"
        }
      ]
    }
  }

  const { gerichte } = cart

  const calculateTotal = (gerichte: Gericht[]) => {
    let total = 0
    gerichte.forEach(gericht => {
      total += gericht.preis
      if (gericht.extras) {
        Object.values(gericht.extras).forEach(extra => {
          // find extra in restaurant.karte
          const extraInKarte = restaurantKarte.extras.find(extraInKarte => extraInKarte.id === extra)
        })



    // create destination charge for the connect account of the restaurant
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bestellung.total * 100,
      currency: 'eur',
      payment_method_types: ['card'],
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: restaurant.stripe_account_id,
      },
      metadata: {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        addressOfCustomer: `${address.strasse} ${address.plz} ${address.ort}`,
        bestellung: JSON.stringify(bestellung),
        karte: JSON.stringify(karte),
        email: address.email,
        phone: address.handy
      },
    });

    console.log("paymentIntent", paymentIntent)



    return res.json({
      order_id: 1337,
      isEqual: isKarteUpToDate(karte, restaurant.karte as Karte),
    })
  }

  import { isEqual } from "lodash";

  function isKarteUpToDate(uploadedKarte: Karte, restaurantKarte: Karte) {
    // exit guards
    if (!uploadedKarte || !restaurantKarte) {
      return false;
    }

    if (uploadedKarte.length !== restaurantKarte.length) {
      return false;
    }



    // compare if uploadedKarte and resutaurantKarte and all their nested child objects and arrays and so on are equal
    return isEqual(uploadedKarte, restaurantKarte)
  }




  export default handler;