"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useState } from "react"

export function DailyChallenge() {
  const [completed, setCompleted] = useState(false)

  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Daily Challenge</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Take 3 deep breaths 🌬️</p>
        </div>
        <Button
          onClick={() => setCompleted(!completed)}
          variant={completed ? "default" : "outline"}
          size="sm"
          className={completed ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {completed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Done!
            </>
          ) : (
            "Start"
          )}
        </Button>
      </div>
    </Card>
  )
}
