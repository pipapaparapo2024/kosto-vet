import styles from './Input.module.css'

export default function Input({ label, id, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={[styles.input, error ? styles.hasError : ''].join(' ')}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
