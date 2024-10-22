'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-8">
          Welcome to the Deepfake Detector
        </h1>
        
        <p className="text-xl mb-8">
          Detect deepfakes, reverse search images, and view detection statistics all in one place.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {/* <Button asChild>
            <Link href="/detect">Detect Deepfakes</Link>
          </Button> */}
          <Button asChild>
            <Link href="/reverse-search">Reverse Image Search</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full h-24 border-t border-gray-200 flex justify-center items-center">
        <p>© 2023 Deepfake Detector. All rights reserved.</p>
      </footer>
    </div>
  )
}