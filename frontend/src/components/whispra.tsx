'use client'

import { useState } from 'react'
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

export default function Whispra() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [question, setQuestion] = useState('')
  const [activeTab, setActiveTab] = useState<'files' | 'chat'>('files')

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="flex items-center text-xl font-semibold">
            <Mic className="mr-2 h-6 w-6 text-blue-600" />
            Whispra
          </h1>
        </div>
        <div className="flex h-12 items-center space-x-1 border-b px-2">
          <Button
            variant={activeTab === 'files' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setActiveTab('files')}
          >
            <FileAudio className="mr-2 h-4 w-4" />
            Files
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-7rem)] p-4">
          {files.map((file, index) => (
            <div key={index} className="mb-2 flex items-center justify-between rounded-md border p-2 text-sm">
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
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="text-lg font-semibold">
            {activeTab === 'files' ? 'File Transcription' : 'Chat'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="flex-1"
                  multiple
                />
                <Button
                  onClick={handleTranscribe}
                  disabled={!files.some(f => f.status === 'pending')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Transcribe All
                </Button>
              </div>
              {/* Transcription results would be displayed here */}
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Chat messages would be displayed here */}
            </div>
          )}
        </div>
        <Separator />
        <div className="p-4">
          <div className="flex space-x-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={activeTab === 'files' ? "Ask about the transcriptions..." : "Type your message..."}
              className="flex-1"
            />
            <Button disabled={!question.trim() || files.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

