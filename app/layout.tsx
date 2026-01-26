import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: "Fish On! Competition",
  description: "Plateforme de compétition de pêche entre amis",
  keywords: ["pêche", "compétition", "brochet", "fishing", "competition"],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
