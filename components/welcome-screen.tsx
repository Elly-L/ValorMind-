"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RotateCcw } from "lucide-react"
import type { AIMode } from "../lib/ai-personality"

interface WelcomeScreenProps {
  mode: AIMode
  onStartConversation: (prompt: string) => void
  userGender?: string
  userName?: string
}

export default function WelcomeScreen({ mode, onStartConversation, userGender, userName }: WelcomeScreenProps) {
  const [currentBackground, setCurrentBackground] = useState("")
  const [currentFont, setCurrentFont] = useState("")
  const [availableBackgrounds, setAvailableBackgrounds] = useState<string[]>([])
  const [backgroundIndex, setBackgroundIndex] = useState(0)

  const getAllBackgroundImages = () => [
    "/images/cute-foxes.png",
    "/images/lake-sunset.png",
    "/images/misty-lake.png",
    "/images/modern-workspace.png",
    "/images/mountain-sunset.webp",
    "/images/ocean-blue.png",
    "/images/purple-sunset.png",
    "/images/spa-setup.png",
    "/images/tropical-beach.jpeg",
    "/images/water-droplet.png",
    "/images/zen-bamboo-stones.png",
    "/images/zen-bamboo.png",
    "/images/zen-daisy.png",
    "/images/zen-stones.png",
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    const backgrounds = getBackgroundsByTime(hour, userGender)
    setAvailableBackgrounds(backgrounds)
    const randomIndex = Math.floor(Math.random() * backgrounds.length)
    setBackgroundIndex(randomIndex)
    setCurrentBackground(backgrounds[randomIndex])

    const fonts = ["font-serif", "font-sans"]
    setCurrentFont(fonts[Math.floor(Math.random() * fonts.length)])
  }, [userGender])

  const getBackgroundsByTime = (hour: number, gender?: string) => {
    const morningBgs = [
      "/images/water-droplet.png",
      "/images/misty-lake.png",
      "/images/zen-bamboo.png",
      "/images/zen-bamboo-stones.png",
      "/images/modern-workspace.png",
      "/images/zen-daisy.png",
    ]
    const dayBgs = [
      "/images/ocean-blue.png",
      "/images/lake-sunset.png",
      "/images/tropical-beach.jpeg",
      "/images/cute-foxes.png",
      "/images/zen-daisy.png",
      "/images/modern-workspace.png",
    ]
    const eveningBgs = [
      "/images/mountain-sunset.webp",
      "/images/purple-sunset.png",
      "/images/zen-daisy.png",
      "/images/lake-sunset.png",
      "/images/spa-setup.png",
    ]
    const nightBgs = [
      "/images/zen-stones.png",
      "/images/spa-setup.png",
      "/images/zen-bamboo-stones.png",
      "/images/zen-daisy.png",
      "/images/zen-bamboo.png",
      "/images/purple-sunset.png",
    ]

    // Time-based selection
    if (hour >= 5 && hour < 11) return morningBgs
    if (hour >= 11 && hour < 17) return dayBgs
    if (hour >= 17 && hour < 21) return eveningBgs
    return nightBgs
  }

  const flipBackground = () => {
    const allImages = getAllBackgroundImages()
    const nextIndex = (backgroundIndex + 1) % allImages.length
    setBackgroundIndex(nextIndex)
    setCurrentBackground(allImages[nextIndex])
    // Update available backgrounds to include all images for continuous shuffling
    setAvailableBackgrounds(allImages)
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    let greeting = ""

    if (hour >= 5 && hour < 12) greeting = "Good morning"
    else if (hour >= 12 && hour < 17) greeting = "Good afternoon"
    else if (hour >= 17 && hour < 22) greeting = "Good evening"
    else greeting = "Good night"

    const personalGreeting = userName ? `${greeting}, ${userName}!` : `${greeting}!`

    const messages = {
      friend: `${personalGreeting} Ready to chat with your AI bestie?`,
      therapist: `${personalGreeting} Welcome to your safe space for healing.`,
      vent: `${personalGreeting} This is your judgment-free zone.`,
      journal: `${personalGreeting} Let's capture your thoughts today.`,
      "avatar-therapy": `${personalGreeting} Your therapeutic journey begins here.`,
    }

    return messages[mode] || messages.friend
  }

  const getConversationStarters = () => {
    const starters = {
      friend: ["What's been on my mind lately?", "Tell me about my day", "How can I improve my mood?"],
      therapist: ["I'm feeling overwhelmed", "Help me process my emotions", "I want to work through my anxiety"],
      vent: [
        "I need to get this off my chest",
        "Everything feels too much right now",
        "I'm frustrated and need to talk",
      ],
      journal: ["What am I grateful for today?", "How do I feel right now?", "What did I learn today?"],
      "avatar-therapy": ["I want to explore my feelings", "Help me understand my patterns", "What triggers my stress?"],
    }

    return starters[mode] || starters.friend
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      <div className="relative z-10 p-4 md:p-6 flex justify-between items-start">
        <Button
          onClick={() => {
            window.location.href = "/"
          }}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-full p-2 md:p-3"
          variant="ghost"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <Button
          onClick={flipBackground}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-full p-2 md:p-3 hover:scale-110 transition-all duration-300"
          variant="ghost"
          size="sm"
          title="Shuffle background image"
        >
          <RotateCcw className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6">
        {/* Brand */}
        <div className="text-center mb-8 md:mb-12">
          <h1
            className={`text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-2 md:mb-4 drop-shadow-2xl ${currentFont}`}
          >
            ValorMind AI
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg font-light px-4">
            {getWelcomeMessage()}
          </p>
        </div>

        <div className="w-full max-w-2xl mb-6 md:mb-8 px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1 shadow-2xl">
            <input
              type="text"
              placeholder="What's on your mind today?"
              className="w-full bg-transparent text-white placeholder-white/60 px-4 md:px-6 py-3 md:py-4 rounded-xl outline-none text-base md:text-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  onStartConversation(e.currentTarget.value.trim())
                }
              }}
            />
          </div>

          {/* Dive in button for quick chat access */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => onStartConversation("Let's start chatting!")}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 rounded-full px-6 py-2 transition-all duration-300 hover:scale-105"
              variant="ghost"
            >
              Dive in 🚀
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/80 text-center mb-3 md:mb-4 font-medium text-sm md:text-base">
            Or try one of these:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {getConversationStarters().map((prompt, index) => (
              <div
                key={index}
                onClick={() => onStartConversation(prompt)}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-2xl p-3 md:p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <span className="text-sm md:text-base font-medium">"{prompt}"</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
