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
      <body className={`${inter.className} text-espresso antialiased bg-[#EDE8E1]`}>
        {/* Desktop: center app in a phone-width frame with shadow */}
        <div className="min-h-dvh w-full max-w-[430px] mx-auto bg-cream shadow-[0_0_60px_rgba(0,0,0,0.12)] relative">
          {children}
        </div>
      </body>
    </html>
  )
}
