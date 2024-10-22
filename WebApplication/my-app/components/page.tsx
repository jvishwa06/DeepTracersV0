'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadIcon, AlertTriangle, Search, Info, Flag, MessageCircle, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function PageComponent() {
  const [searchResult, setSearchResult] = useState<Array<{ 
    id: number, 
    platform: string, 
    url: string, 
    imageUrl: string, 
  }> | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportedIds, setReportedIds] = useState<number[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [isDeepfakeDetected, setIsDeepfakeDetected] = useState<boolean | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot', content: string }>>([])
  const [userInput, setUserInput] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input && !image) return
    setIsLoading(true)

    const formData = new FormData();
    formData.append('image', image as Blob);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server responded with an error')
      }

      const data = await response.json();

      if (response.status === 200) {
        const reverseSearchResults = data.reverse_search_results.slice(0, 5); // Get top 5 results
        
        // Map reverse search results into the table format
        const searchResults = reverseSearchResults.map((result: any, index: number) => ({
          id: index + 1,
          platform: result.title, // Use title as platform
          url: result.site, // Use site as URL
          imageUrl: result.image, // Use image URL
        }))

        setSearchResult(searchResults)
        setIsDeepfakeDetected(data.prediction === 'fake') // Set whether it's a deepfake

        if (data.prediction === 'fake') {
          toast.error(`Deepfake detected!`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        } else {
          toast.success('No deepfake detected.', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setIsLoading(false)
  }

  const handleReport = (id: number) => {
    setReportedIds(prev => [...prev, id])
    toast.success(`Result ${id} has been reported and removed.`)
  }

  const handleReportAll = () => {
    if (searchResult) {
      const unreportedIds = searchResult.filter(result => !reportedIds.includes(result.id)).map(result => result.id)
      setReportedIds(prev => [...prev, ...unreportedIds])
      toast.success(`All ${unreportedIds.length} remaining results have been reported and removed.`)
    }
  }

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userInput.trim()) return

    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', content: userInput }])

    // Simple bot response logic
    let botResponse = "I'm sorry, I don't have an answer for that. Can you try rephrasing your question?"

    if (userInput.toLowerCase().includes('deepfake')) {
      botResponse = "Deepfakes are synthetic media in which a person in an existing image or video is replaced with someone else's likeness. Our DeepFake Detective tool can help identify potential deepfakes by analyzing images and performing reverse image searches."
    } else if (userInput.toLowerCase().includes('how to use')) {
      botResponse = "To use the DeepFake Detective, simply upload an image or provide an image URL in the input field. Then click 'Search' to analyze the image and perform a reverse image search. The results will show potential matches and whether a deepfake was detected."
    } else if (userInput.toLowerCase().includes('report')) {
      botResponse = "You can report suspicious results by clicking the 'Report' button next to each result. If you want to report all results at once, use the 'Report All' button at the top of the results table."
    }

    // Add bot response to chat
    setTimeout(() => {
      setChatMessages(prev => [...prev, { type: 'bot', content: botResponse }])
    }, 500)

    setUserInput('')
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-4xl font-bold mb-8 text-center">DeepFake Detective</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Deepfake detector with Reverse Image Search</CardTitle>
            <CardDescription>
              Uncover the truth behind images with our advanced deepfake detection model & reverse search technology.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Image URL</Label>
                <Input 
                  id="input" 
                  type="text" 
                  placeholder="Enter image URL" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">Or upload an image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImage(file);
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setInput(event.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" /> Upload Image
                  </Button>
                  {input && <span className="text-sm text-gray-500">Image selected</span>}
                </div>
              </div>
              <Button type="submit" disabled={!input && !image || isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Use Reverse Image Search?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Search className="mr-2 h-5 w-5 text-blue-500" />
                <span>Find the original source of an image</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                <span>Identify potential deepfakes or manipulated images</span>
              </li>
              <li className="flex items-start">
                <Info className="mr-2 h-5 w-5 text-green-500" />
                <span>Discover similar images or variations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {isDeepfakeDetected !== null && (
        <Alert className={`mt-8 ${isDeepfakeDetected ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isDeepfakeDetected ? 'Deepfake Detected' : 'No Deepfake Detected'}</AlertTitle>
          <AlertDescription>
            {isDeepfakeDetected
              ? `Our analysis suggests that this image may be a deepfake. Please review the results carefully and consider reporting suspicious content.`
              : 'Our analysis suggests that this image is likely not a deepfake. However, always exercise caution and critical thinking when evaluating online content.'}
          </AlertDescription>
        </Alert>
      )}

      {searchResult && searchResult.length > reportedIds.length && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              We've found {searchResult.length - reportedIds.length} potential matches. Review them carefully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button variant="destructive" onClick={handleReportAll}>
                <Flag className="mr-2 h-4 w-4" /> Report All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Site URL</TableHead>
                  <TableHead>Image URL</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResult.filter(result => !reportedIds.includes(result.id)).map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.platform}</TableCell>
                    <TableCell>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {result.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {result.imageUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleReport(result.id)}>
                        Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="about" className="mt-8">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="howto">How It Works</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About DeepFake Detective</CardTitle>
            </CardHeader>
            <CardContent>
              <p>DeepFake Detective is a cutting-edge tool designed to help you identify potential deepfakes and manipulated images. Our advanced algorithms search across multiple platforms to find similar images and analyze their authenticity.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="howto">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>Upload an image or provide a URL</li>
                <li>Our system analyzes the image and searches across multiple platforms</li>
                <li>We present you with potential matches and their similarity scores</li>
                <li>Review the results to determine if the image might be manipulated</li>
                <li>Report any suspicious or problematic results individually or all at once</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Q: How accurate is the similarity score?</h3>
                  <p>A: While our similarity scores are highly accurate, they should be used as a guide. Always review the results carefully.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Q: What happens when I report an image?</h3>
                  <p>A: Reported images are reviewed by our team and may be removed from our database if found to violate our policies.</p>
                </div>
                <div>
                  <h3 className="font-semibold">Q: Can I report multiple results at once?</h3>
                  <p>A: Yes, you can use the "Report All" button to report all remaining results simultaneously.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Disclaimer</AlertTitle>
        <AlertDescription>
          While our tool is highly effective, it's not infallible. Always use critical thinking and multiple sources to verify the authenticity of an image.
        </AlertDescription>
      </Alert>

      {/* Chatbot Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full p-4"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chatbot Interface */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">DeepFake Detective Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  )
}