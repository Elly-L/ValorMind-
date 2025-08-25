"use client"

import { useEffect, useState } from "react"
import ChatInterface from "@/components/chat-interface"
import { createClient } from "@/lib/supabase"

export default function TherapistModePage() {
  const [userName, setUserName] = useState<string>()
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("user_profiles").select("name").eq("user_id", user.id).single()

      if (data?.name) {
        setUserName(data.name)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  return <ChatInterface mode="therapist" userName={userName} />
}
