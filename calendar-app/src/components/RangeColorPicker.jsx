import styles from './RangeColorPicker.module.css'

export const RANGE_COLORS = [
  { id: 'blue',   label: 'Trip',     fill: '#1976d2', light: '#bbdefb' },
  { id: 'green',  label: 'Work',     fill: '#2e7d32', light: '#c8e6c9' },
  { id: 'orange', label: 'Holiday',  fill: '#e65100', light: '#ffe0b2' },
  { id: 'purple', label: 'Personal', fill: '#6a1b9a', light: '#e1bee7' },
  { id: 'red',    label: 'Deadline', fill: '#c62828', light: '#ffcdd2' },
]

export default function RangeColorPicker({ selected, onChange }) {
  return (
    <div className={styles.picker}>
      <span className={styles.label}>Range type</span>
      <div className={styles.swatches}>
        {RANGE_COLORS.map(c => (
          <button
            key={c.id}
            className={`${styles.swatch} ${selected === c.id ? styles.active : ''}`}
            style={{ '--swatch-color': c.fill }}
            onClick={() => onChange(c.id)}
            title={c.label}
            aria-label={c.label}
          />
        ))}
      </div>
    </div>
  )
}
