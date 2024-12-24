'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface FileItem {
  file: File
  status: 'pending' | 'transcribing' | 'done' | 'error'
  transcript?: string
  error?: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'error'
  content: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Whispra() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [question, setQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg)$/i)
      )
      
      if (validFiles.length === 0) {
        toast.error('Please upload valid audio files')
        return
      }

      const newFiles = validFiles.map(file => ({
        file,
        status: 'pending' as const
      }))
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
      
      try {
        const formData = new FormData()
        formData.append('file', pendingFiles[i].file)
        
        const response = await fetch(`${API_URL}/transcribe`, {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(await response.text())
        }
        
        const data = await response.json()
        
        setFiles(prev => prev.map((f, index) => 
          index === fileIndex ? { 
            ...f, 
            status: 'done',
            transcript: data.transcript 
          } : f
        ))

        toast.success(`Transcribed ${pendingFiles[i].file.name}`)
      } catch (error) {
        console.error('Transcription error:', error)
        toast.error(`Error transcribing ${pendingFiles[i].file.name}`)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    const currentQuestion = question.trim()
    
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      content: currentQuestion 
    }])
    
    setQuestion('')

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer
      }])
    } catch (error) {
      console.error('Error:', error)
      setChatMessages(prev => [...prev, {
        role: 'error',
        content: error instanceof Error ? error.message : 'An error occurred'
      }])
      toast.error('Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium flex items-center gap-2">
          <span role="img" aria-label="microphone">🎤</span>
          Whispra
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Files Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span role="img" aria-label="audio" className="text-blue-600">🎵</span>
            <h2 className="text-base font-medium">Audio Files</h2>
          </div>

          <div className="flex gap-2">
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="flex-1 rounded-full border border-gray-200 bg-white"
              multiple
            />
            <Button 
              onClick={handleTranscribe}
              disabled={!files.some(f => f.status === 'pending')}
              variant="outline"
              className="rounded-full border-gray-200"
            >
              <span role="img" aria-label="transcribe">⬆️</span>
              <span className="ml-2">Transcribe</span>
            </Button>
          </div>

          <div className="bg-white rounded-lg p-4 min-h-[500px] border border-gray-100">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-2"
              >
                <span className="truncate text-sm">{file.file.name}</span>
                <div className="flex items-center gap-2">
                  {file.status === 'transcribing' && (
                    <span className="text-blue-600">Processing...</span>
                  )}
                  {file.status === 'done' && (
                    <span className="text-green-600">✓</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-red-600">⚠️</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    disabled={file.status === 'transcribing'}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span role="img" aria-label="chat" className="text-blue-600">💬</span>
            <h2 className="text-base font-medium">Chat</h2>
          </div>

          <div className="bg-white rounded-lg p-4 min-h-[500px] border border-gray-100 flex flex-col">
            <div className="flex-1 space-y-4 mb-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.role === 'error'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-50'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-full border-gray-200"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!question.trim() || isLoading}
                className="rounded-full"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}