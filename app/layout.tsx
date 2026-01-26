import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HubSpot Project Tracker',
  description: 'Track your project status in real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
