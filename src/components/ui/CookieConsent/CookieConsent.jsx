import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'kv_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'declined')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-live="polite" aria-label="Согласие на использование cookie">
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.banner}>
        <div className={styles.inner}>
          <p className={styles.text}>
            Мы используем файлы cookie, чтобы сайт работал стабильно и было удобнее им пользоваться.
            Продолжая работу с сайтом, вы подтверждаете согласие с{' '}
            <Link to="/documents/politika-konfidencialnosti" className={styles.link}>
              политикой конфиденциальности
            </Link>
            .
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.btnAccept} onClick={accept}>
              Принять
            </button>
            <button type="button" className={styles.btnDecline} onClick={decline}>
              Отклонить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
