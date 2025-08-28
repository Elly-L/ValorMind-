"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Image from "next/image"

interface QuoteCardProps {
  quote?: string
  author?: string
  userMood?: string
}

const motivationalQuotes = [
  {
    text: "sometimes peace is a place.",
    author: "ValorMind AI",
  },
  {
    text: "Aligned. Grounded. Graced. That's how I'm moving this week.",
    author: "ValorMind AI",
  },
  {
    text: "Same tree, different season. Remember, everything is temporary.",
    author: "ValorMind AI",
  },
  {
    text: "New month, new mercy. I enter gently — open, hopeful, and ready.",
    author: "ValorMind AI",
  },
  {
    text: "Small wins, steady growth, God guide my steps, in a world that rarely pauses.",
    author: "ValorMind AI",
  },
  {
    text: "Steady heart. Clear mind. I lack nothing. I carry peace.",
    author: "ValorMind AI",
  },
  {
    text: "My joy is not for negotiation. It's factory sealed — direct from heaven.",
    author: "ValorMind AI",
  },
]

const zenStonesBackground = {
  src: "/images/zen-stones-background.png",
  name: "Zen Stones",
  textColor: "white" as const,
}

function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
}

function getRandomBackground() {
  return zenStonesBackground
}

function generateGreeting(mood?: string): string {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  const greetings = {
    morning: {
      happy: ["Good morning, sunshine! ✨", "Rise and shine, beautiful soul!", "Morning vibes are looking bright!"],
      sad: [
        "Good morning, take it one step at a time",
        "Morning hugs coming your way",
        "A new day, a fresh start awaits",
      ],
      anxious: ["Good morning, you've got this", "Breathe easy this morning", "Morning calm is here for you"],
      excited: [
        "Good morning, ready to conquer the day!",
        "Morning energy is infectious!",
        "Let's make this morning amazing!",
      ],
      tired: ["Good morning, rest when you need to", "Gentle morning vibes for you", "Take your time this morning"],
      confused: [
        "Good morning, clarity will come",
        "Morning thoughts sorting themselves out",
        "One step at a time this morning",
      ],
      angry: [
        "Good morning, let's find some peace",
        "Morning reset coming your way",
        "Fresh morning, fresh perspective",
      ],
      calm: ["Good morning, peaceful soul", "Serene morning vibes", "Morning tranquility surrounds you"],
      default: ["Good morning, welcome to ValorMind", "Morning check-in time", "Ready for a mindful morning?"],
    },
    afternoon: {
      happy: ["Good afternoon, keep that smile going!", "Afternoon joy is contagious!", "Midday brightness suits you!"],
      sad: ["Good afternoon, you're doing great", "Afternoon comfort is here", "Gentle afternoon thoughts for you"],
      anxious: ["Good afternoon, breathe and center", "Midday calm is possible", "Afternoon peace is within reach"],
      excited: ["Good afternoon, energy is high!", "Afternoon adventures await!", "Midday momentum building!"],
      tired: ["Good afternoon, rest is okay", "Midday recharge time", "Afternoon gentleness for you"],
      confused: ["Good afternoon, answers will come", "Midday clarity approaching", "Afternoon understanding awaits"],
      angry: ["Good afternoon, let's find balance", "Midday reset opportunity", "Afternoon peace is possible"],
      calm: ["Good afternoon, steady and serene", "Midday tranquility flows", "Afternoon peace continues"],
      default: ["Good afternoon, welcome to ValorMind", "Midday check-in time", "How's your afternoon going?"],
    },
    evening: {
      happy: ["Good evening, what a wonderful day!", "Evening joy wraps around you", "Sunset smiles are the best!"],
      sad: ["Good evening, tomorrow brings hope", "Evening comfort surrounds you", "Gentle evening thoughts"],
      anxious: ["Good evening, time to unwind", "Evening calm is settling in", "Peaceful evening ahead"],
      excited: ["Good evening, what an energetic day!", "Evening adventures continue!", "Sunset excitement glows!"],
      tired: ["Good evening, rest is well-deserved", "Evening wind-down time", "Gentle evening for tired souls"],
      confused: ["Good evening, sleep brings clarity", "Evening thoughts settling down", "Tomorrow's answers await"],
      angry: ["Good evening, let the day go", "Evening release and renewal", "Peaceful evening transition"],
      calm: ["Good evening, serene and steady", "Evening tranquility deepens", "Peaceful sunset vibes"],
      default: ["Good evening, welcome to ValorMind", "Evening reflection time", "How was your day?"],
    },
  }

  const moodKey = (mood?.toLowerCase() as keyof typeof greetings.morning) || "default"
  const timeGreetings = greetings[timeOfDay]
  const moodGreetings = timeGreetings[moodKey] || timeGreetings.default

  return moodGreetings[Math.floor(Math.random() * moodGreetings.length)]
}

export function QuoteCard({ quote, author, userMood }: QuoteCardProps) {
  const [greeting, setGreeting] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(getRandomQuote())

  useEffect(() => {
    setGreeting(generateGreeting(userMood))
    if (!quote) {
      setCurrentQuote(getRandomQuote())
    }
  }, [userMood, quote])

  const displayQuote = quote || currentQuote.text
  const displayAuthor = author || currentQuote.author

  return (
    <>
      <Card
        className="relative overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <div className="absolute inset-0">
          <Image
            src={zenStonesBackground.src || "/placeholder.svg"}
            alt={zenStonesBackground.name}
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20"></div>

        <div className="relative p-8 text-center z-10">
          <div className="mb-4">
            <p className="text-lg font-medium mb-2 text-white drop-shadow-lg">{greeting}</p>
          </div>
          <blockquote className="text-xl font-medium italic mb-4 text-white drop-shadow-lg">
            "{displayQuote}"
          </blockquote>
          <cite className="text-sm text-gray-200 drop-shadow-lg">- {displayAuthor}</cite>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Download Motivational Quotes</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {motivationalQuotes.map((item, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={item.src || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <button
                      onClick={() => console.log("Download functionality not implemented")}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium rounded-lg"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
