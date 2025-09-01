"use client"

import { X } from "lucide-react"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  entry_date: string
  image_url?: string
  created_at: string
}

interface JournalEntryModalProps {
  entry: JournalEntry
  isOpen: boolean
  onClose: () => void
  authorName?: string
}

export function JournalEntryModal({ entry, isOpen, onClose, authorName = "You" }: JournalEntryModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{entry.mood}</span>
            <div>
              <h2 className="font-bold text-lg text-gray-900">{entry.title}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(entry.entry_date)} • {formatTime(entry.created_at)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image if available */}
        {entry.image_url && (
          <div className="flex justify-center p-6 pb-0">
            <img
              src={entry.image_url || "/placeholder.svg"}
              alt="Journal entry"
              className="max-w-full h-auto rounded-xl shadow-lg object-contain"
              style={{ maxHeight: "400px" }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{entry.content}</p>
          </div>
        </div>

        {/* Footer with author */}
        <div className="border-t border-gray-100 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Written by <span className="font-medium text-gray-900">{authorName}</span>
            </div>
            <div className="text-xs text-gray-400">Entry #{entry.id.slice(-6)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
