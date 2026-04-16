import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'dish. — cook more, share more',
  description: 'Discover recipes, share your cooking, and let AI create meals from what you already have.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-cream text-espresso antialiased`}>
        {children}
      </body>
    </html>
  )
}
