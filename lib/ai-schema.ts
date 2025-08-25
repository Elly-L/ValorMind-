import { z } from "zod"
import superjson from "superjson"

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

export const schema = z.object({
  messages: z.array(MessageSchema).min(1),
  mode: z.enum(["friend", "therapist", "vent", "journal", "avatar-therapy"]),
})

export type InputType = z.infer<typeof schema>
export type Message = z.infer<typeof MessageSchema>

export type OutputType = {
  text: string
  isSafetyResponse: boolean
}

export const postChatAi = async (body: InputType, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body)
  const result = await fetch(`/_api/chat/ai`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  if (!result.ok) {
    const errorObject = superjson.parse(await result.text())
    const errorMessage =
      typeof errorObject === "object" && errorObject !== null && "error" in errorObject
        ? String(errorObject.error)
        : "An unknown error occurred"
    throw new Error(errorMessage)
  }
  return superjson.parse<OutputType>(await result.text())
}
