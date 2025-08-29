"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Menu, Palette, Paperclip, X, ImageIcon, Type, FileText, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { performSafetyCheck } from "../lib/ai-personality"
import type { AIMode } from "../lib/ai-personality"
import { FormattedText } from "../lib/text-formatter"
import ChatSidebar from "./chat-sidebar"
import WelcomeScreen from "./welcome-screen"
import ImageBackgroundModal from "./image-background-modal"
import TutorialOverlay from "./tutorial-overlay"
import SmartBackgroundDiscovery from "./smart-background-discovery"
import TherapyNotesPanel from "./therapy-notes-panel"
import { createClient } from "@/lib/supabase"
import type { ChatMessage } from "@/lib/supabase"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isSafetyResponse?: boolean
  attachments?: string[]
}

interface ChatInterfaceProps {
  mode: AIMode
  userName?: string
}

export default function ChatInterface({ mode, userName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGradient, setSelectedGradient] = useState("default")
  const [userMessageBg, setUserMessageBg] = useState("default")
  const [showMenu, setShowMenu] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [selectedFont, setSelectedFont] = useState("default")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [firstMessageSent, setFirstMessageSent] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [userProfile, setUserProfile] = useState<{ gender?: string } | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string | null>(null)
  const [showTherapyNotes, setShowTherapyNotes] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const fontOptions = {
    default: { name: "Default", class: "font-sans" },
    "elegant-script": { name: "Elegant Script", class: "font-elegant-script" },
    handwritten: { name: "Handwritten", class: "font-handwritten" },
    calligraphy: { name: "Calligraphy", class: "font-calligraphy" },
    "modern-script": { name: "Modern Script", class: "font-modern-script" },
    "classic-serif": { name: "Classic Serif", class: "font-classic-serif" },
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMounted(true)
    loadUserProfile()
    const tutorialSeen = localStorage.getItem("valormind-tutorial-seen")
    const savedFont = localStorage.getItem("valormind-selected-font")
    if (savedFont && fontOptions[savedFont as keyof typeof fontOptions]) {
      setSelectedFont(savedFont)
    }

    if (!tutorialSeen) {
      setShowTutorial(true)
    }

    setHasSeenTutorial(!!tutorialSeen)
  }, [mode])

  const handleFontSelect = (fontKey: string) => {
    setSelectedFont(fontKey)
    localStorage.setItem("valormind-selected-font", fontKey)
    setShowFontMenu(false)
  }

  const getCurrentFontClass = () => {
    return fontOptions[selectedFont as keyof typeof fontOptions]?.class || "font-sans"
  }

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("user_profiles").select("gender").eq("user_id", user.id).single()

      setUserProfile(data)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const handleStartConversation = async (prompt: string) => {
    setShowWelcome(false)
    await createNewSession()

    // Send the user's prompt as first message after session is created
    setTimeout(() => {
      setInputValue(prompt)
      setTimeout(() => {
        sendMessage(prompt)
      }, 100)
    }, 100) // Reduced timeout since session creation is now awaited
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
          title: `New ${mode} chat`,
          mode: mode,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating session:", error)
        return
      }

      setCurrentSessionId(data.id)
      console.log("[v0] Session created successfully:", data.id)
      setFirstMessageSent(false)
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading messages:", error)
        return
      }

      const loadedMessages: Message[] = data.map((msg: ChatMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === "user" ? "user" : "ai",
        timestamp: new Date(msg.created_at),
        attachments: msg.attachments || [],
      }))

      setMessages(loadedMessages)
      setCurrentSessionId(sessionId)
      setFirstMessageSent(loadedMessages.some((msg) => msg.sender === "user"))
      setShowWelcome(false)
    } catch (error) {
      console.error("Error loading session:", error)
    }
  }

  const saveMessage = async (message: Message) => {
    if (!currentSessionId) {
      console.error("[v0] Cannot save message - no session ID. Message:", message.content.substring(0, 50))
      return
    }

    try {
      console.log(
        "[v0] Saving message to session:",
        currentSessionId,
        "Sender:",
        message.sender,
        "Content:",
        message.content.substring(0, 50),
      )

      const { error: insertError } = await supabase.from("chat_messages").insert({
        session_id: currentSessionId,
        content: message.content,
        role: message.sender === "user" ? "user" : "assistant",
        attachments: message.attachments || [],
      })

      if (insertError) {
        console.error("[v0] Error inserting message:", insertError)
        return
      }

      console.log("[v0] Message saved successfully")

      if (message.sender === "user" && !firstMessageSent) {
        const title =
          message.content.length > 50 ? message.content.substring(0, 50).trim() + "..." : message.content.trim()

        console.log("[v0] Updating session title for first message:", title)

        const { error: updateError } = await supabase
          .from("chat_sessions")
          .update({
            title,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSessionId)

        if (updateError) {
          console.error("[v0] Error updating session title:", updateError)
        } else {
          console.log("[v0] Session title updated successfully")
        }

        setFirstMessageSent(true)
      } else {
        // Update session timestamp for all other messages
        await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", currentSessionId)
      }
    } catch (error) {
      console.error("[v0] Error in saveMessage:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async (prompt?: string) => {
    const messageContent = prompt || inputValue
    if ((!messageContent.trim() && attachments.length === 0) || isLoading) return

    const safetyResponse = performSafetyCheck(messageContent)
    if (safetyResponse) {
      const safetyMessage: Message = {
        id: Date.now().toString(),
        content: safetyResponse,
        sender: "ai",
        timestamp: new Date(),
        isSafetyResponse: true,
      }
      setMessages((prev) => [...prev, safetyMessage])
      await saveMessage(safetyMessage)
      setInputValue("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date(),
      attachments: attachments.map((file) => file.name),
    }

    setMessages((prev) => [...prev, userMessage])
    await saveMessage(userMessage)
    setInputValue("")
    setAttachments([])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          mode,
          userName: userName || "Friend",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.text,
        sender: "ai",
        timestamp: new Date(),
        isSafetyResponse: data.isSafetyResponse,
      }

      setMessages((prev) => [...prev, aiMessage])
      await saveMessage(aiMessage)

      if (
        (mode === "therapist" || mode === "avatar-therapy") &&
        currentSessionId &&
        [...messages, userMessage, aiMessage].filter((m) => m.sender === "user").length >= 3
      ) {
        // Generate insights in background after session has enough content
        setTimeout(async () => {
          try {
            await fetch("/api/therapy-insights", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: currentSessionId,
                messages: [...messages, userMessage, aiMessage],
                userName: userName || "User",
              }),
            })
          } catch (error) {
            console.error("Background insight generation failed:", error)
          }
        }, 2000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      await saveMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setFirstMessageSent(false)
    setShowWelcome(true)
    setSelectedBackgroundImage(null)
  }

  const handleBackToWelcome = () => {
    setShowWelcome(true)
    setMessages([])
    setCurrentSessionId(null)
    setFirstMessageSent(false)
    setSelectedBackgroundImage(null)
  }

  const gradientOptions = {
    default: {
      bg: "bg-gradient-to-br from-magenta-100 via-pink-50 to-fuchsia-100",
      color: "bg-gradient-to-br from-magenta-400 to-fuchsia-400",
    },
    sunset: {
      bg: "bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100",
      color: "bg-gradient-to-br from-orange-400 to-purple-400",
    },
    ocean: {
      bg: "bg-gradient-to-br from-blue-100 via-teal-50 to-cyan-100",
      color: "bg-gradient-to-br from-blue-400 to-cyan-400",
    },
    forest: {
      bg: "bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100",
      color: "bg-gradient-to-br from-green-400 to-teal-400",
    },
    lavender: {
      bg: "bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100",
      color: "bg-gradient-to-br from-purple-400 to-indigo-400",
    },
  }

  const userMessageBgOptions = {
    default: {
      bg: "bg-gradient-to-r from-pink-200/60 to-purple-200/60 text-gray-800",
      color: "bg-gradient-to-r from-pink-500 to-purple-500",
    },
    blue: {
      bg: "bg-gradient-to-r from-blue-200/60 to-teal-200/60 text-gray-800",
      color: "bg-gradient-to-r from-blue-500 to-teal-500",
    },
    orange: {
      bg: "bg-gradient-to-r from-orange-200/60 to-red-200/60 text-gray-800",
      color: "bg-gradient-to-r from-orange-400 to-red-500",
    },
    green: {
      bg: "bg-gradient-to-r from-green-200/60 to-emerald-200/60 text-gray-800",
      color: "bg-gradient-to-r from-green-400 to-emerald-500",
    },
    purple: {
      bg: "bg-gradient-to-r from-purple-200/60 to-indigo-200/60 text-gray-800",
      color: "bg-gradient-to-r from-purple-500 to-indigo-500",
    },
  }

  const aiBubbleBgOptions = {
    default:
      "bg-gradient-to-r from-slate-50/90 to-blue-50/90 backdrop-blur-sm border border-slate-200/40 text-gray-800 shadow-sm",
    sunset:
      "bg-gradient-to-r from-orange-50/90 to-pink-50/90 backdrop-blur-sm border border-orange-200/40 text-gray-800 shadow-sm",
    ocean:
      "bg-gradient-to-r from-blue-50/90 to-teal-50/90 backdrop-blur-sm border border-blue-200/40 text-gray-800 shadow-sm",
    forest:
      "bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200/40 text-gray-800 shadow-sm",
    lavender:
      "bg-gradient-to-r from-purple-50/90 to-indigo-50/90 backdrop-blur-sm border border-purple-200/40 text-gray-800 shadow-sm",
  }

  const modeStyles = {
    friend: {
      background: gradientOptions[selectedGradient as keyof typeof gradientOptions].bg,
      userBubble: userMessageBgOptions[userMessageBg as keyof typeof userMessageBgOptions].bg,
      aiBubble: aiBubbleBgOptions[selectedGradient as keyof typeof aiBubbleBgOptions],
      header: "ValorMind AI",
      inputBg: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
    },
    therapist: {
      background: gradientOptions[selectedGradient as keyof typeof gradientOptions].bg,
      userBubble: userMessageBgOptions[userMessageBg as keyof typeof userMessageBgOptions].bg,
      aiBubble: aiBubbleBgOptions[selectedGradient as keyof typeof aiBubbleBgOptions],
      header: "ValorMind AI",
      inputBg: "bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm",
    },
    vent: {
      background: gradientOptions[selectedGradient as keyof typeof gradientOptions].bg,
      userBubble: userMessageBgOptions[userMessageBg as keyof typeof userMessageBgOptions].bg,
      aiBubble: aiBubbleBgOptions[selectedGradient as keyof typeof aiBubbleBgOptions],
      header: "ValorMind AI",
      inputBg: "bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm",
    },
    journal: {
      background: gradientOptions[selectedGradient as keyof typeof gradientOptions].bg,
      userBubble: userMessageBgOptions[userMessageBg as keyof typeof userMessageBgOptions].bg,
      aiBubble: aiBubbleBgOptions[selectedGradient as keyof typeof aiBubbleBgOptions],
      header: "ValorMind AI",
      inputBg: "bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm",
    },
    "avatar-therapy": {
      background: gradientOptions[selectedGradient as keyof typeof gradientOptions].bg,
      userBubble: userMessageBgOptions[userMessageBg as keyof typeof userMessageBgOptions].bg,
      aiBubble: aiBubbleBgOptions[selectedGradient as keyof typeof aiBubbleBgOptions],
      header: "ValorMind AI",
      inputBg: "bg-white/60 dark:bg-gray-900/80 backdrop-blur-sm",
    },
  }

  const currentStyle = {
    ...modeStyles[mode],
    background: selectedBackgroundImage ? `bg-cover bg-center bg-no-repeat` : modeStyles[mode].background,
    backgroundImage: selectedBackgroundImage || undefined,
  }

  const handleBackgroundImageSelect = (imageUrl: string) => {
    setSelectedBackgroundImage(imageUrl)
    setShowImageModal(false)
    setTimeout(() => {
      setShowMenu(false)
    }, 300)
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem("valormind-tutorial-seen", "true")
  }

  const handleTutorialClose = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem("valormind-tutorial-seen", "true")
  }

  if (showWelcome && messages.length === 0) {
    return (
      <WelcomeScreen
        mode={mode}
        onStartConversation={handleStartConversation}
        onBack={handleBackToWelcome}
        userGender={userProfile?.gender}
        userName={userName}
      />
    )
  }

  return (
    <div
      className="flex h-screen"
      style={
        selectedBackgroundImage
          ? {
              backgroundImage: `url(${selectedBackgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: "100vh",
            }
          : {}
      }
    >
      {selectedBackgroundImage && <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-0" />}

      <ChatSidebar
        currentMode={mode}
        currentSessionId={currentSessionId}
        onSessionSelect={loadSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={setSidebarCollapsed}
        hasBackgroundImage={!!selectedBackgroundImage}
      />

      {/* Main chat area */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          selectedBackgroundImage ? "relative z-10" : currentStyle.background
        } ${
          sidebarOpen && !window.matchMedia("(min-width: 1024px)").matches
            ? "lg:ml-0"
            : sidebarCollapsed
              ? "lg:ml-16"
              : "lg:ml-80"
        }`}
      >
        <div className="sticky top-0 z-10 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border-b border-white/30 dark:border-gray-700/30 p-4 relative">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => router.push("/")}
                className="bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-800 dark:text-gray-200 border border-white/50 dark:border-gray-700/50 shadow-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className={`text-xl font-semibold text-gray-800 dark:text-gray-200 ${getCurrentFontClass()}`}>
                {currentStyle.header}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                  mode === "friend"
                    ? "bg-blue-100/80 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-700/60"
                    : mode === "therapist" || mode === "avatar-therapy"
                      ? "bg-purple-100/80 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-700/60"
                      : mode === "vent"
                        ? "bg-orange-100/80 dark:bg-orange-900/80 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-700/60"
                        : mode === "journal"
                          ? "bg-green-100/80 dark:bg-green-900/80 text-green-700 dark:text-green-300 border-green-200/60 dark:border-green-700/60"
                          : "bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700/60"
                }`}
              >
                {mode === "friend"
                  ? "Friend"
                  : mode === "therapist" || mode === "avatar-therapy"
                    ? "Therapy"
                    : mode === "vent"
                      ? "Vent"
                      : mode === "journal"
                        ? "Journal"
                        : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </div>
            <div className="relative flex items-center gap-2">
              <SmartBackgroundDiscovery
                messageCount={messages.filter((m) => m.sender === "user").length}
                onThemeButtonClick={() => setShowMenu(true)}
                isThemeMenuOpen={showMenu}
              />
              {mounted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 relative z-10"
                  title="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              )}
              {(mode === "therapist" || mode === "avatar-therapy") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTherapyNotes(true)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 relative z-10"
                  title="Therapy Notes"
                >
                  <FileText className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFontMenu(!showFontMenu)
                  setShowMenu(false)
                }}
                className="text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 relative z-10"
                data-tutorial="font-button"
              >
                <Type className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMenu(!showMenu)
                  setShowFontMenu(false)
                }}
                className="text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 relative z-10"
                data-tutorial="theme-button"
              >
                <Palette className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showFontMenu && (
            <div className="max-w-2xl mx-auto mt-4 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30 relative">
              <Button
                onClick={() => setShowFontMenu(false)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-red-500 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="space-y-2" data-tutorial="font-selector">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 mr-2" />
                  Font Style
                </h3>
                {Object.entries(fontOptions).map(([key, font]) => (
                  <button
                    key={key}
                    onClick={() => handleFontSelect(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-white/60 dark:hover:bg-gray-800/60 ${
                      selectedFont === key ? "bg-purple-500 text-white" : "bg-white/40 text-gray-800 dark:text-gray-200"
                    } ${font.class}`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showMenu && (
            <div className="max-w-2xl mx-auto mt-4 p-4 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-xl border border-white/30 dark:border-gray-700/30 relative">
              <Button
                onClick={() => setShowMenu(false)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-red-500 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div data-tutorial="background-themes">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Theme
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(gradientOptions).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedGradient(key)
                          setSelectedBackgroundImage(null)
                          setShowMenu(false)
                        }}
                        className={`w-8 h-8 rounded-full ${option.color} border-2 transition-all hover:scale-110 ${
                          selectedGradient === key && !selectedBackgroundImage
                            ? "border-gray-800 shadow-lg"
                            : "border-white/50 dark:border-gray-700/50"
                        }`}
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <div data-tutorial="background-images">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Background Image
                  </label>
                  <Button
                    onClick={() => setShowImageModal(true)}
                    variant="outline"
                    size="sm"
                    className={`bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 border-2 transition-all ${
                      selectedBackgroundImage ? "border-pink-500 shadow-lg" : "border-white/50 dark:border-gray-700/50"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  {selectedBackgroundImage && (
                    <Button
                      onClick={() => {
                        setSelectedBackgroundImage(null)
                        setShowMenu(false)
                      }}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div data-tutorial="message-bubbles">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Message Bubble Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(userMessageBgOptions).map(([key, option]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setUserMessageBg(key)
                          setShowMenu(false)
                        }}
                        className={`w-8 h-8 rounded-full ${option.color} border-2 transition-all hover:scale-110 ${
                          userMessageBg === key
                            ? "border-gray-800 shadow-lg"
                            : "border-white/50 dark:border-gray-700/50"
                        }`}
                        title={key === "default" ? "Pink-Purple" : key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setShowMenu(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-white/50 dark:border-gray-700/50 px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
          <div
            className={`mx-auto space-y-4 transition-all duration-300 ${sidebarCollapsed ? "max-w-4xl" : "max-w-2xl"}`}
          >
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/20 ${
                    message.sender === "user"
                      ? `${currentStyle.userBubble} shadow-lg`
                      : `${currentStyle.aiBubble} shadow-lg`
                  } ${message.isSafetyResponse ? "border-2 border-red-300 bg-red-50/90" : ""} ${
                    mode === "friend" ? "animate-bounce-in" : "animate-fade-in"
                  } ${getCurrentFontClass()}`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2">
                      {message.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="text-xs bg-black/10 dark:bg-gray-800/10 rounded px-2 py-1 mb-1 inline-block mr-1"
                        >
                          📎 {attachment}
                        </div>
                      ))}
                    </div>
                  )}
                  <FormattedText text={message.content} className="text-sm leading-relaxed" />
                  <p
                    className={`text-xs mt-1 opacity-70 ${message.sender === "user" ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-300"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-xs px-4 py-3 rounded-2xl ${currentStyle.aiBubble} ${getCurrentFontClass()}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div
          className={`fixed bottom-0 right-0 p-4 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border-t border-white/30 dark:border-gray-700/30 transition-all duration-300 ${
            sidebarOpen && !window.matchMedia("(min-width: 1024px)").matches
              ? "left-0"
              : sidebarCollapsed
                ? "left-0 lg:left-16"
                : "left-0 lg:left-80"
          }`}
        >
          <div className={`mx-auto transition-all duration-300 ${sidebarCollapsed ? "max-w-4xl" : "max-w-2xl"}`}>
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="truncate max-w-32">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-4 w-4 p-0 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`flex items-center space-x-2 ${currentStyle.inputBg} rounded-full p-2 border border-white/20 dark:border-gray-700/20`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-2 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-800/20"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === "friend" ? "What's on your mind?" : "Share what you're feeling..."}
                className={`flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200 ${getCurrentFontClass()}`}
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
                size="sm"
                className="rounded-full p-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-none"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ImageBackgroundModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSelectImage={handleBackgroundImageSelect}
        currentImage={selectedBackgroundImage || undefined}
      />

      <TutorialOverlay isVisible={showTutorial} onClose={handleTutorialClose} onComplete={handleTutorialComplete} />
      <TherapyNotesPanel
        isOpen={showTherapyNotes}
        onClose={() => setShowTherapyNotes(false)}
        sessionId={currentSessionId}
        userName={userName}
        messages={messages}
      />
    </div>
  )
}
