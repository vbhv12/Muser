"use client";
import { Toaster } from '@/components/ui/toaster';
import {SessionProvider} from 'next-auth/react'

const Providers = ({children} : {
    children: React.ReactNode
}) => {
  return (
    <SessionProvider>
      <Toaster />
        {children}
    </SessionProvider>
  )
}

export default Providers