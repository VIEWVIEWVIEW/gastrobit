// write a new react hook which provides the cart context.
// The card will be stored in the local storage.
// The card contains Items

import { createContext, useContext, useEffect, useState } from 'react'


const readInitialStateFromLocalStorage = () => {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem('cart') || '[]'
  return JSON.parse(data)
}

const CartContext = createContext(readInitialStateFromLocalStorage())



export const CartProvider = ({ children }: { children: JSX.Element }) => {
  const [cart, setCart] = useState(readInitialStateFromLocalStorage())

  useEffect(() => {
    const data = readInitialStateFromLocalStorage()
    setCart(data)
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)