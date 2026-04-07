import { useEffect, useState } from 'react'
import styles from './DayCounter.module.css'

function daysBetween(a, b) {
  if (!a || !b) return 1
  const ms = Math.abs(b - a)
  return Math.round(ms / 86400000) + 1
}

export default function DayCounter({ dragging, rangeStart, rangeEnd, color }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!dragging) return
    const move = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      setPos({ x: clientX, y: clientY })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('touchmove', move, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('touchmove', move)
    }
  }, [dragging])

  if (!dragging || !rangeStart) return null

  const count = daysBetween(rangeStart, rangeEnd || rangeStart)

  return (
    <div
      className={styles.pill}
      style={{
        left: pos.x + 14,
        top: pos.y - 36,
        background: color,
      }}
    >
      {count} {count === 1 ? 'day' : 'days'}
    </div>
  )
}
