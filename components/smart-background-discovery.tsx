"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SmartBackgroundDiscoveryProps {
  messageCount: number
  onThemeButtonClick: () => void
  isThemeMenuOpen: boolean
}

export default function SmartBackgroundDiscovery({
  messageCount,
  onThemeButtonClick,
  isThemeMenuOpen,
}: SmartBackgroundDiscoveryProps) {
  const [showHint, setShowHint] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // Show hint after user sends 3-5 messages
  useEffect(() => {
    const hasSeenHint = localStorage.getItem("valormind-background-hint-seen")

    if (!hasSeenHint && messageCount >= 3 && messageCount <= 5 && !hasInteracted) {
      const timer = setTimeout(() => {
        setShowHint(true)
      }, 2000) // Show after 2 seconds of the 3rd message

      return () => clearTimeout(timer)
    }
  }, [messageCount, hasInteracted])

  // Hide hint when theme menu opens
  useEffect(() => {
    if (isThemeMenuOpen) {
      setShowHint(false)
      setHasInteracted(true)
      localStorage.setItem("valormind-background-hint-seen", "true")
    }
  }, [isThemeMenuOpen])

  const handleHintClick = () => {
    setShowHint(false)
    setHasInteracted(true)
    localStorage.setItem("valormind-background-hint-seen", "true")
    onThemeButtonClick()
  }

  const backgroundPreviews = [
    { name: "Sunset", gradient: "from-orange-400 to-pink-500" },
    { name: "Ocean", gradient: "from-blue-400 to-cyan-500" },
    { name: "Forest", gradient: "from-green-400 to-emerald-500" },
    { name: "Lavender", gradient: "from-purple-400 to-indigo-500" },
  ]

  return (
    <>
      {/* Smart Contextual Hint */}
      {showHint && (
        <div className="fixed top-20 right-4 z-40 animate-in slide-in-from-right-5 duration-500">
          <div className="bg-white/90 backdrop-blur-md rounded-xl border border-white/30 p-4 shadow-lg max-w-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 mb-1">Make it yours!</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Personalize your chat with beautiful backgrounds and themes
                </p>
                <Button
                  onClick={handleHintClick}
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs px-3 py-1 h-7"
                >
                  Explore themes
                </Button>
              </div>
            </div>
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white/90 border-l border-t border-white/30 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Hover Preview System */}
      <div
        className="relative"
        onMouseEnter={() => !isThemeMenuOpen && setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        {showPreview && !isThemeMenuOpen && (
          <div className="absolute -top-2 right-0 transform -translate-y-full z-30 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="bg-white/90 backdrop-blur-md rounded-lg border border-white/30 p-3 shadow-lg">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick preview</p>
              <div className="grid grid-cols-2 gap-2">
                {backgroundPreviews.map((bg, index) => (
                  <div
                    key={bg.name}
                    className={`w-12 h-8 rounded bg-gradient-to-r ${bg.gradient} border border-white/50 cursor-pointer hover:scale-105 transition-transform`}
                    title={bg.name}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Click palette to customize</p>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/90 border-r border-b border-white/30 rotate-45 -mt-1.5"></div>
          </div>
        )}
      </div>
    </>
  )
}
