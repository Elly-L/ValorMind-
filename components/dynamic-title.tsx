"use client"

import { useState, useEffect } from "react"

interface DynamicTitleProps {
  className?: string
}

export default function DynamicTitle({ className = "" }: DynamicTitleProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  const titleStyle = {
    className: `text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent`,
    fontFamily: "font-sans",
    style: {
      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
    },
  }

  const fullText = "ValorMind AI"

  useEffect(() => {
    const typewriterCycle = () => {
      setIsTyping(true)
      setDisplayedText("")

      // Type out each character
      let currentIndex = 0
      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setIsTyping(false)

          // Wait 3 seconds before restarting the same style
          setTimeout(() => {
            typewriterCycle()
          }, 3000)
        }
      }, 150) // 150ms between each character
    }

    typewriterCycle()
  }, [])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500) // Blink every 500ms

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <h1 className={`${titleStyle.fontFamily} ${className} relative`}>
        <span className={titleStyle.className} style={titleStyle.style}>
          {displayedText}
        </span>
        <span
          className={`${titleStyle.className} inline-block ml-1`}
          style={{
            ...titleStyle.style,
            opacity: showCursor ? 1 : 0,
            animation: isTyping ? "none" : "blink 1s infinite",
          }}
        >
          |
        </span>
      </h1>
    </>
  )
}
