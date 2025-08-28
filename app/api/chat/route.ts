import { type NextRequest, NextResponse } from "next/server"
import { getSystemPrompt, performSafetyCheck } from "../../../lib/ai-personality"
import type { AIMode } from "../../../lib/ai-personality"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API || "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"

export async function POST(request: NextRequest) {
  try {
    const { messages, mode, userName } = await request.json()

    console.log("[v0] API Key length:", OPENROUTER_API_KEY?.length || 0)
    console.log("[v0] API Key starts with:", OPENROUTER_API_KEY?.substring(0, 10) || "undefined")
    console.log("[v0] Full API Key for debugging:", OPENROUTER_API_KEY) // Remove this after testing

    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === "") {
      console.error("OpenRouter API key is missing or empty")
      return NextResponse.json({ error: "OpenRouter API key is not configured" }, { status: 500 })
    }

    const latestUserMessage = messages[messages.length - 1]
    if (latestUserMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from the user." }, { status: 400 })
    }

    const safetyResponse = performSafetyCheck(latestUserMessage.content)
    if (safetyResponse) {
      console.log("Safety layer triggered for user message.")
      return NextResponse.json({
        text: safetyResponse,
        isSafetyResponse: true,
      })
    }

    const systemPrompt = getSystemPrompt(mode as AIMode, userName || "Friend")

    const payload = {
      model: "baidu/ernie-4.5-21b-a3b", // Changed to a more commonly available model
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.75,
      max_tokens: 1024,
    }

    console.log("[v0] Making OpenRouter API request with GPT-3.5-turbo model")
    console.log("[v0] API Key present:", !!OPENROUTER_API_KEY)
    console.log("[v0] Authorization header:", `Bearer ${OPENROUTER_API_KEY.trim()}`)

    const apiResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY.trim()}`, // Ensure no whitespace
        "Content-Type": "application/json",
        "HTTP-Referer": "https://v0.app", // Optional but good practice
        "X-Title": "ValorMind AI", // Optional but good practice
      },
      body: JSON.stringify(payload),
    })

    console.log("[v0] OpenRouter API response status:", apiResponse.status)

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text()
      console.error("[v0] OpenRouter API error:", {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        body: errorBody,
      })
      return NextResponse.json(
        {
          error: `AI service failed with status: ${apiResponse.status}`,
          details: errorBody,
        },
        { status: 502 },
      )
    }

    const responseData = await apiResponse.json()
    const aiText = responseData.choices?.[0]?.message?.content

    if (!aiText) {
      console.error("Invalid response structure from OpenRouter:", responseData)
      return NextResponse.json({ error: "Failed to get a valid response from the AI." }, { status: 500 })
    }

    return NextResponse.json({
      text: aiText.trim(),
      isSafetyResponse: false,
    })
  } catch (error) {
    console.error("[v0] Error in chat API endpoint:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "An unknown error occurred." }, { status: 500 })
  }
}
