"use client"

import { useEffect, useState } from "react"

export default function LoadingSpinner() {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4)
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const getLetterAnimation = (index: number, letter: string) => {
    const baseDelay = index * 50
    const waveOffset = Math.sin((animationPhase + index) * 1.2) * 25 + Math.cos((animationPhase + index) * 0.8) * 10
    const scaleOffset =
      1 + Math.sin((animationPhase + index) * 0.9) * 0.25 + Math.cos((animationPhase + index) * 1.1) * 0.15
    const rotateOffset = Math.sin((animationPhase + index) * 0.7) * 8 + Math.cos((animationPhase + index) * 0.5) * 4
    const skewOffset = Math.sin((animationPhase + index) * 0.6) * 3

    return {
      transform: `translateY(${waveOffset}px) scale(${scaleOffset}) rotate(${rotateOffset}deg) skew(${skewOffset}deg)`,
      transition: `all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      animationDelay: `${baseDelay}ms`,
    }
  }

  const letters = "ValorMind AI".split("")

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="relative">
        <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
          {letters.map((letter, index) => (
            <span key={index} className="inline-block" style={getLetterAnimation(index, letter)}>
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </div>

        <div className="absolute inset-0 text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent opacity-30 blur-lg animate-pulse">
          ValorMind AI
        </div>
        <div className="absolute inset-0 text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent opacity-15 blur-2xl animate-pulse">
          ValorMind AI
        </div>
        <div className="absolute inset-0 text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent opacity-10 blur-3xl animate-pulse">
          ValorMind AI
        </div>
      </div>

      <div className="flex space-x-3 mt-8">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-4 h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full shadow-lg"
            style={{
              animation: `bounce 1s infinite`,
              animationDelay: `${index * 0.15}s`,
              transform: `scale(${1 + Math.sin(animationPhase * 1.5 + index * 1.2) * 0.3}) translateY(${Math.cos(animationPhase * 1.2 + index * 0.8) * 5}px)`,
              transition: "all 0.3s ease-out",
            }}
          />
        ))}
      </div>

      <p className="text-gray-600 mt-6 text-lg animate-pulse font-medium">Loading your therapeutic space...</p>
    </div>
  )
}
