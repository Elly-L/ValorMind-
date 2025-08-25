import type { ReactNode } from "react"

interface GradientIconProps {
  children: ReactNode
  gradient: string
  size?: "sm" | "md" | "lg"
}

export function GradientIcon({ children, gradient, size = "md" }: GradientIconProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
      <div className="text-white">{children}</div>
    </div>
  )
}
