import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = "https://zurrfnpypdvvdzumttxr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cnJmbnB5cGR2dmR6dW10dHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjUwMjYsImV4cCI6MjA3MTcwMTAyNn0.EqFRV6qDrJK5xer6niCtChV9xfltkY_f0rl38FvxHiY"

// Server-side Supabase client for use in Server Components and Server Actions
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
