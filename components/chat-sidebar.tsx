"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, MessageSquare, Trash2, Edit3, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import type { ChatSession } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface ChatSidebarProps {
  currentMode: "friend" | "therapist"
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onUpdateSessionTitle?: (sessionId: string, title: string) => void
  hasBackgroundImage?: boolean
}

export default function ChatSidebar({
  currentMode,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  isOpen,
  onClose,
  collapsed = true,
  onUpdateSessionTitle,
  hasBackgroundImage = false,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024
  const shouldBeExpanded = isMobile ? isOpen : !collapsed

  useEffect(() => {
    loadSessions()
  }, [currentMode])

  const loadSessions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("mode", currentMode)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error loading sessions:", error)
        return
      }

      setSessions(data || [])
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: `New ${currentMode} chat`,
          mode: currentMode,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating session:", error)
        return
      }

      setSessions((prev) => [data, ...prev])
      onSessionSelect(data.id)
      onNewChat()
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId)

      if (error) {
        console.error("Error deleting session:", error)
        return
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) {
        onNewChat()
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase.from("chat_sessions").update({ title: newTitle }).eq("id", sessionId)

      if (error) {
        console.error("Error updating session:", error)
        return
      }

      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s)))
      setEditingId(null)
      setEditTitle("")
    } catch (error) {
      console.error("Error updating session:", error)
    }
  }

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === "Enter") {
      updateSessionTitle(sessionId, editTitle)
    } else if (e.key === "Escape") {
      cancelEditing()
    }
  }

  const updateSessionTitleFromMessage = async (sessionId: string, firstMessage: string) => {
    try {
      const title = firstMessage.length > 50 ? firstMessage.substring(0, 50).trim() + "..." : firstMessage.trim()

      const { error } = await supabase.from("chat_sessions").update({ title }).eq("id", sessionId)

      if (error) {
        console.error("Error updating session title:", error)
        return
      }

      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title } : s)))
    } catch (error) {
      console.error("Error updating session title:", error)
    }
  }

  useEffect(() => {
    if (onUpdateSessionTitle) {
      onUpdateSessionTitle = updateSessionTitleFromMessage
    }
  }, [onUpdateSessionTitle])

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <>
      {isOpen && isMobile && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div
        className={`h-full ${
          hasBackgroundImage
            ? "bg-white/20 dark:bg-gray-900/20 backdrop-blur-md"
            : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md"
        } border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          // Mobile: fixed positioning with slide animation
          isMobile
            ? `fixed top-0 left-0 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} w-80`
            : // Desktop: static positioning with width changes only
              `relative ${shouldBeExpanded ? "w-80" : "w-16"}`
        }`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`p-4 border-b ${
              hasBackgroundImage ? "border-white/30 dark:border-gray-600/30" : "border-gray-200 dark:border-gray-700"
            }`}
          >
            {/* Back button - now positioned above New Chat */}
            <div className="mb-3">
              <Button
                onClick={() => router.push("/home")}
                variant="ghost"
                size="sm"
                className={`${shouldBeExpanded ? "w-full justify-start" : "w-8 h-8 p-0"} ${
                  hasBackgroundImage
                    ? "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-white/30 text-gray-700"
                    : "bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700"
                } rounded-lg shadow-sm`}
              >
                <ArrowLeft className="w-4 h-4" />
                {shouldBeExpanded && <span className="ml-2">Back to Home</span>}
              </Button>
            </div>

            {/* New Chat button */}
            <Button
              onClick={createNewSession}
              className={`${shouldBeExpanded ? "w-full" : "w-8 h-8 p-0"} bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white`}
            >
              <Plus className="w-4 h-4" />
              {shouldBeExpanded && <span className="ml-2">New Chat</span>}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${shouldBeExpanded ? "h-12" : "h-8 w-8"} ${
                      hasBackgroundImage ? "bg-white/20 dark:bg-gray-600/20" : "bg-gray-200 dark:bg-gray-700"
                    } rounded-lg animate-pulse`}
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              shouldBeExpanded && (
                <div className="text-center py-8">
                  <MessageSquare
                    className={`w-12 h-12 mx-auto mb-3 ${hasBackgroundImage ? "text-white/60" : "text-gray-400"}`}
                  />
                  <p className={`text-sm ${hasBackgroundImage ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
                    No {currentMode} chats yet. Start a new conversation!
                  </p>
                </div>
              )
            ) : (
              shouldBeExpanded && (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative rounded-lg border transition-all duration-200 cursor-pointer p-3 ${
                        currentSessionId === session.id
                          ? hasBackgroundImage
                            ? "bg-white/30 border-white/40"
                            : "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700"
                          : hasBackgroundImage
                            ? "bg-white/10 border-white/20 hover:bg-white/20"
                            : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => {
                        if (editingId !== session.id) {
                          onSessionSelect(session.id)
                          if (isMobile) onClose()
                        }
                      }}
                    >
                      {editingId === session.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, session.id)}
                          onBlur={() => updateSessionTitle(session.id, editTitle)}
                          className={`text-sm bg-transparent border-none p-0 h-auto focus:ring-0 ${
                            hasBackgroundImage ? "text-white placeholder-white/60" : ""
                          }`}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-sm font-medium truncate ${
                                hasBackgroundImage ? "text-white" : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {session.title}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${
                                hasBackgroundImage ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {formatTimestamp(session.updated_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditing(session)
                              }}
                              className={`h-6 w-6 p-0 ${
                                hasBackgroundImage
                                  ? "text-white/60 hover:text-white"
                                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSession(session.id)
                              }}
                              className={`h-6 w-6 p-0 ${
                                hasBackgroundImage
                                  ? "text-white/60 hover:text-red-300"
                                  : "text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
