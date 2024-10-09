"use client";
import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlayCircle, Users, Music, Plus, ThumbsUp, ThumbsDown, Headphones, Radio } from "lucide-react"
import Link from "next/link"

const Appbar = () => {
    const session = useSession();
    return (
        <div className='flex justify-between'>
             <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    MUSER
                </Link>
                {session.data?.user && 
                    <Button className = "bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={()=> signOut()}>Sign Out</Button>
                }
               {!session.data?.user && 
                    <Button className = "bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={()=> signIn()}>Sign In</Button>
                }
            </header>
        </div>

  )
}

export default Appbar