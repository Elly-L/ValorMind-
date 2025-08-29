import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Dancing_Script, Kalam, Playfair_Display, Caveat, Crimson_Text } from "next/font/google"
import "./globals.css"

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
})

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-kalam",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
})

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
})

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-crimson-text",
})

export const metadata: Metadata = {
  title: "ValorMind AI - Your Mental Wellness Companion",
  description: "A safe space to understand your feelings and find your calm with AI-powered support.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${dancingScript.variable} ${kalam.variable} ${playfairDisplay.variable} ${caveat.variable} ${crimsonText.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-dancing-script: ${dancingScript.variable};
  --font-kalam: ${kalam.variable};
  --font-playfair-display: ${playfairDisplay.variable};
  --font-caveat: ${caveat.variable};
  --font-crimson-text: ${crimsonText.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
