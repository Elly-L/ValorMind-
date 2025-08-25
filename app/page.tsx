"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import OnboardingModal from "@/components/onboarding-modal"
import { QuoteCard } from "@/components/quote-card"
import { ModeCard } from "@/components/mode-card"
import { MoodTrackerPreview } from "@/components/mood-tracker-preview"
import { ProgressWidget } from "@/components/progress-widget"
import { GradientIcon } from "@/components/gradient-icon"
import { Heart, Brain, Video, Wind, BookOpen, Target, MessageSquare, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/loading-spinner"
import type { UserProfile } from "@/lib/supabase"

const quotes = [
  {
    text: "Every small step forward is progress.",
    author: "ValorMind AI",
  },
  {
    text: "You are stronger than you think.",
    author: "AI Companion",
  },
  {
    text: "Healing takes time. Be patient with your progress.",
    author: "AI Therapist",
  },
]

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [userMood, setUserMood] = useState<string>()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndProfile()
  }, [])

  const checkAuthAndProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user has a profile
      const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        setLoading(false)
        return
      }

      if (!profile || !profile.onboarding_completed) {
        setShowOnboarding(true)
      } else {
        setUserProfile(profile)
        setUserName(profile.name || user.email?.split("@")[0] || "Friend")
        setUserMood(profile.mood || undefined)

        // Apply saved theme
        if (profile.theme === "dark") {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = async (onboardingData: {
    name: string
    mood: string
    theme: "light" | "dark"
    persona: "friend" | "therapist"
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Create or update user profile
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          name: onboardingData.name,
          mood: onboardingData.mood,
          theme: onboardingData.theme,
          persona: onboardingData.persona,
          onboarding_completed: true,
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving profile:", error)
        return
      }

      setUserProfile(profile)
      setUserName(onboardingData.name)
      setUserMood(onboardingData.mood)
      setShowOnboarding(false)

      // Apply theme
      if (onboardingData.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleModeClick = (mode: string) => {
    switch (mode) {
      case "friend":
        router.push("/friend")
        break
      case "therapist":
        router.push("/therapist")
        break
      case "avatar":
        // TODO: Implement avatar therapy
        console.log("Avatar therapy coming soon")
        break
      case "vent":
        // TODO: Implement vent mode
        console.log("Vent mode coming soon")
        break
      case "journal":
        // TODO: Implement journal
        console.log("Journal coming soon")
        break
      case "exercises":
        // TODO: Implement exercises
        console.log("Exercises coming soon")
        break
      case "secrets":
        // TODO: Implement secrets room
        console.log("Secrets room coming soon")
        break
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (showOnboarding) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />
  }

  // Get random quote for the day
  const todayQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Hey {userName},</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Ready to check in with yourself?</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <main className="space-y-8">
          {/* Quote of the Day */}
          <QuoteCard quote={todayQuote.text} author={todayQuote.author} userMood={userMood} />

          {/* Main Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModeCard
              title="Friend Mode"
              description="Chat with a supportive friend."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-blue-400 to-blue-600">
                  <Heart size={24} fill="white" />
                </GradientIcon>
              }
              color="primary"
              onClick={() => handleModeClick("friend")}
            />
            <ModeCard
              title="Therapist Mode"
              description="Guided sessions with an AI therapist."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-teal-400 to-teal-600">
                  <Brain size={24} />
                </GradientIcon>
              }
              color="secondary"
              onClick={() => handleModeClick("therapist")}
            />
            <ModeCard
              title="Avatar Therapy"
              description="Immersive therapy with AI avatar."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-indigo-400 via-blue-400 to-teal-400">
                  <Video size={24} />
                </GradientIcon>
              }
              color="info"
              isPremium
              onClick={() => handleModeClick("avatar")}
            />
            <ModeCard
              title="Vent Mode"
              description="A safe place to let it all out."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-orange-400 to-orange-600">
                  <Wind size={24} />
                </GradientIcon>
              }
              color="accent"
              onClick={() => handleModeClick("vent")}
            />
            <ModeCard
              title="Journal"
              description="Reflect on your day, your thoughts."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-blue-400 to-blue-600">
                  <BookOpen size={24} />
                </GradientIcon>
              }
              color="info"
              onClick={() => handleModeClick("journal")}
            />
            <ModeCard
              title="Exercises"
              description="Breathing tutorials and mindfulness tasks with step-by-step guidance."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-teal-400 to-emerald-500">
                  <Target size={24} />
                </GradientIcon>
              }
              onClick={() => handleModeClick("exercises")}
            />
            <ModeCard
              title="Secrets Room"
              description="Share anonymously and support others with kindness."
              icon={
                <GradientIcon gradient="bg-gradient-to-br from-slate-500 to-gray-600">
                  <MessageSquare size={24} />
                </GradientIcon>
              }
              onClick={() => handleModeClick("secrets")}
            />
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodTrackerPreview />
            <ProgressWidget />
          </div>
        </main>

        {/* Debug button to restart onboarding */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Restart Onboarding
          </button>
        </div>
      </div>
    </div>
  )
}
