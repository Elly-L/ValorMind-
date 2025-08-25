"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface QuoteCardProps {
  quote: string
  author: string
  userMood?: string
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

  useEffect(() => {
    setGreeting(generateGreeting(userMood))
  }, [userMood])

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-0 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20" />
      <div className="relative p-8 text-center">
        <blockquote className="text-xl font-medium text-gray-700 dark:text-gray-200 italic mb-4">"{quote}"</blockquote>
        <cite className="text-gray-500 dark:text-gray-400 text-sm">- {author}</cite>
      </div>
    </Card>
  )
}
