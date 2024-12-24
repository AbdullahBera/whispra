import { ToastProvider } from '@/components/providers/toast-provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Whispra',
  description: 'Audio transcription and Q&A app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
