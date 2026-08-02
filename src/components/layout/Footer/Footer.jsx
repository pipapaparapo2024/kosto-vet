import { Link, useLocation } from 'react-router-dom'
import { img } from '../../../utils/assetUrl'
import styles from './Footer.module.css'

export default function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === ''
  // Карточка товара: /catalog/:category/:slug
  const isProduct = /^\/catalog\/[^/]+\/[^/]+\/?$/.test(pathname)
  const tightTop = isHome || isProduct

  return (
    <footer className={`${styles.footer}${tightTop ? ` ${styles.footerTight}` : ''}`}>
      <div className={styles.divider} />

      <div className={styles.top}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.brand}>
              <Link to="/" className={styles.logo}>
                <span>KOSTO</span>
                <span>VET —</span>
              </Link>
              <p className={styles.desc}>Поставляем импланты для остеосинтеза животным клиникам и ветеринарным центрам по всей России.</p>
              <img src={img('images/cat-footer.png')} alt="" className={styles.catImg} aria-hidden="true" />
            </div>

            <div className={styles.navCols}>
              <div className={styles.col}>
                <p className={styles.colTitle}>Каталог</p>
                <nav className={styles.colLinks}>
                  <Link to="/catalog/plastiny">Пластины</Link>
                  <Link to="/catalog/vinty">Винты</Link>
                  <Link to="/catalog/instrumenty">Инструменты</Link>
                  <Link to="/catalog/shvovny">Шовный материал</Link>
                  <Link to="/catalog/nabory">Наборы</Link>
                </nav>
              </div>

              <div className={styles.col}>
                <p className={styles.colTitle}>Компания</p>
                <nav className={styles.colLinks}>
                  <Link to="/about">О компании</Link>
                  <Link to="/delivery">Доставка</Link>
                  <Link to="/contacts">Контакты</Link>
                  <Link to="/blog">Блог</Link>
                  <Link to="/documents">Документы</Link>
                </nav>
              </div>

              <div className={styles.col}>
                <p className={styles.colTitle}>Контакты</p>
                <div className={styles.colLinks}>
                  <a href="tel:+79611898933">+7 (961) 189-89-33</a>
                  <a href="mailto:Kosto-Vet@yandex.ru">Kosto-Vet@yandex.ru</a>
                  <p>Россия, Воронежская обл.,<br/>г. Воронеж, ул. Димитрова 56а</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <span>© 2026 Kosto-Vet</span>
            <Link to="/documents/politika-konfidencialnosti" className={styles.bottomPolicy}>Политика конфиденциальности</Link>
            <Link to="/documents/obrabotka-personalnyh-dannyh" className={styles.bottomPersonal}>Обработка персональных данных</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
