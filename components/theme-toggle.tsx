"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadUserTheme()
  }, [])

  const loadUserTheme = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase.from("user_profiles").select("theme").eq("user_id", user.id).single()

      if (profile?.theme) {
        setTheme(profile.theme)
        applyTheme(profile.theme)
      }
    } catch (error) {
      console.error("Error loading user theme:", error)
    }
  }

  const applyTheme = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleThemeToggle = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    applyTheme(newTheme)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("user_profiles").update({ theme: newTheme }).eq("user_id", user.id)
      }
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 hover:bg-gradient-to-br hover:from-slate-100 hover:via-pink-100 hover:to-purple-100 text-gray-800 border border-white/50 shadow-lg rounded-full p-3"
      >
        <Sun className="w-5 h-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeToggle}
      className={`fixed top-4 right-4 z-50 ${
        theme === "light"
          ? "bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50 hover:bg-gradient-to-br hover:from-slate-100 hover:via-pink-100 hover:to-purple-100"
          : "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 hover:bg-gradient-to-br hover:from-gray-800 hover:via-slate-700 hover:to-gray-800"
      } text-gray-800 dark:text-gray-200 border border-white/50 dark:border-gray-700/50 shadow-lg rounded-full p-3 transition-all duration-200 hover:shadow-xl`}
      title={theme === "dark" ? "Switch to Clean & Bright" : "Switch to Moody & Minimal"}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  )
}
