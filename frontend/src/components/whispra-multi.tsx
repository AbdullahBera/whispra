'use client'

import { useState } from 'react'
import { Upload, Mic, Send, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FileItem {
  file: File
  status: 'pending' | 'transcribing' | 'done'
}

export default function WhispraMulti() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [question, setQuestion] = useState('')

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
                <Upload className="mr-2 h-4 w-4" />
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
              <Button disabled={!question.trim() || files.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                Ask
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

