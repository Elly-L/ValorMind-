import { Helmet } from "react-helmet"
import { JournalView } from "../components/JournalView"
import styles from "./journal.module.css"

export default function JournalPage() {
  return (
    <>
      <Helmet>
        <title>My Journal | ValorMind</title>
        <meta
          name="description"
          content="A private and personal space to write about your day, track your mood, and express yourself freely."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <JournalView />
      </div>
    </>
  )
}
