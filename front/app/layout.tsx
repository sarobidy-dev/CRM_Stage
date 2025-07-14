import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tableau de bord CRM',
  description: 'Tableau de bord CRM avec statistiques et graphiques dynamiques',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
