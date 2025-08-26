"use client"

import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

interface ModeCardProps {
  title: string
  description: string
  icon: ReactNode
  isPremium?: boolean
  onClick?: () => void
  isLoading?: boolean
}

export function ModeCard({ title, description, icon, isPremium, onClick, isLoading }: ModeCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 ${
        isLoading ? "opacity-75 pointer-events-none" : ""
      }`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20" />

      {isLoading && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      <div className="relative p-6">
        {isPremium && (
          <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            PREMIUM
          </div>
        )}

        <div className="flex items-start gap-4">
          {icon}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
