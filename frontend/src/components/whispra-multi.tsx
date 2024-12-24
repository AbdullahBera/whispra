'use client'

import { useState } from 'react'
import { Upload, Mic, Send, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface FileItem {
  file: File
  status: 'pending' | 'transcribing' | 'done' | 'error'
  transcript?: string
  error?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function WhispraMulti() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFiles(prev => prev.map((f, index) => 
          index === fileIndex ? { 
            ...f, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : f
        ))
        toast.error(`Error transcribing ${pendingFiles[i].file.name}`)
      }
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim() || files.length === 0) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      toast.success('Question answered successfully')
      setQuestion('')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to get answer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Mic className="h-6 w-6 text-primary" />
            Whispra Multi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Upload Audio Files</Label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  id="file-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  multiple
                />
              </div>
              <Button
                onClick={handleTranscribe}
                disabled={!files.some(f => f.status === 'pending')}
                className="min-w-[120px]"
              >
                {files.some(f => f.status === 'transcribing') ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Transcribe All
              </Button>
            </div>
            {files.length > 0 && (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">{file.file.name}</span>
                    <div className="flex items-center gap-2">
                      {file.status === 'transcribing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {file.status === 'done' && (
                        <span className="text-sm text-green-500">Done</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-sm text-red-500">Error</span>
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
            )}
          </div>

          {/* Question Section */}
          <div className="space-y-4">
            <Label htmlFor="question">Ask a Question</Label>
            <div className="flex gap-2">
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question about the transcriptions..."
                className="flex-1"
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={!question.trim() || files.length === 0 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Ask
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

