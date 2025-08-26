"use client"

import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"
import Image from "next/image"

interface ModeCardProps {
  title: string
  description: string
  icon: ReactNode
  isPremium?: boolean
  onClick?: () => void
  isLoading?: boolean
  image?: string
}

export function ModeCard({ title, description, icon, isPremium, onClick, isLoading, image }: ModeCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 p-0 ${
        isLoading ? "opacity-75 pointer-events-none" : ""
      }`}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {image && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover object-center transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {isPremium && (
            <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
              PREMIUM
            </div>
          )}
        </div>
      )}

      <div className="relative p-6">
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
