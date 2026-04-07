import { useState, useEffect } from 'react'
import styles from './Notes.module.css'

export default function Notes({ monthKey }) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(`notes-${monthKey}`)
    setNotes(saved || '')
  }, [monthKey])

  const handleChange = (e) => {
    setNotes(e.target.value)
    localStorage.setItem(`notes-${monthKey}`, e.target.value)
  }

  return (
    <div className={styles.notes}>
      <div className={styles.labelRow}>
        <span className={styles.icon}>✏️</span>
        <span className={styles.label}>Notes</span>
      </div>
      <textarea
        className={styles.textarea}
        value={notes}
        onChange={handleChange}
        placeholder="Write something..."
        aria-label="Monthly notes"
        spellCheck={false}
      />
      <div className={styles.charCount}>{notes.length} chars</div>
    </div>
  )
}
