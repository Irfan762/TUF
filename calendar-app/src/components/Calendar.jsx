import { useState, useCallback, useEffect } from 'react'
import CalendarGrid from './CalendarGrid'
import Notes from './Notes'
import DarkModeToggle from './DarkModeToggle'
import RangeColorPicker, { RANGE_COLORS } from './RangeColorPicker'
import DayCounter from './DayCounter'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { fireConfetti } from '../hooks/useConfetti'
import styles from './Calendar.module.css'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// picsum gives a stable image per seed string, no API key needed
const HERO_IMAGES = [
  'https://picsum.photos/seed/january/900/400',
  'https://picsum.photos/seed/february/900/400',
  'https://picsum.photos/seed/march/900/400',
  'https://picsum.photos/seed/april/900/400',
  'https://picsum.photos/seed/may/900/400',
  'https://picsum.photos/seed/june/900/400',
  'https://picsum.photos/seed/july/900/400',
  'https://picsum.photos/seed/august/900/400',
  'https://picsum.photos/seed/september/900/400',
  'https://picsum.photos/seed/october/900/400',
  'https://picsum.photos/seed/november/900/400',
  'https://picsum.photos/seed/december/900/400',
]

export default function Calendar() {
  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [direction, setDirection] = useState(null)
  const [animKey, setAnimKey] = useState(0)

  const [dark, setDark] = useLocalStorage('cal-dark', false)
  const [colorId, setColorId] = useLocalStorage('cal-color', 'blue')
  const [moods, setMoods] = useLocalStorage('cal-moods', {})
  const [events, setEvents] = useLocalStorage('cal-events', {})

  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [dragCurrent, setDragCurrent] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)

  const rangeColor = RANGE_COLORS.find(c => c.id === colorId)
  const monthKey = `${year}-${month}`

  // keep the dark class on <html> in sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const navigate = (dir) => {
    clearRange()
    setDirection(dir)
    setAnimKey(k => k + 1)
  }

  const goToPrev = () => {
    navigate('prev')
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    navigate('next')
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const clearRange = () => {
    setRangeStart(null)
    setRangeEnd(null)
    setDragging(false)
    setDragCurrent(null)
  }

  const handleDragStart = useCallback((date) => {
    setRangeStart(date)
    setRangeEnd(null)
    setDragCurrent(date)
    setDragging(true)
  }, [])

  const handleDragMove = useCallback((date) => {
    if (dragging) setDragCurrent(date)
  }, [dragging])

  const handleDragEnd = useCallback((date) => {
    if (!dragging) return
    const end = date || dragCurrent
    setRangeEnd(end)
    setDragging(false)
    setDragCurrent(null)
    if (end && rangeStart && end.toDateString() !== rangeStart.toDateString()) {
      fireConfetti()
    }
  }, [dragging, dragCurrent, rangeStart])

  const handleSetMood = (dateStr, mood) => {
    setMoods(prev => {
      const next = { ...prev }
      if (mood === null) delete next[dateStr]
      else next[dateStr] = mood
      return next
    })
  }

  const handleSaveEvent = (dateStr, list) => {
    setEvents(prev => {
      const next = { ...prev }
      if (list.length === 0) delete next[dateStr]
      else next[dateStr] = list
      return next
    })
  }

  const handleCardTouchStart = (e) => setTouchStartX(e.touches[0].clientX)

  const handleCardTouchEnd = (e) => {
    if (touchStartX === null) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 50) dx < 0 ? goToNext() : goToPrev()
    setTouchStartX(null)
  }

  const displayEnd = dragging ? dragCurrent : rangeEnd

  const formatRange = () => {
    if (!rangeStart) return null
    const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = displayEnd || rangeStart
    if (rangeStart.toDateString() === end.toDateString()) return fmt(rangeStart)
    const [s, e] = rangeStart <= end ? [rangeStart, end] : [end, rangeStart]
    return `${fmt(s)} – ${fmt(e)}`
  }

  const pageClass = [
    styles.page,
    direction === 'next' && styles.slideNext,
    direction === 'prev' && styles.slidePrev,
  ].filter(Boolean).join(' ')

  const waveColor = rangeColor?.fill ?? '#1565c0'

  return (
    <>
      <DayCounter
        dragging={dragging}
        rangeStart={rangeStart}
        rangeEnd={dragCurrent}
        color={rangeColor?.fill}
      />

      <div className={styles.wrapper}>
        <div
          className={styles.card}
          onTouchStart={handleCardTouchStart}
          onTouchEnd={handleCardTouchEnd}
        >
          <div className={styles.toolbar}>
            <RangeColorPicker selected={colorId} onChange={setColorId} />
            <DarkModeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>

          <div className={styles.nav}>
            <button onClick={goToPrev} className={styles.navBtn} aria-label="Previous month">‹</button>
            <div className={styles.navCenter}>
              {rangeStart ? (
                <span
                  className={styles.rangeLabel}
                  style={{
                    background: `${rangeColor?.fill}22`,
                    borderColor: `${rangeColor?.fill}66`,
                    color: rangeColor?.fill,
                  }}
                >
                  📅 {formatRange()}
                  <button
                    onClick={clearRange}
                    className={styles.clearBtn}
                    style={{ background: rangeColor?.fill }}
                    aria-label="Clear selection"
                  >
                    ✕
                  </button>
                </span>
              ) : (
                <span className={styles.hint}>
                  Hold &amp; drag · right-click for mood · double-click for events
                </span>
              )}
            </div>
            <button onClick={goToNext} className={styles.navBtn} aria-label="Next month">›</button>
          </div>

          <div className={styles.pageClip}>
            <div key={animKey} className={pageClass}>

              <div className={styles.hero}>
                <img
                  src={HERO_IMAGES[month]}
                  alt={`${MONTHS[month]} scenery`}
                  className={styles.heroImg}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.wave}>
                  <svg viewBox="0 0 800 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M0,72 L0,36 C80,8 160,52 240,36 C320,20 400,52 480,36 C560,20 640,52 720,36 L800,28 L800,72 Z"
                      fill={waveColor}
                      opacity="0.85"
                    />
                    <path
                      d="M0,72 L0,44 C100,20 200,60 300,44 C400,28 500,60 600,44 C680,32 740,52 800,40 L800,72 Z"
                      fill={waveColor}
                    />
                  </svg>
                </div>
                <div className={styles.monthLabel}>
                  <span className={styles.yearText}>{year}</span>
                  <span className={styles.monthText}>{MONTHS[month].toUpperCase()}</span>
                </div>
              </div>

              <div className={styles.body}>
                <Notes
                  monthKey={monthKey}
                  rangeStart={rangeStart}
                  rangeEnd={displayEnd}
                />
                <CalendarGrid
                  year={year}
                  month={month}
                  today={today}
                  rangeStart={rangeStart}
                  rangeEnd={displayEnd}
                  dragging={dragging}
                  rangeColor={rangeColor}
                  moods={moods}
                  onSetMood={handleSetMood}
                  events={events}
                  onSaveEvent={handleSaveEvent}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
