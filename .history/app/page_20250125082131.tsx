import Appbar from "./components/Appbar";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlayCircle, Plus, ThumbsUp, ThumbsDown} from "lucide-react"
import Link from "next/link"
import LandingFeaturePage from "@/app/components/LandingFeaturePage";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { signIn, signOut } from "next-auth/react";


export default async function Home() {
  const session = await getServerSession(authOptions);
   if (session?.user.id) redirect("/dashboard"); 
  

  return (
    <div>
      
        <div className="min-h-screen bg-gray-950 text-white">
         <Appbar/>
          <main className="container mx-auto px-4">
            <section className="py-20 md:py-32 flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
                Your Music, Your Crowd
              </h1>
              <p className="text-xl mb-12 max-w-2xl">
                Create, vote, and listen together. The ultimate group music experience.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={()=> signOut()}>
                Start Jamming Now
              </Button>
            </section>

            <section className="py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <LandingFeaturePage/>
                </div>
                <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Now Playing in &quot;Friday Night Vibes&quot;</h3>
                    <p className="text-gray-400">DJ Awesome - Groovy Nights</p>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Button variant="outline" size="icon" className="rounded-full mr-4">
                        <PlayCircle className="h-6 w-6" />
                      </Button>
                      <div className="text-sm">
                        <div className="font-medium">Next up:</div>
                        <div className="text-gray-400">User123 - Chill Waves</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-green-500">
                        <ThumbsUp className="h-5 w-5 mr-1" />
                        24
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <ThumbsDown className="h-5 w-5 mr-1" />
                        3
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-700 h-1 rounded-full mb-2">
                    <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>2:18</span>
                    <span>3:45</span>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="bg-gray-900 py-8 mt-20">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
              <div className="flex space-x-6 text-gray-400">
                <Link href="#" className="hover:text-white">About</Link>
                <Link href="#" className="hover:text-white">Support</Link>
                <Link href="#" className="hover:text-white">Terms</Link>
                <Link href="#" className="hover:text-white">Privacy</Link>
              </div>
            </div>
          </footer>
        </div>
        </div>
  );
}
