import type { Metadata } from "next"
import { JournalView as JournalViewComponent } from "@/app/components/JournalView"

export const metadata: Metadata = {
  title: "My Journal | ValorMind",
  description: "A private and personal space to write about your day, track your mood, and express yourself freely.",
}

export function JournalView() {
  return (
    <div className="min-h-screen bg-background">
      <JournalViewComponent />
    </div>
  )
}

export default function JournalPage() {
  return <JournalView />
}
