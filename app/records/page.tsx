"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Brain, TrendingUp, FileText, Clock, Target, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase"
import TherapyNotesPanel from "@/components/therapy-notes-panel"

interface TherapyRecord {
  id: string
  user_id: string
  total_sessions: number
  first_session_date: string
  last_session_date: string
  primary_concerns: string[]
  therapeutic_goals: string[]
  progress_summary: any
  created_at: string
  updated_at: string
}

interface SessionData {
  id: string
  title: string
  mode: string
  created_at: string
  updated_at: string
  note_count?: number
}

interface TherapyInsight {
  id: string
  session_id: string
  mood_analysis: any
  key_themes: string[]
  progress_indicators: any
  recommendations: string[]
  risk_assessment: string
  created_at: string
}

export default function UserRecordsPage() {
  const [therapyRecord, setTherapyRecord] = useState<TherapyRecord | null>(null)
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([])
  const [insights, setInsights] = useState<TherapyInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>("")
  const [showTherapyNotes, setShowTherapyNotes] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserRecords()
  }, [])

  const loadUserRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load user profile
      const { data: profile } = await supabase.from("user_profiles").select("name").eq("user_id", user.id).single()

      if (profile?.name) {
        setUserName(profile.name)
      }

      // Load therapy record
      const { data: record } = await supabase.from("user_therapy_records").select("*").eq("user_id", user.id).single()

      setTherapyRecord(record)

      // Load recent therapy sessions
      const { data: sessions } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .in("mode", ["therapist", "avatar-therapy"])
        .order("updated_at", { ascending: false })
        .limit(10)

      if (sessions) {
        // Get note counts for each session
        const sessionsWithNotes = await Promise.all(
          sessions.map(async (session) => {
            const { count } = await supabase
              .from("therapy_notes")
              .select("*", { count: "exact", head: true })
              .eq("session_id", session.id)

            return { ...session, note_count: count || 0 }
          }),
        )
        setRecentSessions(sessionsWithNotes)
      }

      // Load therapy insights
      const { data: insightsData } = await supabase
        .from("therapy_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setInsights(insightsData || [])
    } catch (error) {
      console.error("Error loading user records:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSessionDuration = (firstDate: string, lastDate: string) => {
    const first = new Date(firstDate)
    const last = new Date(lastDate)
    const diffInDays = Math.ceil((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 30) {
      return `${diffInDays} days`
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)} months`
    } else {
      return `${Math.floor(diffInDays / 365)} years`
    }
  }

  const handleSessionClick = async (sessionId: string) => {
    try {
      console.log("[v0] Loading session messages for:", sessionId)

      // Load session messages
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading session messages:", error)
        return
      }

      // Convert messages to the format expected by TherapyNotesPanel
      const formattedMessages = messages.map((msg: any) => ({
        content: msg.content,
        sender: msg.role === "user" ? "user" : "ai",
        timestamp: new Date(msg.created_at),
      }))

      setSelectedSessionId(sessionId)
      setSelectedSessionMessages(formattedMessages)
      setShowTherapyNotes(true)
    } catch (error) {
      console.error("Error loading session:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your therapy records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/")} variant="ghost" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Therapy Records</h1>
              <p className="text-sm sm:text-base text-gray-600">Your mental health journey with ValorMind AI</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Total Sessions</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{therapyRecord?.total_sessions || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Therapy conversations</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Journey Duration</h3>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {therapyRecord?.first_session_date && therapyRecord?.last_session_date
                ? getSessionDuration(therapyRecord.first_session_date, therapyRecord.last_session_date)
                : "Not started"}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Time in therapy</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Active Goals</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {therapyRecord?.therapeutic_goals?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Therapeutic objectives</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Last Session</h3>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              {therapyRecord?.last_session_date
                ? formatDate(therapyRecord.last_session_date).split(",")[0]
                : "No sessions"}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Most recent therapy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Sessions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Therapy Sessions</h2>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">No therapy sessions yet</p>
                  <p className="text-xs sm:text-sm">Start your first session to see your progress here</p>
                </div>
              ) : (
                recentSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800 truncate text-sm sm:text-base">{session.title}</h3>
                      <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                        {session.mode === "therapist" ? "Therapist" : "Avatar"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>{formatDate(session.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {session.note_count} notes
                        <span className="text-xs text-blue-600 ml-2 hidden sm:inline">Click to view →</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Therapy Goals & Concerns */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Goals & Focus Areas</h2>
            </div>

            <div className="space-y-4 sm:space-y-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {/* Therapeutic Goals */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Current Goals</h3>
                <div className="space-y-2">
                  {therapyRecord?.therapeutic_goals?.length ? (
                    therapyRecord.therapeutic_goals.map((goal, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs sm:text-sm text-green-800">{goal}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm">No therapeutic goals set yet</p>
                  )}
                </div>
              </div>

              {/* Primary Concerns */}
              <div>
                <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Areas of Focus</h3>
                <div className="space-y-2">
                  {therapyRecord?.primary_concerns?.length ? (
                    therapyRecord.primary_concerns.map((concern, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs sm:text-sm text-blue-800">{concern}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs sm:text-sm">No primary concerns identified yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">AI-Generated Insights</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-h-[600px] overflow-y-auto">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50"
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-purple-800">Session Analysis</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          insight.risk_assessment === "low"
                            ? "bg-green-100 text-green-800"
                            : insight.risk_assessment === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {insight.risk_assessment} risk
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{formatDate(insight.created_at)}</p>
                  </div>

                  {insight.key_themes?.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Key Themes</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.key_themes.map((theme, index) => (
                          <span key={index} className="text-xs bg-white/60 text-gray-700 px-2 py-1 rounded-full">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.recommendations?.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Recommendations</h4>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TherapyNotesPanel for viewing session notes */}
      <TherapyNotesPanel
        isOpen={showTherapyNotes}
        onClose={() => {
          setShowTherapyNotes(false)
          setSelectedSessionId(null)
          setSelectedSessionMessages([])
        }}
        sessionId={selectedSessionId}
        userName={userName}
        messages={selectedSessionMessages}
      />
    </div>
  )
}
