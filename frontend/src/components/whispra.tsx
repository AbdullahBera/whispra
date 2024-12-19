'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Mic, Send, Loader2, X, FileAudio, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

interface FileItem {
  file: File
  status: 'pending' | 'transcribing' | 'done'
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function Whispra() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [question, setQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, status: 'pending' as const }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTranscribe = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.findIndex(f => f === pendingFiles[i])
      setFiles(prev => prev.map((f, index) => 
        index === fileIndex ? { ...f, status: 'transcribing' } : f
      ))
      // Simulate transcription process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setFiles(prev => prev.map((f, index) => 
        index === fileIndex ? { ...f, status: 'done' } : f
      ))
    }
  }

  const handleSendMessage = () => {
    if (question.trim()) {
      setChatMessages(prev => [...prev, { role: 'user', content: question }])
      setQuestion('')
      // Simulate AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'This is a simulated AI response.' }])
      }, 1000)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Mic className="mr-2 h-8 w-8 text-blue-600" />
          Whispra
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* File Upload Section */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg shadow-blue-100/50 p-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileAudio className="mr-2 h-5 w-5 text-blue-600" />
            Audio Files
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="flex-1 rounded-xl"
                multiple
              />
              <Button
                onClick={handleTranscribe}
                disabled={!files.some(f => f.status === 'pending')}
                className="rounded-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Transcribe
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-20rem)] border rounded-md p-2">
              {files.map((file, index) => (
                <div key={index} className="mb-2 flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span className="truncate">{file.file.name}</span>
                  <div className="flex items-center">
                    {file.status === 'transcribing' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                    )}
                    {file.status === 'done' && (
                      <span className="mr-2 text-green-500">✓</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={file.status === 'transcribing'}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-grow bg-white rounded-xl shadow-lg shadow-blue-100/50 p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
            Chat
          </h2>
          <ScrollArea className="flex-grow mb-4 pr-4">
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <Separator className="my-4" />
          <div className="flex space-x-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!question.trim()} className="rounded-full">
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

