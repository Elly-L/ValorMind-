import type { Metadata } from "next"
import { JournalView } from "@/app/components/JournalView"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "My Journal | ValorMind",
  description: "A private and personal space to write about your day, track your mood, and express yourself freely.",
}

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
      <JournalView />
    </div>
  )
}
