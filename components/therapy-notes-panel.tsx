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
  const [isLoading, setIsLoading] = useState(false)
  const [sessionSummary, setSessionSummary] = useState("")
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TherapyNote["note_type"]>("observation")
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{
    observation: string
    insight: string
    goal: string
    summary: string
  }>({
    observation: "",
    insight: "",
    goal: "",
    summary: "",
  })
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && sessionId) {
      console.log("[v0] Loading therapy notes for session:", sessionId)
      loadNotes()
      generateSessionSummary()
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
${
  userMessages.length > 0
    ? userMessages
        .slice(0, 3)
        .map((msg, i) => `${i + 1}. ${msg.content.substring(0, 100)}${msg.content.length > 100 ? "..." : ""}`)
        .join("\n")
    : "No themes discussed yet"
}

💡 Therapeutic Insights:
Click "Generate" below to analyze this session with AI`

    setSessionSummary(summary)
    console.log("[v0] Generated session summary")
  }

  const generateAiInsights = async () => {
    if (!sessionId || messages.length < 2) return

    setIsGeneratingInsights(true)
    setError(null)
    try {
      console.log("[v0] Generating AI insights for session:", sessionId)
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
        console.error("[v0] Error generating AI insights:", data.error)
        setError(`Failed to generate insights: ${data.error}`)
        return
      }

      console.log("[v0] AI insights generated successfully")
      setAiInsights(data.insights)

      await populateTabsWithAiContent(data.insights)
    } catch (error) {
      console.error("[v0] Error generating AI insights:", error)
      setError("Failed to generate insights. Please try again.")
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const populateTabsWithAiContent = async (insights: any) => {
    if (!sessionId || !insights) return

    try {
      const observationContent = `Key themes observed in this session:
${insights.key_themes?.map((theme: string, i: number) => `${i + 1}. ${theme}`).join("\n") || "No specific themes identified"}

Mood Analysis:
• Primary mood: ${insights.mood_analysis?.primary_mood || "Not specified"}
• Intensity: ${insights.mood_analysis?.mood_intensity || "N/A"}/10
• Mood trends: ${insights.mood_analysis?.mood_trends?.join(", ") || "Not assessed"}

Engagement Assessment:
• Engagement level: ${insights.progress_indicators?.engagement_level || "Not assessed"}
• Openness to therapy: ${insights.progress_indicators?.openness || "Not assessed"}`

      const insightContent = `Therapeutic insights and clinical observations:

Key Clinical Insights:
${insights.recommendations?.map((rec: string, i: number) => `${i + 1}. ${rec}`).join("\n") || "No specific recommendations generated"}

Progress Indicators:
• Openness to therapeutic process: ${insights.progress_indicators?.openness || "Not assessed"}
• Insight development: ${insights.progress_indicators?.insight_development || "Not assessed"}
• Current coping strategies: ${insights.progress_indicators?.coping_strategies_used?.join(", ") || "None identified"}

Clinical Assessment:
The client demonstrated ${insights.progress_indicators?.engagement_level || "moderate"} engagement with therapeutic interventions. Risk assessment indicates ${insights.risk_assessment || "standard"} level monitoring required.`

      const goalContent = `Therapeutic goals and action plan:

Current Coping Strategies Observed:
${
  insights.progress_indicators?.coping_strategies_used?.length > 0
    ? insights.progress_indicators.coping_strategies_used
        .map((strategy: string, i: number) => `${i + 1}. ${strategy}`)
        .join("\n")
    : "• No specific coping strategies identified in this session"
}

Recommended Focus Areas:
${
  insights.recommendations
    ?.slice(0, 3)
    .map((rec: string, i: number) => `${i + 1}. ${rec}`)
    .join("\n") || "• Continue current therapeutic approach"
}

Next Session Goals:
• Build on identified strengths and coping mechanisms
• Address primary mood concerns (${insights.mood_analysis?.primary_mood || "general emotional wellness"})
• Monitor progress on therapeutic recommendations
• Assess effectiveness of suggested interventions`

      const summaryContent = `Session Summary:
Primary Mood: ${insights.mood_analysis?.primary_mood || "Not specified"} (${insights.mood_analysis?.mood_intensity || "N/A"}/10)
Risk Assessment: ${insights.risk_assessment || "Not assessed"}
Engagement Level: ${insights.progress_indicators?.engagement_level || "Not assessed"}

Key Themes Discussed:
• ${insights.key_themes?.join("\n• ") || "No specific themes identified"}

Overall Assessment: This session revealed ${insights.mood_analysis?.primary_mood || "varied"} mood patterns with ${insights.progress_indicators?.engagement_level || "moderate"} engagement. The client demonstrated ${insights.progress_indicators?.openness || "moderate"} openness to therapeutic process. Risk level assessed as ${insights.risk_assessment || "not determined"}.

Next Steps: ${insights.recommendations?.[0] || "Continue monitoring progress and therapeutic engagement."}`

      setAiGeneratedContent({
        observation: observationContent,
        insight: insightContent,
        goal: goalContent,
        summary: summaryContent,
      })

      await createNotesFromInsights(insights)

      console.log("[v0] Successfully populated tabs with AI-generated content")
      setError(null)
    } catch (error) {
      console.error("[v0] Error populating tabs with AI content:", error)
      setError("Failed to generate tab content")
    }
  }

  const createNotesFromInsights = async (insights: any) => {
    if (!sessionId || !insights) return

    try {
      const notesToCreate = []

      if (insights.key_themes && insights.key_themes.length > 0) {
        const observationContent = `Key themes observed in this session:
${insights.key_themes.map((theme: string, i: number) => `${i + 1}. ${theme}`).join("\n")}

Mood Analysis:
• Primary mood: ${insights.mood_analysis?.primary_mood || "Not specified"}
• Intensity: ${insights.mood_analysis?.mood_intensity || "N/A"}/10
• Mood trends: ${insights.mood_analysis?.mood_trends?.join(", ") || "Not assessed"}

Engagement Assessment:
• Engagement level: ${insights.progress_indicators?.engagement_level || "Not assessed"}
• Openness to therapy: ${insights.progress_indicators?.openness || "Not assessed"}`

        notesToCreate.push({
          session_id: sessionId,
          content: observationContent,
          note_type: "observation" as const,
        })
      }

      if (insights.recommendations && insights.recommendations.length > 0) {
        const insightContent = `Therapeutic insights and clinical observations:

Key Insights:
${insights.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join("\n")}

Progress Indicators:
• Openness to therapeutic process: ${insights.progress_indicators?.openness || "Not assessed"}
• Insight development: ${insights.progress_indicators?.insight_development || "Not assessed"}
• Current coping strategies: ${insights.progress_indicators?.coping_strategies_used?.join(", ") || "None identified"}

Clinical Notes:
The client demonstrated ${insights.progress_indicators?.engagement_level || "moderate"} engagement with therapeutic interventions. Risk assessment indicates ${insights.risk_assessment || "standard"} level monitoring required.`

        notesToCreate.push({
          session_id: sessionId,
          content: insightContent,
          note_type: "insight" as const,
        })
      }

      const goalContent = `Therapeutic goals and action plan:

Current Coping Strategies Observed:
${
  insights.progress_indicators?.coping_strategies_used?.length > 0
    ? insights.progress_indicators.coping_strategies_used
        .map((strategy: string, i: number) => `${i + 1}. ${strategy}`)
        .join("\n")
    : "• No specific coping strategies identified in this session"
}

Recommended Focus Areas:
${
  insights.recommendations
    ?.slice(0, 3)
    .map((rec: string, i: number) => `${i + 1}. ${rec}`)
    .join("\n") || "• Continue current therapeutic approach"
}

Next Session Goals:
• Build on identified strengths and coping mechanisms
• Address primary mood concerns (${insights.mood_analysis?.primary_mood || "general emotional wellness"})
• Monitor progress on therapeutic recommendations
• Assess effectiveness of suggested interventions`

      notesToCreate.push({
        session_id: sessionId,
        content: goalContent,
        note_type: "goal" as const,
      })

      const summaryContent = `Session Summary:
Primary Mood: ${insights.mood_analysis?.primary_mood || "Not specified"} (${insights.mood_analysis?.mood_intensity || "N/A"}/10)
Risk Assessment: ${insights.risk_assessment || "Not assessed"}
Engagement Level: ${insights.progress_indicators?.engagement_level || "Not assessed"}

Key Themes Discussed:
• ${insights.key_themes?.join("\n• ") || "No specific themes identified"}

Overall Assessment: This session revealed ${insights.mood_analysis?.primary_mood || "varied"} mood patterns with ${insights.progress_indicators?.engagement_level || "moderate"} engagement. The client demonstrated ${insights.progress_indicators?.openness || "moderate"} openness to therapeutic process. Risk level assessed as ${insights.risk_assessment || "not determined"}.

Next Steps: ${insights.recommendations?.[0] || "Continue monitoring progress and therapeutic engagement."}`

      notesToCreate.push({
        session_id: sessionId,
        content: summaryContent,
        note_type: "summary" as const,
      })

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
      setError(null)
    } catch (error) {
      console.error("[v0] Error creating notes from insights:", error)
      setError("Failed to create notes from insights")
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 flex-shrink-0 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Therapy Session Notes</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Session insights and observations for {userName || "User"}
              </p>
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
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* Session Summary - Full width on mobile, fixed width on desktop */}
          <div className="w-full lg:w-1/3 xl:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200/50 bg-gradient-to-b from-blue-50/50 to-purple-50/50 flex flex-col">
            <div className="p-4 sm:p-6 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Session Summary
              </h3>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/50 mb-4">
                <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {sessionSummary}
                </pre>
              </div>

              {/* AI Insights Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs sm:text-sm font-medium text-purple-800 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
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

          {/* Notes Section - Flexible width with natural content flow */}
          <div className="flex-1">
            <div className="p-4 sm:p-6 border-b border-gray-200/50 bg-white/30">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">Add Therapy Note</h3>
              <div className="space-y-4">
                <div className="flex gap-1 sm:gap-2 flex-wrap">
                  {(["observation", "insight", "goal", "summary"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveTab(type)}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                        activeTab === type
                          ? "bg-purple-500 text-white shadow-lg"
                          : "bg-white/60 text-gray-700 hover:bg-white/80"
                      }`}
                    >
                      {getNoteIcon(type)}
                      <span className="hidden sm:inline">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      <span className="sm:hidden">{type.charAt(0).toUpperCase()}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-3 sm:p-4 h-[150px] sm:h-[200px] overflow-y-auto">
                  {aiGeneratedContent[activeTab] ? (
                    <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {aiGeneratedContent[activeTab]}
                    </pre>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">AI-generated {activeTab} will appear here</p>
                      <p className="text-xs">Click "Generate" in the AI Insights section to analyze this session</p>
                    </div>
                  )}
                </div>

                {aiGeneratedContent[activeTab] && (
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => {
                        console.log("[v0] AI-generated content already saved to database")
                      }}
                      disabled={true}
                      className="w-full sm:w-auto bg-green-500 text-white cursor-default"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Saved to Records
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">Session Notes ({notes.length})</h3>
              <div className="space-y-3 pb-6">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">No notes yet for this session</p>
                    <p className="text-xs sm:text-sm">Add your first observation or insight above</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 sm:p-4 rounded-xl border-2 ${getNoteColor(note.note_type)} backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getNoteIcon(note.note_type)}
                        <span className="font-medium text-xs sm:text-sm uppercase tracking-wide">{note.note_type}</span>
                        <span className="text-xs opacity-70 ml-auto">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
