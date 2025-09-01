"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: "success" | "error" | "warning" | "info"
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white border-green-600"
      case "error":
        return "bg-red-500 text-white border-red-600"
      case "warning":
        return "bg-yellow-500 text-white border-yellow-600"
      case "info":
        return "bg-blue-500 text-white border-blue-600"
      default:
        return "bg-gray-500 text-white border-gray-600"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "info":
        return "ℹ"
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto rounded-lg border-2 px-6 py-4 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
          "max-w-sm w-full mx-4 flex items-center gap-3",
          getToastStyles(),
        )}
      >
        <span className="text-xl font-bold">{getIcon()}</span>
        <span className="flex-1 font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; message: string; type: "success" | "error" | "warning" | "info" }>
  >([])

  const showToast = React.useCallback((message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = React.useCallback(
    () => (
      <>
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </>
    ),
    [toasts, removeToast],
  )

  return { showToast, ToastContainer }
}
