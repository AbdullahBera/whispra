import '../styles/globals.css';

export const metadata = {
  title: 'Whispra',
  description: 'AI-powered audio transcription and Q&A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
