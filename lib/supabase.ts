import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = "https://zurrfnpypdvvdzumttxr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cnJmbnB5cGR2dmR6dW10dHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjUwMjYsImV4cCI6MjA3MTcwMTAyNn0.EqFRV6qDrJK5xer6niCtChV9xfltkY_f0rl38FvxHiY"

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Types for our database
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  name: string
  mood?: string
  theme?: "light" | "dark"
  persona?: "friend" | "therapist"
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  mode: "friend" | "therapist"
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  content: string
  role: "user" | "assistant"
  attachments?: string[]
  created_at: string
}
