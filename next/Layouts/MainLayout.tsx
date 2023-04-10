import { Footer } from '@/components/home/footer'
import { Navbar } from '@/components/home/navbar'
import React from 'react'

function MainLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <div className='flex flex-col justify-between min-h-screen bg-sepia-300'>
        <div>
          <Navbar />
          {children}
        </div>
        
        <Footer />
      </div>
    </>
  )
}

export default MainLayout
