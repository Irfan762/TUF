import { useState, useEffect, useRef } from 'react'
import styles from './Notes.module.css'

const STORAGE_KEY = 'cal-range-notes'

function loadEntries(monthKey) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[monthKey] || []
  } catch { return [] }
}

function saveEntries(monthKey, entries) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[monthKey] = entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

function getCarryOver(currentMonthKey) {
  try {
    const all = JSON.parse(localStorage.getItem('cal-events') || '{}')
    const [cy, cm] = currentMonthKey.split('-').map(Number)
    return Object.entries(all)
      .filter(([ds, evts]) => {
        const d = new Date(ds)
        return evts.length > 0 &&
          (d.getFullYear() < cy || (d.getFullYear() === cy && d.getMonth() < cm))
      })
      .sort(([a], [b]) => a.localeCompare(b))
  } catch { return [] }
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function makeLabel(start, end) {
  if (!start) return null
  const e = end || start
  if (start.toDateString() === e.toDateString()) return fmtDate(start)
  const [s, en] = start <= e ? [start, e] : [e, start]
  return `${fmtDate(s)} – ${fmtDate(en)}`
}

export default function Notes({ monthKey, rangeStart, rangeEnd }) {
  const [entries, setEntries] = useState([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [carryOver, setCarryOver] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    setEntries(loadEntries(monthKey))
    setCarryOver(getCarryOver(monthKey))
    setInput('')
    setEditingId(null)
  }, [monthKey])

  const rangeLabel = makeLabel(rangeStart, rangeEnd)

  const persist = (next) => {
    setEntries(next)
    saveEntries(monthKey, next)
  }

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    persist([...entries, {
      id: Date.now(),
      label: rangeLabel || 'General',
      text,
    }])
    setInput('')
    textareaRef.current?.focus()
  }

  const handleDelete = (id) => {
    persist(entries.filter(e => e.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const handleEditText = (id, val) => {
    persist(entries.map(e => e.id === id ? { ...e, text: val } : e))
  }

  return (
    <div className={styles.panel}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.title}>Notes</span>
        {carryOver.length > 0 && (
          <button
            className={`${styles.historyToggle} ${showHistory ? styles.active : ''}`}
            onClick={() => setShowHistory(v => !v)}
            title="View carry-over from previous months"
          >
            ⏳ {carryOver.length}
          </button>
        )}
      </div>

      {/* ── Carry-over panel ── */}
      {showHistory && carryOver.length > 0 && (
        <div className={styles.carryOver}>
          <p className={styles.carryTitle}>From previous months</p>
          {carryOver.map(([ds, evts]) => (
            <div key={ds} className={styles.carryItem}>
              <span className={styles.carryDate}>
                {new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className={styles.carryEvts}>
                {evts.map((ev, i) => <span key={i}>• {ev}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className={styles.inputWrap}>
        {rangeLabel && (
          <div className={styles.rangeChip}>
            <span className={styles.rangeIcon}>📅</span>
            {rangeLabel}
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={rangeLabel ? `Note for ${rangeLabel}…` : 'Write a note…'}
          spellCheck={false}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd()
          }}
        />
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={!input.trim()}
        >
          Save
        </button>
      </div>

      {/* ── Saved entries ── */}
      <div className={styles.entries}>
        {entries.length === 0 && (
          <p className={styles.empty}>No notes yet. Select a date range and write one above.</p>
        )}
        {entries.map(entry => (
          <div key={entry.id} className={styles.entry}>
            <div className={styles.entryTop}>
              <span className={styles.entryLabel}>{entry.label}</span>
              <div className={styles.entryBtns}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setEditingId(editingId === entry.id ? null : entry.id)}
                  title="Edit"
                >✎</button>
                <button
                  className={`${styles.iconBtn} ${styles.del}`}
                  onClick={() => handleDelete(entry.id)}
                  title="Delete"
                >✕</button>
              </div>
            </div>
            {editingId === entry.id ? (
              <textarea
                className={styles.editArea}
                value={entry.text}
                onChange={e => handleEditText(entry.id, e.target.value)}
                autoFocus
                rows={2}
              />
            ) : (
              <p className={styles.entryText}>{entry.text}</p>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
