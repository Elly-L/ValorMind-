import { JournalView } from "../components/JournalView"
import styles from "../components/journal.module.css"

export const metadata = {
  title: "My Journal | ValorMind",
  description: "A private and personal space to write about your day, track your mood, and express yourself freely.",
}

export default function JournalPage() {
  return (
    <div className={styles.pageContainer}>
      <JournalView />
    </div>
  )
}
