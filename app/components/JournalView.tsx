"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Smile, ImageIcon, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react"
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

export function JournalView() {
  const [selectedMood, setSelectedMood] = useState(moods[0])
  const [showMoodDropdown, setShowMoodDropdown] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [journalTitle, setJournalTitle] = useState("")
  const [journalContent, setJournalContent] = useState("")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateCalendar = (direction: "prev" | "next") => {
    setCalendarMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    console.log("Saving journal entry:", { journalTitle, journalContent, selectedMood, selectedDate, uploadedImage })
  }

  const handleDelete = () => {
    setJournalTitle("")
    setJournalContent("")
    setUploadedImage(null)
  }

  return (
    <div className={styles.journalContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Journal</h1>
        <p className={styles.subtitle}>Your private space to reflect and grow.</p>

        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search entries..." className={styles.searchInput} />
          </div>
          <button className={styles.newEntryBtn}>
            <span>+</span> New Entry
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className={styles.dateNavigation}>
        <button onClick={() => navigateCalendar("prev")}>
          <ChevronLeft size={16} />
        </button>
        <div className={styles.dateSelector} onClick={() => setShowCalendar(!showCalendar)}>
          <Calendar size={16} />
          <span>{formatDate(selectedDate)}</span>
        </div>
        <button onClick={() => navigateCalendar("next")}>
          <ChevronRight size={16} />
        </button>

        {showCalendar && (
          <div className={styles.calendarDropdown}>
            <div className={styles.calendarHeader}>
              <button onClick={() => navigateCalendar("prev")}>
                <ChevronLeft size={16} />
              </button>
              <span className={styles.calendarTitle}>
                {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => navigateCalendar("next")}>
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
                {getDaysInMonth(calendarMonth).map((day, index) => (
                  <button
                    key={index}
                    className={`${styles.dayButton} ${
                      day && day.toDateString() === selectedDate.toDateString() ? styles.selectedDay : ""
                    } ${!day ? styles.emptyDay : ""}`}
                    onClick={() => {
                      if (day) {
                        setSelectedDate(day)
                        setShowCalendar(false)
                      }
                    }}
                    disabled={!day}
                  >
                    {day ? day.getDate() : ""}
                  </button>
                ))}
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
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {uploadedImage && (
          <div className={styles.uploadedImageContainer}>
            <img src={uploadedImage || "/placeholder.svg"} alt="Uploaded" className={styles.uploadedImage} />
            <button className={styles.removeImageBtn} onClick={() => setUploadedImage(null)}>
              ×
            </button>
          </div>
        )}

        {/* Journal Title */}
        <input
          type="text"
          placeholder="Journal title..."
          value={journalTitle}
          onChange={(e) => setJournalTitle(e.target.value)}
          className={styles.titleInput}
        />

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
            <button className={styles.saveBtn} onClick={handleSave}>
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
