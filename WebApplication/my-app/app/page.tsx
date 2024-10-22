import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 relative">
      
      {/* Logo Row in the center */}
      <div className="flex justify-center items-center space-x-8 mb-8">
        {/* First Logo */}
        <img 
          src="https://imgs.search.brave.com/tYiGV2g2aI4KwhnsLLXc-JhizqJvEuKIaM1r_lZ4XLE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2U0LzBj/LzNiL2U0MGMzYmFk/YjE3OGFiYzllODBl/ZmM2Njg1N2U1OTdl/LmpwZw" 
          alt="DeepTracer Logo" 
          className="h-16 w-auto"  // Size for the first logo
        />
        
        {/* Second Logo */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Territorial_Army_Crest.svg/330px-Territorial_Army_Crest.svg.png" 
          alt="Territorial Army Crest" 
          className="h-16 w-auto"  // Size for the second logo
        />
        
        {/* Third Logo */}
        <img 
          src="https://imgs.search.brave.com/BmSZbQP1jUVzhj6sT0kJvSreAZkZU0CLVUMDYnI0NvM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly8xMDAw/bG9nb3MubmV0L3dw/LWNvbnRlbnQvdXBs/b2Fkcy8yMDIzLzAy/L0luZGlhbi1Bcm15/LUxvZ28tNTAweDI4/MS5wbmc" 
          alt="Indian Army Logo" 
          className="h-16 w-auto"  // Size for the third logo
        />
      </div>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-8">
          Welcome to the DeepTracerV0
        </h1>
        
        <p className="text-xl mb-8">
          Detect deepfakes, reverse search images, and view detection statistics all in one place.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/reverse-search">Detection with RIS</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full h-24 border-t border-gray-200 flex justify-center items-center">
        <p>© 2024 DeepTracer. All rights reserved.</p>
      </footer>
    </div>
  )
}
