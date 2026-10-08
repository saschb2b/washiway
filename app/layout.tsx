import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { JetBrains_Mono, Nunito } from "next/font/google"
import "./globals.css"

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "Washiway",
  description: "Find your flow. A cozy 60-second math sprint.",
  applicationName: "Washiway",
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
