import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'kv_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'accepted') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Согласие на использование cookie">
      <div className={styles.inner}>
        <p className={styles.text}>
          Мы используем файлы cookie, чтобы сайт работал стабильно и было удобнее им пользоваться.
          Продолжая работу с сайтом, вы подтверждаете согласие с{' '}
          <Link to="/documents/politika-konfidencialnosti" className={styles.link}>
            политикой конфиденциальности
          </Link>
          .
        </p>
        <button type="button" className={styles.btn} onClick={accept}>
          Принять все
        </button>
      </div>
    </div>
  )
}
