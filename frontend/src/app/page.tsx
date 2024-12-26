import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Mic } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Mic className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-semibold">Whispra</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel - Audio Files */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5" />
            <h2 className="font-medium">Audio Files</h2>
          </div>
          
          {/* File Upload Section */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              className="flex-1 bg-white"
            >
              Choose Files
              <span className="text-gray-500 ml-2">No file chosen</span>
            </Button>
            <Button 
              className="bg-gray-500 hover:bg-gray-600"
            >
              Transcribe
            </Button>
          </div>

          {/* Transcription Area */}
          <Card className="min-h-[600px] bg-white border border-gray-200 rounded-lg">
          </Card>
        </div>

        {/* Right Panel - Chat */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h2 className="font-medium">Chat</h2>
          </div>

          {/* Chat Area */}
          <Card className="min-h-[600px] bg-white border border-gray-200 rounded-lg mb-4">
          </Card>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea 
              placeholder="Type your message..." 
              className="flex-1 min-h-[44px] bg-white resize-none"
            />
            <Button 
              className="bg-gray-500 hover:bg-gray-600"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}