"use client"

import { Card } from "@/components/ui/card"

const recentMoods = [
  { emoji: "😊", day: "Mon" },
  { emoji: "😔", day: "Tue" },
  { emoji: "😡", day: "Wed" },
  { emoji: "😴", day: "Thu" },
  { emoji: "🥺", day: "Fri" },
  { emoji: "🤩", day: "Sat" },
  { emoji: "😌", day: "Sun" },
]

export function MoodTrackerPreview() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-0 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20" />

      <div className="relative p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Week in Moods</h3>
        <div className="flex justify-between items-center">
          {recentMoods.map((mood, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{mood.day}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">You've been feeling mostly positive this week! 🌟</p>
        </div>
      </div>
    </Card>
  )
}
