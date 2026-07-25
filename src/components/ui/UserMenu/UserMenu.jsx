import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(v => !v)}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} className={styles.avatar} />
          : <span className={styles.initials}>{user.name?.[0]?.toUpperCase()}</span>
        }
        <span className={styles.name}>{user.name}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.info}>
            <p className={styles.infoName}>{user.name}</p>
            <p className={styles.infoEmail}>{user.email}</p>
          </div>
          <div className={styles.divider} />
          <button className={styles.logoutBtn} onClick={() => { logout(); setOpen(false) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}
