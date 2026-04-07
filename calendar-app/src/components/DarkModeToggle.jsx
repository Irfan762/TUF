import styles from './DarkModeToggle.module.css'

export default function DarkModeToggle({ dark, onToggle }) {
  return (
    <button
      className={`${styles.toggle} ${dark ? styles.dark : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={styles.icon}>{dark ? '🌙' : '☀️'}</span>
    </button>
  )
}
