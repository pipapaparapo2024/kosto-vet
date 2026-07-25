import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>KOSTO</span>
            <span>VET —</span>
          </div>
          <p className={styles.desc}>Поставляем импланты для остеосинтеза животным клиникам и ветеринарным центрам по всей России.</p>
          <div className={styles.catWrap}>
            <img src="/images/cat-footer.png" alt="" className={styles.catImg} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Каталог</p>
          <Link to="/catalog/plastiny">Пластины</Link>
          <Link to="/catalog/vinty">Винты</Link>
          <Link to="/catalog/instrumenty">Инструменты</Link>
          <Link to="/catalog/shvovny">Шовный материал</Link>
          <Link to="/catalog/nabory">Наборы</Link>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Компания</p>
          <Link to="/about">О компании</Link>
          <Link to="/delivery">Доставка</Link>
          <Link to="/contacts">Контакты</Link>
          <Link to="/blog">Блог</Link>
          <Link to="/documents">Документы</Link>
        </div>

        <div className={styles.col}>
          <p className={styles.colTitle}>Контакты</p>
          <a href="tel:+79611898933">+7 (961) 189-89-33</a>
          <a href="mailto:Kosto-Vet@yandex.ru">Kosto-Vet@yandex.ru</a>
          <p className={styles.address}>Россия, Воронежская обл.,<br />г. Воронеж, ул. Димитрова 56а</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Kosto-Vet</span>
        <Link to="/documents/privacy">Политика конфиденциальности</Link>
        <Link to="/documents/personal-data">Обработка персональных данных</Link>
      </div>
    </footer>
  )
}
