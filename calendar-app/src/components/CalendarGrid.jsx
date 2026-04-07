import { useEffect, useState } from 'react'
import MoodPicker from './MoodPicker'
import EventPopover from './EventPopover'
import styles from './CalendarGrid.module.css'

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getStartOffset(year, month) {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

function buildGrid(year, month) {
  const daysThisMonth = getDaysInMonth(year, month)
  const offset = getStartOffset(year, month)
  const daysPrevMonth = getDaysInMonth(year, month - 1)
  const cells = []

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: daysPrevMonth - i, current: false })
  }
  for (let d = 1; d <= daysThisMonth; d++) {
    cells.push({ day: d, current: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false })
  }
  return cells
}

export default function CalendarGrid({
  year, month, today,
  rangeStart, rangeEnd, dragging, rangeColor,
  moods, onSetMood,
  events, onSaveEvent,
  onDragStart, onDragMove, onDragEnd,
}) {
  const cells = buildGrid(year, month)

  // which day has the mood picker open
  const [moodAnchor, setMoodAnchor] = useState(null)   // { dateStr, rect }
  // which day has the event popover open
  const [eventAnchor, setEventAnchor] = useState(null) // { dateStr, rect }

  const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString()

  const [normStart, normEnd] = (() => {
    if (!rangeStart || !rangeEnd) return [rangeStart, rangeEnd]
    return rangeStart <= rangeEnd ? [rangeStart, rangeEnd] : [rangeEnd, rangeStart]
  })()

  const getCellState = (cell) => {
    if (!cell.current) return {}
    const d = new Date(year, month, cell.day)
    const isStart  = normStart && isSameDay(d, normStart)
    const isEnd    = normEnd   && isSameDay(d, normEnd)
    const inRange  = normStart && normEnd && d > normStart && d < normEnd
    const single   = normStart && normEnd && isSameDay(normStart, normEnd)
    const isToday  = isSameDay(d, today)
    return { isStart, isEnd, inRange, single, isToday }
  }

  // mouse drag
  const handleMouseDown = (e, date) => {
    e.preventDefault()
    onDragStart(date)
  }

  // global mouseup so releasing outside the grid still commits
  useEffect(() => {
    if (!dragging) return
    const up = () => onDragEnd(null)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [dragging, onDragEnd])

  // touch drag
  const handleTouchMove = (e) => {
    if (!dragging) return
    const t = e.touches[0]
    const el = document.elementFromPoint(t.clientX, t.clientY)
    const ds = el?.closest('[data-date]')?.dataset.date
    if (ds) onDragMove(new Date(ds))
  }

  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0]
    const el = document.elementFromPoint(t.clientX, t.clientY)
    const ds = el?.closest('[data-date]')?.dataset.date
    onDragEnd(ds ? new Date(ds) : null)
  }

  // right-click → mood picker; double-click → event popover
  const handleContextMenu = (e, dateStr) => {
    e.preventDefault()
    setEventAnchor(null)
    setMoodAnchor({ dateStr, rect: e.currentTarget.getBoundingClientRect() })
  }

  const handleDoubleClick = (e, dateStr) => {
    setMoodAnchor(null)
    setEventAnchor({ dateStr, rect: e.currentTarget.getBoundingClientRect() })
  }

  return (
    <>
      <div
        className={styles.grid}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {DAY_LABELS.map((label, i) => (
          <div key={label} className={`${styles.header} ${i >= 5 ? styles.weekendHeader : ''}`}>
            {label}
          </div>
        ))}

        {cells.map((cell, i) => {
          const col = i % 7
          const isWeekend = col === 5 || col === 6
          const { isStart, isEnd, inRange, single, isToday } = getCellState(cell)
          const dateObj = cell.current ? new Date(year, month, cell.day) : null
          const dateStr = dateObj ? dateObj.toISOString().split('T')[0] : undefined
          const mood    = dateStr ? moods[dateStr] : null
          const hasEvt  = dateStr && events[dateStr]?.length > 0

          const cls = [
            styles.cell,
            !cell.current && styles.faded,
            cell.current && isWeekend && styles.weekend,
            cell.current && isToday   && styles.today,
            cell.current && inRange   && styles.inRange,
            cell.current && isStart && !single && styles.rangeStart,
            cell.current && isEnd   && !single && styles.rangeEnd,
            cell.current && single  && isStart && styles.singleDay,
            cell.current && dragging && styles.dragging,
          ].filter(Boolean).join(' ')

          // inject the selected range color via CSS custom properties
          const cellStyle = rangeColor ? {
            '--range-fill':  rangeColor.fill,
            '--range-light': rangeColor.light,
          } : {}

          return (
            <div
              key={i}
              data-date={dateStr}
              className={cls}
              style={cellStyle}
              onMouseDown={cell.current ? e => handleMouseDown(e, dateObj) : undefined}
              onMouseEnter={cell.current ? () => onDragMove(dateObj) : undefined}
              onMouseUp={cell.current ? () => onDragEnd(dateObj) : undefined}
              onContextMenu={cell.current ? e => handleContextMenu(e, dateStr) : undefined}
              onDoubleClick={cell.current ? e => handleDoubleClick(e, dateStr) : undefined}
              onTouchStart={cell.current ? () => onDragStart(dateObj) : undefined}
              role={cell.current ? 'button' : undefined}
              tabIndex={cell.current ? 0 : undefined}
              aria-label={cell.current ? `${MONTHS_FULL[month]} ${cell.day}, ${year}` : undefined}
              onKeyDown={e => {
                if (!cell.current) return
                if (e.key === 'Enter' || e.key === ' ') { onDragStart(dateObj); onDragEnd(dateObj) }
              }}
            >
              <span className={styles.dayNum}>{cell.day}</span>

              {/* mood badge */}
              {mood && <span className={styles.moodBadge}>{mood}</span>}

              {/* event dot */}
              {hasEvt && <span className={styles.eventDot} />}
            </div>
          )
        })}
      </div>

      {/* Mood picker popover */}
      {moodAnchor && (
        <MoodPicker
          dateStr={moodAnchor.dateStr}
          moods={moods}
          anchorRect={moodAnchor.rect}
          onSetMood={(m) => {
            onSetMood(moodAnchor.dateStr, m)
            setMoodAnchor(null)
          }}
        />
      )}

      {/* Event popover */}
      {eventAnchor && (
        <EventPopover
          dateStr={eventAnchor.dateStr}
          events={events}
          anchorRect={eventAnchor.rect}
          onSave={onSaveEvent}
          onClose={() => setEventAnchor(null)}
        />
      )}
    </>
  )
}
