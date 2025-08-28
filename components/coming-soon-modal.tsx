"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function ComingSoonModal({ isOpen, onClose, feature = "This feature" }: ComingSoonModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <Card className="bg-white dark:bg-gray-800 p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {feature} is currently in development. Stay tuned for updates!
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
