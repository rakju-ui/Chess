import type React from "react"
import type { Metadata } from "next"
import { Abril_Fatface, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-context"

const abrilFatface = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-abril",
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Chess Game",
  description: "A modern chess game with AI and online multiplayer",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${abrilFatface.variable}`}>
        <ThemeProvider>
          {children}
          <div className="fixed top-4 left-4 text-sm font-medium text-gray-500">V.R.S.</div>
          <div className="fixed top-4 right-4 text-sm font-medium text-gray-500">V.R.S.</div>
          <div className="fixed bottom-4 left-4 text-sm font-medium text-gray-500">V.R.S.</div>
          <div className="fixed bottom-4 right-4 text-sm font-medium text-gray-500">V.R.S.</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
