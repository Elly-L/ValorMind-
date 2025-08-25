"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function ProgressWidget() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-0 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20" />

      <div className="relative p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">This Week's Journey</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Check-ins</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">5/7</span>
            </div>
            <Progress value={71} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Journal entries</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">3/7</span>
            </div>
            <Progress value={43} className="h-2" />
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              🔥 <span className="font-medium">3-day streak!</span> Keep it up!
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
