import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Using distinctive fonts per design skill guidance
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Verify — Plagiarism & AI Content Detection',
  description: 'Detect plagiarism and AI-generated content with precision. Upload files or paste text to get instant analysis with source attribution.',
  keywords: ['plagiarism detection', 'AI content detection', 'text analysis', 'academic integrity'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-ink-950 text-ink-100 antialiased">
        {children}
      </body>
    </html>
  );
}
