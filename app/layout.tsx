import type { Metadata, Viewport } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'
import { PwaRegister } from '@/components/pwa/PwaRegister'
import { Analytics } from '@vercel/analytics/next'

// Serif editorial para titulares — registro revista, no app genérica
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Real Travel',
  description: 'Descubre destinos a través de historias locales',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Real Travel',
  },
}

export const viewport: Viewport = {
  themeColor: '#C41230',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${dmSans.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${fraunces.variable} ${dmSans.variable}`}>
        <PwaRegister />
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
