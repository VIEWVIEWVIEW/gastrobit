import { z } from 'zod';
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Gericht = {
  id: string | number;
  name: string;
  variante: string;
  preis: number;
  extras: {
    name: string;
    typ: "oneOf" | "manyOf";
    items: {
      name: string;
      preis: number;
    }[];
  }[];
}

export const gerichtSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  variante: z.string(),
  preis: z.number(),
  extras: z.array(
    z.object({
      name: z.string(),
      typ: z.union([z.literal("oneOf"), z.literal("manyOf")]),
      items: z.array(
        z.object({
          name: z.string(),
          preis: z.number()
        })
      )
    })
  )
})

export const gerichteSchema = z.array(gerichtSchema)



interface CartState {
  gerichte: Gericht[];
  addGericht: (gericht: Gericht) => void;
  popIndex: (index: number) => void;
}

const useCart = create<CartState>()(
  persist(
    (set) => ({
      gerichte: [],
      addGericht: gericht => set(oldState => ({ gerichte: [...oldState.gerichte, gericht] })),
      popIndex: index => set(oldState => ({ gerichte: oldState.gerichte.filter((_, i) => i !== index) }))
    }),
    {
      name: 'cart', // unique name
    }
  )
)

export default useCart