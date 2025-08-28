"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, FileText, Save, Plus, Clock, User, Brain, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface TherapyNote {
  id: string
  session_id: string
  content: string
  note_type: "observation" | "insight" | "goal" | "summary"
  created_at: string
}

interface TherapyNotesPanelProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string | null
  userName?: string
  messages: Array<{ content: string; sender: "user" | "ai"; timestamp: Date }>
}

export default function TherapyNotesPanel({ isOpen, onClose, sessionId, userName, messages }: TherapyNotesPanelProps) {
  const [notes, setNotes] = useState<TherapyNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState<TherapyNote["note_type"]>("observation")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionSummary, setSessionSummary] = useState("")
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && sessionId) {
      console.log("[v0] Loading therapy notes for session:", sessionId)
      loadNotes()
      generateSessionSummary()
      loadAiInsights()
    }
  }, [isOpen, sessionId])

  const loadNotes = async () => {
    if (!sessionId) {
      console.log("[v0] No session ID provided for loading notes")
      return
    }

    try {
      console.log("[v0] Fetching notes from database for session:", sessionId)
      const { data, error } = await supabase
        .from("therapy_notes")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error loading notes:", error)
        setError(`Failed to load notes: ${error.message}`)
        return
      }

      console.log("[v0] Loaded notes:", data)
      setNotes(data || [])
      setError(null)
    } catch (error) {
      console.error("[v0] Error loading notes:", error)
      setError("Failed to load notes")
    }
  }

  const loadAiInsights = async () => {
    if (!sessionId) return

    try {
      const { data, error } = await supabase
        .from("therapy_insights")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("[v0] Error loading AI insights:", error)
        return
      }

      if (data && data.length > 0) {
        setAiInsights(data[0])
      }
    } catch (error) {
      console.error("[v0] Error loading AI insights:", error)
    }
  }

  const generateAiInsights = async () => {
    if (!sessionId || messages.length < 2) return

    setIsGeneratingInsights(true)
    try {
      const response = await fetch("/api/therapy-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          messages,
          userName: userName || "User",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate insights")
      }

      setAiInsights(data.insights)

      await createNotesFromInsights(data.insights)
    } catch (error) {
      console.error("[v0] Error generating AI insights:", error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const createNotesFromInsights = async (insights: any) => {
    if (!sessionId || !insights) return

    try {
      const notesToCreate = []

      // Create observation note
      if (insights.key_themes && insights.key_themes.length > 0) {
        const observationContent = `Key themes observed in this session:\n• ${insights.key_themes.join("\n• ")}\n\nMood: ${insights.mood_analysis?.primary_mood || "Not specified"} (intensity: ${insights.mood_analysis?.mood_intensity || "N/A"}/10)`
        notesToCreate.push({
          session_id: sessionId,
          content: observationContent,
          note_type: "observation" as const,
        })
      }

      // Create insight note
      if (insights.therapeutic_insights && insights.therapeutic_insights.length > 0) {
        const insightContent = `Therapeutic insights from this session:\n• ${insights.therapeutic_insights.join("\n• ")}`
        notesToCreate.push({
          session_id: sessionId,
          content: insightContent,
          note_type: "insight" as const,
        })
      }

      // Create goal note
      if (insights.recommended_interventions && insights.recommended_interventions.length > 0) {
        const goalContent = `Recommended goals and interventions:\n• ${insights.recommended_interventions.join("\n• ")}`
        notesToCreate.push({
          session_id: sessionId,
          content: goalContent,
          note_type: "goal" as const,
        })
      }

      // Create summary note
      const summaryContent = `Session Summary:
Engagement Level: ${insights.progress_indicators?.engagement_level || "Not assessed"}
Risk Assessment: ${insights.risk_assessment || "Not assessed"}
Primary Concerns: ${insights.key_themes?.slice(0, 3).join(", ") || "None identified"}

Overall Assessment: This session showed ${insights.mood_analysis?.primary_mood || "varied"} mood with ${insights.progress_indicators?.engagement_level || "moderate"} engagement. ${insights.therapeutic_insights?.[0] || "Continue monitoring progress."}`

      notesToCreate.push({
        session_id: sessionId,
        content: summaryContent,
        note_type: "summary" as const,
      })

      // Save all notes to database
      for (const noteData of notesToCreate) {
        const { data: savedNote, error } = await supabase.from("therapy_notes").insert(noteData).select().single()

        if (error) {
          console.error("[v0] Error saving generated note:", error)
        } else {
          console.log("[v0] Generated note saved:", savedNote)
          setNotes((prev) => [savedNote, ...prev])
        }
      }

      console.log("[v0] Successfully created", notesToCreate.length, "notes from AI insights")
    } catch (error) {
      console.error("[v0] Error creating notes from insights:", error)
    }
  }

  const generateSessionSummary = async () => {
    if (!messages.length || !sessionId) {
      console.log("[v0] No messages or session ID for summary generation")
      return
    }

    console.log("[v0] Generating session summary with", messages.length, "messages")

    const userMessages = messages.filter((m) => m.sender === "user")
    const aiMessages = messages.filter((m) => m.sender === "ai")

    const sessionStart = messages[0]?.timestamp || new Date()
    const sessionEnd = messages[messages.length - 1]?.timestamp || new Date()
    const durationMinutes = Math.max(1, Math.round((sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60)))

    const summary = `Session Overview for ${userName || "User"}:
    
📊 Session Stats:
• Duration: ${durationMinutes} minutes
• User messages: ${userMessages.length}
• AI responses: ${aiMessages.length}

🎯 Key Themes Discussed:
${userMessages
  .slice(0, 3)
  .map((msg, i) => `${i + 1}. ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}`)
  .join("\n")}

💡 Therapeutic Insights:
• User appears to be seeking support and guidance
• Conversation shows engagement with therapeutic process
• Opportunity for continued exploration of themes`

    setSessionSummary(summary)
    console.log("[v0] Generated session summary")
  }

  const saveNote = async () => {
    if (!newNote.trim() || !sessionId) {
      console.log("[v0] Cannot save note - missing content or session ID")
      return
    }

    console.log("[v0] Saving note:", { sessionId, noteType, content: newNote.trim() })
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("therapy_notes")
        .insert({
          session_id: sessionId,
          content: newNote.trim(),
          note_type: noteType,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error saving note:", error)
        setError(`Failed to save note: ${error.message}`)
        return
      }

      console.log("[v0] Note saved successfully:", data)
      setNotes((prev) => [data, ...prev])
      setNewNote("")
      setError(null)
    } catch (error) {
      console.error("[v0] Error saving note:", error)
      setError("Failed to save note")
    } finally {
      setIsLoading(false)
    }
  }

  const getNoteIcon = (type: TherapyNote["note_type"]) => {
    switch (type) {
      case "observation":
        return <User className="w-4 h-4" />
      case "insight":
        return <Brain className="w-4 h-4" />
      case "goal":
        return <Plus className="w-4 h-4" />
      case "summary":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getNoteColor = (type: TherapyNote["note_type"]) => {
    switch (type) {
      case "observation":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "insight":
        return "bg-purple-50 border-purple-200 text-purple-800"
      case "goal":
        return "bg-green-50 border-green-200 text-green-800"
      case "summary":
        return "bg-orange-50 border-orange-200 text-orange-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Therapy Session Notes</h2>
              <p className="text-sm text-gray-600">Session insights and observations for {userName || "User"}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Session Summary - Fixed width, scrollable */}
          <div className="w-1/4 border-r border-gray-200/50 bg-gradient-to-b from-blue-50/50 to-purple-50/50 flex flex-col">
            <div className="p-6 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Session Summary
              </h3>
            </div>

            <div className="flex-1 px-6 pb-6 overflow-y-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {sessionSummary}
                </pre>
              </div>

              {/* AI Insights Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Insights
                  </h4>
                  {!aiInsights && messages.length >= 2 && (
                    <Button
                      onClick={generateAiInsights}
                      disabled={isGeneratingInsights}
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1"
                    >
                      {isGeneratingInsights ? "Analyzing..." : "Generate"}
                    </Button>
                  )}
                </div>

                {aiInsights ? (
                  <div className="space-y-3 text-xs">
                    {aiInsights.mood_analysis && (
                      <div>
                        <span className="font-medium text-purple-700">Mood:</span>
                        <p className="text-purple-600">
                          {aiInsights.mood_analysis.primary_mood} (intensity: {aiInsights.mood_analysis.mood_intensity}
                          /10)
                        </p>
                      </div>
                    )}

                    {aiInsights.key_themes && aiInsights.key_themes.length > 0 && (
                      <div>
                        <span className="font-medium text-purple-700">Key Themes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {aiInsights.key_themes.slice(0, 3).map((theme: string, index: number) => (
                            <span key={index} className="bg-white/60 text-purple-700 px-2 py-1 rounded-full text-xs">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiInsights.progress_indicators && (
                      <div>
                        <span className="font-medium text-purple-700">Progress:</span>
                        <p className="text-purple-600">Engagement: {aiInsights.progress_indicators.engagement_level}</p>
                      </div>
                    )}

                    <div
                      className={`text-xs px-2 py-1 rounded-full text-center ${
                        aiInsights.risk_assessment === "low"
                          ? "bg-green-100 text-green-800"
                          : aiInsights.risk_assessment === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      Risk: {aiInsights.risk_assessment}
                    </div>
                  </div>
                ) : messages.length < 2 ? (
                  <p className="text-xs text-purple-600">Need more conversation for insights</p>
                ) : (
                  <p className="text-xs text-purple-600">Click Generate to analyze this session</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section - Flexible width, scrollable */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Add New Note - Fixed header */}
            <div className="p-6 border-b border-gray-200/50 bg-white/30 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add Therapy Note</h3>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {(["observation", "insight", "goal", "summary"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNoteType(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        noteType === type
                          ? "bg-purple-500 text-white shadow-lg"
                          : "bg-white/60 text-gray-700 hover:bg-white/80"
                      }`}
                    >
                      {getNoteIcon(type)}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={`Add a ${noteType} note about this session...`}
                  className="w-full h-24 p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
                <Button
                  onClick={saveNote}
                  disabled={!newNote.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Session Notes ({notes.length})</h3>
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No notes yet for this session</p>
                      <p className="text-sm">Add your first observation or insight above</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-xl border-2 ${getNoteColor(note.note_type)} backdrop-blur-sm`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getNoteIcon(note.note_type)}
                          <span className="font-medium text-sm uppercase tracking-wide">{note.note_type}</span>
                          <span className="text-xs opacity-70 ml-auto">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
