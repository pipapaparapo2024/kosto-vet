import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './AuthCallback.module.css'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { loginWithCode } = useAuth()
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      navigate('/?auth=error', { replace: true })
      return
    }

    loginWithCode(code).then((ok) => {
      navigate(ok ? '/?auth=success' : '/?auth=error', { replace: true })
    })
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} aria-label="Загрузка" />
      <p className={styles.text}>Выполняется вход через Яндекс...</p>
    </div>
  )
}
