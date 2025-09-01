"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trash2, Save, ImageIcon, Smile, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface JournalEntryProps {
  date: Date
  onEntryChange?: () => void
}

const moodEmojis = ["😊", "😔", "😡", "🤩", "😎", "😴", "😂", "😰"]

const emojiCategories = [
  ["❤️", "⭐", "🌸", "🌱"],
  ["☀️", "🍌", "🔔", "🦆"],
  ["🍄", "🎵", "📚", "🥕"],
  ["💡", "💬", "🦋", "⭐"],
]

export default function JournalEntry({ date, onEntryChange }: JournalEntryProps) {
  const [selectedMood, setSelectedMood] = useState<string>()
  const [entryText, setEntryText] = useState("")
  const [entryTitle, setEntryTitle] = useState("")
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entryId, setEntryId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadEntry()
  }, [date])

  const loadEntry = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const dateStr = date.toISOString().split("T")[0]
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", dateStr)
        .single()

      if (data) {
        setEntryId(data.id)
        setEntryTitle(data.title || "")
        setEntryText(data.content || "")
        setSelectedMood(data.mood || undefined)
        setSelectedEmojis(data.emojis || [])
      } else {
        // Reset for new entry
        setEntryId(null)
        setEntryTitle("")
        setEntryText("")
        setSelectedMood(undefined)
        setSelectedEmojis([])
      }
    } catch (error) {
      console.error("Error loading entry:", error)
    }
  }

  const saveEntry = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const dateStr = date.toISOString().split("T")[0]
      const entryData = {
        user_id: user.id,
        entry_date: dateStr,
        title: entryTitle,
        content: entryText,
        mood: selectedMood,
        emojis: selectedEmojis,
        updated_at: new Date().toISOString(),
      }

      if (entryId) {
        // Update existing entry
        const { error } = await supabase.from("journal_entries").update(entryData).eq("id", entryId)
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from("journal_entries")
          .insert([{ ...entryData, created_at: new Date().toISOString() }])
          .select()
          .single()

        if (data) {
          setEntryId(data.id)
        }
      }

      onEntryChange?.()
    } catch (error) {
      console.error("Error saving entry:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async () => {
    if (!entryId) return

    try {
      setLoading(true)
      await supabase.from("journal_entries").delete().eq("id", entryId)

      // Reset form
      setEntryId(null)
      setEntryTitle("")
      setEntryText("")
      setSelectedMood(undefined)
      setSelectedEmojis([])
      onEntryChange?.()
    } catch (error) {
      console.error("Error deleting entry:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatEntryDate = (date: Date) => {
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    const year = date.getFullYear()
    return { day, month, year }
  }

  const { day, month, year } = formatEntryDate(date)

  const toggleEmoji = (emoji: string) => {
    setSelectedEmojis((prev) => (prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]))
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <div className="p-8">
        {/* Date and Mood Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-pink-500">{day}</span>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-gray-600">{month}</span>
              <span className="text-sm text-gray-500">{year}</span>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="flex items-center gap-2 text-2xl hover:bg-gray-100"
            >
              {selectedMood || "😊"}
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showMoodPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-2 flex gap-2 z-10">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMood(emoji)
                      setShowMoodPicker(false)
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
                      selectedMood === emoji ? "bg-pink-100 ring-2 ring-pink-300 scale-110" : "hover:bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Journal title..."
            value={entryTitle}
            onChange={(e) => setEntryTitle(e.target.value)}
            className="text-lg font-medium border-0 bg-transparent focus:ring-0 px-0 placeholder:text-gray-400"
          />
        </div>

        {/* Main Content Area */}
        <div className="relative">
          <Textarea
            placeholder="Write about your day..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="min-h-[400px] resize-none border-0 bg-transparent text-gray-700 placeholder:text-gray-400 focus:ring-0 text-base leading-relaxed pr-8"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#9ca3af #f3f4f6",
            }}
          />

          {/* Custom Scrollbar */}
          <div className="absolute right-2 top-4 bottom-4 w-2 bg-gray-200 rounded-full">
            <div className="w-full h-16 bg-gray-400 rounded-full"></div>
          </div>
        </div>

        {/* Selected Emojis Display */}
        {selectedEmojis.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
            {selectedEmojis.map((emoji, index) => (
              <span key={index} className="text-lg">
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Smile className="w-4 h-4" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-3 z-10">
                  <div className="grid grid-cols-4 gap-2">
                    {emojiCategories.flat().map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => toggleEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-200 hover:scale-110 ${
                          selectedEmojis.includes(emoji)
                            ? "bg-pink-100 ring-2 ring-pink-300 scale-110"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {entryId && (
              <Button
                variant="outline"
                onClick={deleteEntry}
                disabled={loading}
                className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              onClick={saveEntry}
              disabled={loading}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
