import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY = process.env.OPENROUTER_API || ""

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messages, userName } = await request.json()

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json({ error: "Session ID and messages are required" }, { status: 400 })
    }

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

    const analysisPrompt = `
You are an AI therapist analyzing a therapy session. Analyze the following conversation and provide structured insights.

Conversation:
${conversationText}

Please provide a JSON response with the following structure:
{
  "mood_analysis": {
    "primary_mood": "string (e.g., anxious, depressed, hopeful, etc.)",
    "mood_intensity": "number (1-10)",
    "mood_trends": ["array of mood patterns observed"]
  },
  "key_themes": ["array of 3-5 main themes discussed"],
  "progress_indicators": {
    "engagement_level": "string (high/medium/low)",
    "openness": "string (high/medium/low)",
    "insight_development": "string (high/medium/low)",
    "coping_strategies_used": ["array of strategies mentioned"]
  },
  "recommendations": ["array of 3-5 therapeutic recommendations"],
  "risk_assessment": "string (low/medium/high)"
}

Focus on:
- Emotional patterns and mood indicators
- Therapeutic progress and engagement
- Coping mechanisms and resilience factors
- Areas needing attention or support
- Risk factors for mental health concerns

Respond only with valid JSON.`

    const payload = {
      model: "baidu/ernie-4.5-300b-a47b",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }

    const apiResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://v0.app",
        "X-Title": "ValorMind AI Therapy Insights",
      },
      body: JSON.stringify(payload),
    })

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text()
      console.error("OpenRouter API error:", errorBody)
      return NextResponse.json({ error: "AI analysis failed" }, { status: 502 })
    }

    const responseData = await apiResponse.json()
    const aiAnalysis = responseData.choices?.[0]?.message?.content

    if (!aiAnalysis) {
      return NextResponse.json({ error: "Failed to get AI analysis" }, { status: 500 })
    }

    // Parse AI response
    let insights
    try {
      insights = JSON.parse(aiAnalysis)
    } catch (error) {
      console.error("Failed to parse AI analysis:", error)
      return NextResponse.json({ error: "Invalid AI analysis format" }, { status: 500 })
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
      console.error("Error saving insights:", saveError)
      return NextResponse.json({ error: "Failed to save insights" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      insights: savedInsight,
    })
  } catch (error) {
    console.error("Error in therapy insights API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
