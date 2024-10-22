'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Page() {
  const [result, setResult] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    // This is where you'd normally send the file to your backend for processing
    // For now, we'll just simulate a response
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
    setResult(Math.random() > 0.5 ? 'Deepfake' : 'Real')
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deepfake Detector</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file">Upload Image, Video, or Audio</Label>
          <Input id="file" type="file" onChange={handleFileChange} accept="image/*,video/*,audio/*" />
        </div>
        <Button type="submit" disabled={!file}>Analyze</Button>
      </form>
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold">Result:</h2>
          <p className={result === 'Deepfake' ? 'text-red-500' : 'text-green-500'}>{result}</p>
        </div>
      )}
    </div>
  )
}