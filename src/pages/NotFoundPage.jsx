import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { img } from '../utils/assetUrl'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>Кажется, эта страница убежала.</h1>
          <p className={styles.desc}>Но наши специалисты на месте и готовы помочь. Вы можете вернуться на главную страницу или перейти в каталог.</p>
          <div className={styles.btns}>
            <Link to="/" className={styles.btnPrimary}>На главную <ArrowRight size={20} /></Link>
            <Link to="/catalog" className={styles.btnSecondary}>Перейти в каталог <ArrowRight size={20} /></Link>
          </div>
        </div>
        <div className={styles.right}>
          <img src={img('images/cat-404.png')} alt="" className={styles.cat} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
