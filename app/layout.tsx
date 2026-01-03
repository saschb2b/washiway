import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "Washiway",
  description: "Find your flow. A cozy 60-second math sprint.",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
