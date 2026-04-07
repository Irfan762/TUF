import { useRef, useEffect } from 'react'
import styles from './MoodPicker.module.css'

const MOODS = ['☀️', '🌧️', '🔥', '😴', '🎉', '💪', '❤️', '😤']

export default function MoodPicker({ dateStr, moods, onSetMood, anchorRect }) {
  const ref = useRef(null)
  const current = moods[dateStr]

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onSetMood(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onSetMood])

  if (!anchorRect) return null

  const style = {
    position: 'fixed',
    left: anchorRect.left + anchorRect.width / 2,
    top: anchorRect.top - 8,
    transform: 'translate(-50%, -100%)',
  }

  return (
    <div ref={ref} className={styles.popover} style={style}>
      <div className={styles.arrow} />
      <div className={styles.grid}>
        {MOODS.map(m => (
          <button
            key={m}
            className={`${styles.moodBtn} ${current === m ? styles.selected : ''}`}
            onClick={() => onSetMood(m === current ? null : m)}
            title={m}
          >
            {m}
          </button>
        ))}
      </div>
      {current && (
        <button className={styles.clear} onClick={() => onSetMood(null)}>
          Remove mood
        </button>
      )}
    </div>
  )
}
