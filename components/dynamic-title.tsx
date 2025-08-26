"use client"

import { useState, useEffect } from "react"

interface DynamicTitleProps {
  className?: string
}

export default function DynamicTitle({ className = "" }: DynamicTitleProps) {
  const [currentStyle, setCurrentStyle] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  const titleStyles = [
    // Style 1: 3D Anaglyph Effect (cyan/red offset)
    {
      className: `text-4xl sm:text-6xl md:text-8xl font-black text-white`,
      fontFamily: "font-sans",
      style: {
        textShadow: "-3px -3px 0px #00ffff, 3px 3px 0px #ff0080",
        filter: "contrast(1.2)",
      },
    },
    // Style 2: Clean Outlined/Stroke Effect
    {
      className: `text-4xl sm:text-6xl md:text-8xl font-black text-white`,
      fontFamily: "font-sans",
      style: {
        WebkitTextStroke: "2px #000000",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      },
    },
    // Style 3: Orange to Pink Gradient
    {
      className: `text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent`,
      fontFamily: "font-sans",
      style: {
        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
      },
    },
  ]

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

          // Wait 2 seconds before starting next cycle
          setTimeout(() => {
            setCurrentStyle((prev) => (prev + 1) % titleStyles.length)
            typewriterCycle()
          }, 2000)
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

  const currentTitleStyle = titleStyles[currentStyle]

  return (
    <>
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
      <h1 className={`${currentTitleStyle.fontFamily} ${className} relative`}>
        <span className={currentTitleStyle.className} style={currentTitleStyle.style}>
          {displayedText}
        </span>
        <span
          className={`${currentTitleStyle.className} inline-block ml-1`}
          style={{
            ...currentTitleStyle.style,
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
