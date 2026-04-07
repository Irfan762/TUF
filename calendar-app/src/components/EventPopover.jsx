import { useState, useRef, useEffect } from 'react'
import styles from './EventPopover.module.css'

export default function EventPopover({ dateStr, events, onSave, onClose, anchorRect }) {
  const [input, setInput] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  if (!anchorRect) return null

  const dayEvents = events[dateStr] || []

  const addEvent = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSave(dateStr, [...dayEvents, trimmed])
    setInput('')
  }

  const removeEvent = (i) => {
    onSave(dateStr, dayEvents.filter((_, idx) => idx !== i))
  }

  const style = {
    position: 'fixed',
    left: anchorRect.left + anchorRect.width / 2,
    top: anchorRect.top - 8,
    transform: 'translate(-50%, -100%)',
  }

  return (
    <div ref={ref} className={styles.popover} style={style}>
      <div className={styles.arrow} />
      <p className={styles.dateLabel}>{dateStr}</p>

      {dayEvents.length > 0 && (
        <ul className={styles.list}>
          {dayEvents.map((ev, i) => (
            <li key={i} className={styles.item}>
              <span>{ev}</span>
              <button onClick={() => removeEvent(i)} className={styles.del}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEvent()}
          placeholder="Add event…"
          maxLength={40}
        />
        <button className={styles.addBtn} onClick={addEvent}>+</button>
      </div>
    </div>
  )
}
