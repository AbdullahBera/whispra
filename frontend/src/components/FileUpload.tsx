import { useState } from 'react'
import { Button } from "@/components/ui/button"

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="audio/*"
      />
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        {selectedFile ? selectedFile.name : 'Choose Files'}
      </Button>
      <Button disabled={!selectedFile}>
        Transcribe
      </Button>
    </div>
  )
}