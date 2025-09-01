"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, Smile, ImageIcon, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "../../lib/supabase"
import { useToast } from "../../components/ui/toast"
import { JournalEntryModal } from "../../components/journal-entry-modal"
import styles from "./journal.module.css"

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "😰", label: "Anxious" },
]

const emojis = ["❤️", "⭐", "💭", "🌱", "☀️", "🍌", "🔔", "💡", "🍄", "🎵", "📚", "🥕", "💡", "💬", "🦋", "⭐"]

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  entry_date: string
  image_url?: string
  created_at: string
  entry_datetime: string
}

export function JournalView() {
  const [selectedMood, setSelectedMood] = useState(moods[0])
  const [showMoodDropdown, setShowMoodDropdown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [journalTitle, setJournalTitle] = useState("")
  const [journalContent, setJournalContent] = useState("")
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null)

  const { showToast, ToastContainer } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadPastEntries()
    loadUserProfile()
  }, [])

  const loadPastEntries = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id) // Filter by current user
        .order("entry_date", { ascending: false })
        .limit(50) // Increased limit to show more entries

      if (error) throw error
      setPastEntries(data || [])
    } catch (error) {
      console.error("Error loading past entries:", error)
    }
  }

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        let fullName = user.user_metadata?.full_name || user.user_metadata?.name

        if (!fullName) {
          const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
          fullName = data?.full_name
        }

        const firstName = fullName ? fullName.split(" ")[0] : user.email?.split("@")[0] || "User"
        setUserProfile({ full_name: firstName })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] Starting image upload:", file.name)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          showToast("Please log in to upload images.", "error")
          return
        }

        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        console.log("[v0] Uploading to:", fileName)

        const { data, error } = await supabase.storage.from("journal-images").upload(fileName, file)

        if (error) {
          console.error("[v0] Upload error:", error)
          showToast("Failed to upload image. Please try again.", "error")
          return
        }

        console.log("[v0] Upload successful:", data)

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("journal-images").getPublicUrl(fileName)

        console.log("[v0] Public URL:", publicUrl)
        setUploadedImage(publicUrl)
        showToast("Image uploaded successfully!", "success")
      } catch (error) {
        console.error("[v0] Error uploading image:", error)
        showToast("Failed to upload image. Please try again.", "error")
      }
    }
  }

  const handleSave = async () => {
    if (!journalTitle.trim() && !journalContent.trim()) {
      showToast("Please add a title or content to save your entry.", "warning")
      return
    }

    console.log("[v0] Starting save process...")
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showToast("Please log in to save your journal entry.", "error")
        return
      }

      console.log("[v0] User authenticated:", user.id)
      const entryDate = selectedDate.toISOString().split("T")[0]
      console.log("[v0] Entry date:", entryDate)

      const entryData = {
        user_id: user.id,
        title: journalTitle.trim() || "Untitled Entry",
        content: journalContent.trim(),
        mood: selectedMood.emoji,
        entry_date: entryDate,
        entry_datetime: new Date().toISOString(), // Add current timestamp for uniqueness
        image_url: uploadedImage,
      }

      console.log("[v0] Entry data to save:", entryData)

      console.log("[v0] Inserting new entry...")
      const { error } = await supabase.from("journal_entries").insert([entryData])

      if (error) {
        console.error("[v0] Save error:", error)
        throw error
      }

      console.log("[v0] Entry saved successfully")
      setJournalTitle("")
      setJournalContent("")
      setUploadedImage(null)

      console.log("[v0] Refreshing past entries...")
      setTimeout(async () => {
        await loadPastEntries()
        console.log("[v0] Past entries refreshed")
      }, 500)

      showToast("Journal entry saved successfully!", "success")
    } catch (error) {
      console.error("[v0] Error saving journal entry:", error)
      showToast("Failed to save journal entry. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    setJournalTitle("")
    setJournalContent("")
    setUploadedImage(null)
  }

  const handleNewEntry = () => {
    setSelectedDate(new Date())
    setJournalTitle("")
    setJournalContent("")
    setUploadedImage(null)
    setSelectedMood(moods[0])
    showToast("Ready to create a new journal entry!", "info")
  }

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setShowEntryModal(true)
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  return (
    <div className={styles.journalContainer}>
      <ToastContainer />

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Journal</h1>
        <p className={styles.subtitle}>Your private space to reflect and grow.</p>

        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search entries..." className={styles.searchInput} />
          </div>
          <button className={styles.newEntryBtn} onClick={handleNewEntry}>
            <span>+</span> New Entry
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className={styles.dateNavigation}>
        <button onClick={() => navigateDate("prev")} className={styles.navBtn}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.dateSelector} onClick={() => setShowCalendar(!showCalendar)}>
          <Calendar size={16} />
          <span>{formatDate(selectedDate)}</span>
        </div>
        <button onClick={() => navigateDate("next")} className={styles.navBtn}>
          <ChevronRight size={20} />
        </button>

        {showCalendar && (
          <div className={styles.calendarDropdown}>
            <div className={styles.calendarHeader}>
              <button onClick={() => navigateMonth("prev")} className={styles.monthNavBtn}>
                <ChevronLeft size={16} />
              </button>
              <h3 className={styles.monthTitle}>
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button onClick={() => navigateMonth("next")} className={styles.monthNavBtn}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.calendarGrid}>
              <div className={styles.weekDays}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className={styles.weekDay}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.daysGrid}>
                {generateCalendarDays().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
                  const isSelected = day.toDateString() === selectedDate.toDateString()
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={index}
                      className={`${styles.dayBtn} ${isCurrentMonth ? styles.currentMonth : styles.otherMonth} ${isSelected ? styles.selectedDay : ""} ${isToday ? styles.today : ""}`}
                      onClick={() => {
                        setSelectedDate(day)
                        setShowCalendar(false)
                      }}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Journal Entry */}
      <div className={styles.journalEntry}>
        <div className={styles.entryHeader}>
          <div className={styles.dateNumber}>
            <span className={styles.dayNumber}>{selectedDate.getDate()}</span>
            <div className={styles.monthYear}>
              <span>{selectedDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
              <span>{selectedDate.getFullYear()}</span>
            </div>
          </div>

          {/* Mood Selector */}
          <div className={styles.moodSelector}>
            {moods.map((mood, index) => (
              <button
                key={index}
                className={`${styles.moodBtn} ${selectedMood.emoji === mood.emoji ? styles.selected : ""}`}
                onClick={() => setSelectedMood(mood)}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Title */}
        <input
          type="text"
          placeholder="Journal title..."
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className={styles.titleInput}
        />

        {uploadedImage && (
          <div className={styles.uploadedImageContainer}>
            <img src={uploadedImage || "/placeholder.svg"} alt="Uploaded" className={styles.uploadedImage} />
            <button onClick={() => setUploadedImage(null)} className={styles.removeImageBtn}>
              ×
            </button>
          </div>
        )}

        {/* Journal Content */}
        <textarea
          placeholder="Write about your day..."
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          className={styles.contentTextarea}
        />

        {/* Bottom Actions */}
        <div className={styles.bottomActions}>
          <div className={styles.leftActions}>
            <label className={styles.actionBtn}>
              <ImageIcon size={20} />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>
            <button className={styles.actionBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Smile size={20} />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className={styles.emojiPicker}>
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className={styles.emojiBtn}
                    onClick={() => {
                      setJournalContent((prev) => prev + emoji)
                      setShowEmojiPicker(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.rightActions}>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <Trash2 size={16} />
              Delete
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isLoading}>
              <Save size={16} />
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {pastEntries.length > 0 && (
        <div className={styles.pastEntries}>
          <h2 className={styles.pastEntriesTitle}>Past Entries</h2>
          <div className={styles.entriesList}>
            {pastEntries.map((entry) => (
              <div
                key={entry.id}
                className={styles.pastEntry}
                onClick={() => handleEntryClick(entry)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.pastEntryHeader}>
                  <div className={styles.pastEntryDate}>
                    <span className={styles.pastEntryMood}>{entry.mood}</span>
                    <span>{new Date(entry.entry_date).toLocaleDateString()}</span>
                  </div>
                  <h3 className={styles.pastEntryTitle}>{entry.title}</h3>
                </div>
                <p className={styles.pastEntryContent}>
                  {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Entry Modal */}
      {selectedEntry && (
        <JournalEntryModal
          entry={selectedEntry}
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          authorName={userProfile?.full_name || "You"}
        />
      )}
    </div>
  )
}
