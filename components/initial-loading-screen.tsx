"use client"

import { useState, useEffect } from "react"

export default function InitialLoadingScreen() {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const fullText = "ValorMind AI"

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        // Reset and start over
        currentIndex = 0
        setDisplayText("")
      }
    }, 150)

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => {
      clearInterval(typingInterval)
      clearInterval(cursorInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <div className="mb-8">
          {/* Logo placeholder - you can replace with actual logo */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Typing text */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {displayText}
            </span>
            <span
              className={`inline-block w-1 h-12 md:h-16 ml-2 bg-gradient-to-b from-purple-600 to-indigo-600 transition-opacity duration-100 ${
                showCursor ? "opacity-100" : "opacity-0"
              }`}
            />
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
            Preparing your mental wellness companion...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
