"use client";
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

const StartJammingButton = () => {
    {<Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={()=> signOut()}>
                Start Jamming Now
              </Button>}
}

export default StartJammingButton