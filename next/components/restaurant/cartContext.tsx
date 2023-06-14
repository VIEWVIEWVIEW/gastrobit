import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Gericht = {
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