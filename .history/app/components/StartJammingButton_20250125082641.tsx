"use client";
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function StartJammingButton() {
  return (
    <Button 
      size="lg" 
      className="bg-primary hover:bg-primary/90 text-lg px-8 py-6" 
      onClick={() => signIn()}
    >
      Start Jamming Now
    </Button>
  )
}