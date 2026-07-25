import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Кажется, эта страница убежала.</h2>
      <p className={styles.desc}>Но наши специалисты на месте и готовы помочь.<br />Вы можете вернуться на главную страницу или перейти в каталог.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.btnPrimary}>На главную →</Link>
        <Link to="/catalog" className={styles.btnSecondary}>Перейти в каталог →</Link>
      </div>
      <img src="/images/cat-404.png" alt="" className={styles.cat} aria-hidden="true" />
    </div>
  )
}
