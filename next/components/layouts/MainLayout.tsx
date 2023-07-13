import { Footer } from '@/components/home/footer'
import { Navbar } from '@/components/home/navbar'
import React from 'react'

import { Toaster } from 'react-hot-toast'
function MainLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <div><Toaster /></div>
      <div className='flex flex-col justify-between min-h-screen bg-sepia-300'>
        <div className='flex flex-col grow'>
          <Navbar />
          {children}
        </div>

        <Footer />
      </div>
    </>
  )
}

export default MainLayout
