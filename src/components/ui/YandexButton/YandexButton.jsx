import { redirectToYandex } from '../../../lib/yandex'
import styles from './YandexButton.module.css'

export default function YandexButton({ label = 'Войти через Яндекс' }) {
  return (
    <button className={styles.btn} onClick={redirectToYandex} type="button">
      <YandexIcon />
      {label}
    </button>
  )
}

function YandexIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.8 12.5L17.1 19H14.7L11.5 12.7H9.9V19H7.7V5H12C14.8 5 16.8 6.8 16.8 8.9C16.8 10.7 15.6 12 13.8 12.5ZM9.9 7V10.8H11.9C13.3 10.8 14.5 10 14.5 8.9C14.5 7.8 13.4 7 11.9 7H9.9Z" fill="currentColor"/>
    </svg>
  )
}
