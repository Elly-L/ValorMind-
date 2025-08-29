"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import LoadingSpinner from "@/components/loading-spinner"

export default function RootPage() {
  const [loading, setLoading] = useState(true)
  const [displayText, setDisplayText] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const fullText = "ValorMind AI"

  useEffect(() => {
    checkAuthAndRedirect()
  }, [])

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 150)

    return () => clearInterval(typingInterval)
  }, [])

  const checkAuthAndRedirect = async () => {
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
        router.push("/auth/login")
        return
      }

      if (!profile || !profile.onboarding_completed) {
        router.push("/home")
        return
      }

      router.push("/home")
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg mb-4">
          {displayText}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-light">
          Your AI companion for mental wellness
        </p>
      </div>
    </div>
  )
}
