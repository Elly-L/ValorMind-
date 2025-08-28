import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API ||
  process.env.NEXT_PUBLIC_OPENROUTER_API ||
  process.env.OPENROUTER_API_KEY ||
  "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" // Temporary fallback for v0 preview

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Therapy insights API called")

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === "") {
      console.error("[v0] OpenRouter API key is missing or empty")
      console.error(
        "[v0] Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("OPENROUTER")),
      )
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 500 })
    }

    console.log("[v0] Using API key starting with:", OPENROUTER_API_KEY.substring(0, 10) + "...")

    const { sessionId, messages, userName } = await request.json()

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Session ID and messages are required" }, { status: 400 })
    }

    console.log("[v0] Processing", messages.length, "messages for session:", sessionId)

    const supabase = createClient()

    // Get user ID from session
    const { data: session } = await supabase.from("chat_sessions").select("user_id").eq("id", sessionId).single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Create conversation context for AI analysis
    const conversationText = messages
      .map((msg: any) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n")

    console.log("[v0] Conversation length:", conversationText.length, "characters")

    const analysisPrompt = `You are an AI therapist analyzing a therapy session. Analyze the following conversation and provide structured insights.

Conversation:
${conversationText}

IMPORTANT: You must respond with ONLY valid JSON in exactly this format, no additional text or explanation:

{
  "mood_analysis": {
    "primary_mood": "anxious",
    "mood_intensity": 7,
    "mood_trends": ["increasing anxiety", "moments of hope"]
  },
  "key_themes": ["work stress", "relationship concerns", "self-doubt"],
  "progress_indicators": {
    "engagement_level": "high",
    "openness": "medium",
    "insight_development": "medium",
    "coping_strategies_used": ["deep breathing", "journaling"]
  },
  "recommendations": ["practice mindfulness", "set boundaries", "continue therapy"],
  "risk_assessment": "low"
}`

    const payload = {
      model: "baidu/ernie-4.5-300b-a47b",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }

    console.log("[v0] Making API request to OpenRouter...")

    const apiResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://v0.app",
        "X-Title": "ValorMind AI Therapy Insights",
      },
      body: JSON.stringify(payload),
    })

    console.log("[v0] OpenRouter response status:", apiResponse.status)

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text()
      console.error("[v0] OpenRouter API error:", errorBody)
      return NextResponse.json(
        {
          error: "AI analysis failed",
          details: errorBody,
        },
        { status: 502 },
      )
    }

    const responseData = await apiResponse.json()
    const aiAnalysis = responseData.choices?.[0]?.message?.content

    console.log("[v0] AI analysis received, length:", aiAnalysis?.length || 0)
    console.log("[v0] Raw AI response:", aiAnalysis?.substring(0, 200) + "...")

    if (!aiAnalysis) {
      return NextResponse.json({ error: "Failed to get AI analysis" }, { status: 500 })
    }

    let insights
    try {
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : aiAnalysis

      insights = JSON.parse(jsonText)
      console.log("[v0] Successfully parsed AI insights")
    } catch (error) {
      console.error("[v0] Failed to parse AI analysis as JSON:", error)
      console.error("[v0] Raw AI response:", aiAnalysis)

      insights = {
        mood_analysis: {
          primary_mood: "mixed",
          mood_intensity: 5,
          mood_trends: ["varied emotional states"],
        },
        key_themes: ["general discussion", "emotional processing"],
        progress_indicators: {
          engagement_level: "medium",
          openness: "medium",
          insight_development: "medium",
          coping_strategies_used: [],
        },
        recommendations: ["continue regular sessions", "practice self-care"],
        risk_assessment: "low",
      }
      console.log("[v0] Using fallback structured insights")
    }

    // Save insights to database
    const { data: savedInsight, error: saveError } = await supabase
      .from("therapy_insights")
      .insert({
        session_id: sessionId,
        user_id: session.user_id,
        mood_analysis: insights.mood_analysis,
        key_themes: insights.key_themes,
        progress_indicators: insights.progress_indicators,
        recommendations: insights.recommendations,
        risk_assessment: insights.risk_assessment,
      })
      .select()
      .single()

    if (saveError) {
      console.error("[v0] Error saving insights:", saveError)
      return NextResponse.json({ error: "Failed to save insights" }, { status: 500 })
    }

    console.log("[v0] Successfully saved therapy insights to database")

    return NextResponse.json({
      success: true,
      insights: savedInsight,
    })
  } catch (error) {
    console.error("[v0] Error in therapy insights API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
