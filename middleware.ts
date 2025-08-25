import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth routes and static files
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user and trying to access protected routes, redirect to login
    if (!user && pathname !== "/") {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // If user exists, refresh the session
    if (user) {
      const response = NextResponse.next()
      await supabase.auth.getSession()
      return response
    }

    return NextResponse.next()
  } catch (error) {
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
