"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import OnboardingModal from "@/components/onboarding-modal"
import { QuoteCard } from "@/components/quote-card"
import { ModeCard } from "@/components/mode-card"
import { MoodTrackerPreview } from "@/components/mood-tracker-preview"
import { ProgressWidget } from "@/components/progress-widget"
import { GradientIcon } from "@/components/gradient-icon"
import { ComingSoonModal } from "@/components/coming-soon-modal"
import { Heart, Brain, Video, Wind, BookOpen, Target, MessageSquare, LogOut, ArrowRight, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/loading-spinner"
import type { UserProfile } from "@/lib/supabase"
import ThemeToggle from "@/components/theme-toggle"

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
  const [navigatingMode, setNavigatingMode] = useState<string | null>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [comingSoonFeature, setComingSoonFeature] = useState("")
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
    if (navigatingMode) return

    setNavigatingMode(mode)

    setTimeout(() => {
      switch (mode) {
        case "friend":
          router.push("/friend")
          break
        case "therapist":
          router.push("/therapist")
          break
        case "records":
          router.push("/records")
          break
        case "avatar":
          setComingSoonFeature("Avatar Therapy")
          setShowComingSoon(true)
          setNavigatingMode(null)
          break
        case "vent":
          setComingSoonFeature("Vent Mode")
          setShowComingSoon(true)
          setNavigatingMode(null)
          break
        case "journal":
          setComingSoonFeature("Journal")
          setShowComingSoon(true)
          setNavigatingMode(null)
          break
        case "exercises":
          setComingSoonFeature("Exercises")
          setShowComingSoon(true)
          setNavigatingMode(null)
          break
        case "secrets":
          setComingSoonFeature("Secrets Room")
          setShowComingSoon(true)
          setNavigatingMode(null)
          break
      }
    }, 300)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (showOnboarding) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />
  }

  const todayQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 relative overflow-hidden">
      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} feature={comingSoonFeature} />

      <ThemeToggle />

      <div className="container mx-auto px-6 py-8 max-w-6xl relative z-10">
        <header className="mb-8">
          {/* Mobile layout - profile and sign out at top */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              <img src="/images/hero-team.png" alt="ValorMind AI Community" className="w-full h-full object-cover" />
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile greeting message below profile */}
          <div className="md:hidden mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Hey {userName},</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Ready to check in with yourself?</p>
          </div>

          {/* Desktop layout - original design */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                  <img
                    src="/images/hero-team.png"
                    alt="ValorMind AI Community"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Hey {userName},</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Ready to check in with yourself?</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <main className="space-y-8">
          <QuoteCard quote={todayQuote.text} author={todayQuote.author} userMood={userMood} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative group">
              <ModeCard
                title="Friend Mode"
                description="Chat with a supportive friend."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-blue-400 to-blue-600">
                    <Heart size={24} fill="white" />
                  </GradientIcon>
                }
                image="/images/friendship.png"
                onClick={() => handleModeClick("friend")}
                isLoading={navigatingMode === "friend"}
              />
              <Button
                onClick={() => handleModeClick("friend")}
                disabled={navigatingMode === "friend"}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "friend" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Therapist Mode"
                description="Guided sessions with an AI therapist."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-teal-400 to-teal-600">
                    <Brain size={24} />
                  </GradientIcon>
                }
                image="/images/doctor-brain.png"
                onClick={() => handleModeClick("therapist")}
                isLoading={navigatingMode === "therapist"}
              />
              <Button
                onClick={() => handleModeClick("therapist")}
                disabled={navigatingMode === "therapist"}
                className="absolute bottom-4 right-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "therapist" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Therapy Records"
                description="View your progress and session history."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-purple-400 to-indigo-600">
                    <FileText size={24} />
                  </GradientIcon>
                }
                image="/images/medical-records.png"
                onClick={() => handleModeClick("records")}
                isLoading={navigatingMode === "records"}
              />
              <Button
                onClick={() => handleModeClick("records")}
                disabled={navigatingMode === "records"}
                className="absolute bottom-4 right-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "records" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Avatar Therapy"
                description="Immersive therapy with AI avatar."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-indigo-400 via-blue-400 to-teal-400">
                    <Video size={24} />
                  </GradientIcon>
                }
                image="/images/video-therapy.png"
                isPremium
                onClick={() => handleModeClick("avatar")}
                isLoading={navigatingMode === "avatar"}
              />
              <Button
                onClick={() => handleModeClick("avatar")}
                disabled={navigatingMode === "avatar"}
                className="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "avatar" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Vent Mode"
                description="A safe place to let it all out."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-orange-400 to-orange-600">
                    <Wind size={24} />
                  </GradientIcon>
                }
                image="/images/joy-expression.png"
                onClick={() => handleModeClick("vent")}
                isLoading={navigatingMode === "vent"}
              />
              <Button
                onClick={() => handleModeClick("vent")}
                disabled={navigatingMode === "vent"}
                className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "vent" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Journal"
                description="Reflect on your day, your thoughts."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-blue-400 to-blue-600">
                    <BookOpen size={24} />
                  </GradientIcon>
                }
                image="/images/journal.png"
                onClick={() => handleModeClick("journal")}
                isLoading={navigatingMode === "journal"}
              />
              <Button
                onClick={() => handleModeClick("journal")}
                disabled={navigatingMode === "journal"}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "journal" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Exercises"
                description="Breathing tutorials and mindfulness tasks with step-by-step guidance."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-teal-400 to-emerald-500">
                    <Target size={24} />
                  </GradientIcon>
                }
                image="/images/meditation.png"
                onClick={() => handleModeClick("exercises")}
                isLoading={navigatingMode === "exercises"}
              />
              <Button
                onClick={() => handleModeClick("exercises")}
                disabled={navigatingMode === "exercises"}
                className="absolute bottom-4 right-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "exercises" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="relative group">
              <ModeCard
                title="Secrets Room"
                description="Share anonymously and support others with kindness."
                icon={
                  <GradientIcon gradient="bg-gradient-to-br from-slate-500 to-gray-600">
                    <MessageSquare size={24} />
                  </GradientIcon>
                }
                image="/images/privacy-secret.png"
                onClick={() => handleModeClick("secrets")}
                isLoading={navigatingMode === "secrets"}
              />
              <Button
                onClick={() => handleModeClick("secrets")}
                disabled={navigatingMode === "secrets"}
                className="absolute bottom-4 right-4 bg-slate-500 hover:bg-slate-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                size="sm"
              >
                {navigatingMode === "secrets" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodTrackerPreview />
            <ProgressWidget />
          </div>
        </main>
      </div>
    </div>
  )
}
