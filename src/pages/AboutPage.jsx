import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Zap, Users, Globe, ArrowRight, Phone, ChevronDown } from 'lucide-react'
import styles from './AboutPage.module.css'

const STATS = [
  { value: '1000+', label: 'позиций в наличии' },
  { value: '2–4 часа', label: 'доставка по Воронежу в день заказа' },
  { value: 'Работаем с клиниками', label: 'от небольших кабинетов до крупных центров' },
  { value: 'Помогаем с подбором', label: 'если нет уверенности — подберём совместно' },
]

const STEPS = [
  { num: '1', title: 'Вы оставляете заявку', desc: 'На сайте или по телефону.' },
  { num: '2', title: 'Проверяем наличие', desc: 'Менеджер фото подтвердит наличие товара.' },
  { num: '3', title: 'Комплектуем заказ', desc: 'Собираем его со склада и упаковываем к отправке.' },
  { num: '4', title: 'Отправляем', desc: 'Курьером или транспортной компанией.' },
  { num: '5', title: 'Получаете заказ', desc: 'Товар готов к использованию в работе.' },
]

const WHY = [
  { Icon: Package, title: 'Остаток в реальном времени', desc: 'Точная информация на складе без звонков.' },
  { Icon: Zap,     title: 'Быстрое оформление',         desc: 'Собираем заказы в тот же день.' },
  { Icon: Users,   title: 'Помощь с документацией',     desc: 'Предоставляем счёт, накладные, сертификаты.' },
  { Icon: Globe,   title: 'Работаем по всей России',    desc: 'Доставка до 5 рабочих дней по всей стране.' },
]

const FAQ = [
  { q: 'Как быстро вы отправляете заказ?', a: 'При заказе до 14:00 — в этот же день. При заказе после 14:00 — на следующий рабочий день.' },
  { q: 'Работаете ли вы, лицензии?', a: 'Да, у нас есть все необходимые лицензии и сертификаты на продукцию. Документы предоставляем по запросу.' },
  { q: 'Как узнать наличие товара?', a: 'Актуальный остаток виден прямо на сайте в режиме реального времени. Также можно позвонить нам.' },
  { q: 'Какие транспортные компании используете?', a: 'СДЭК, Почта России, курьерская доставка по Воронежу собственным транспортом.' },
  { q: 'Можно ли заказать нельзя?', a: 'Да, принимаем заказы в любое время через сайт. Обработка — в рабочее время с 9:00 до 18:00.' },
  { q: 'Есть ли помощь с подбором?', a: 'Конечно. Позвоните нам или оставьте заявку — специалист поможет подобрать нужный имплант.' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>/</span>
            <span>О компании</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Работаем так,<br/>чтобы хирург думал<br/>только об операции</h1>
            <p className={styles.heroDesc}>
              Мы поставляем ветеринарные импланты, инструменты и расходные материалы для клиник по всей России. Постоянно поддерживаем склад, быстро комплектуем заказы и понимаем, что иногда каждая минута имеет значение.
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.heroPhoto}>Фото/графика</div>
          </div>
        </div>

        {/* Почему нам доверяют */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Почему нам доверяют</h2>
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.statCard}>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как мы работаем */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Как мы работаем</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Наш склад */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Наш склад</h2>
          <p className={styles.sectionDesc}>На складе всегда поддерживается ассортимент самых востребованных пластин, винтов и инструментов, чтобы клиника могла получить продукцию без долгого ожидания.</p>
          <div className={styles.warehouseGrid}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={styles.warehousePhoto}>Фото склада {n}</div>
            ))}
          </div>
        </section>

        {/* Почему выбирают + FAQ */}
        <section className={`${styles.section} ${styles.splitSection}`}>
          <div className={styles.splitLeft}>
            <h2 className={styles.sectionTitle}>Почему клиники выбирают Kosto-Vet</h2>
            <div className={styles.whyGrid}>
              {WHY.map(({ Icon, title, desc }, i) => (
                <div key={i} className={styles.whyCard}>
                  <Icon size={22} strokeWidth={1.5} className={styles.whyIcon} />
                  <p className={styles.whyTitle}>{title}</p>
                  <p className={styles.whyDesc}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.splitRight}>
            <h2 className={styles.sectionTitle}>Частые вопросы</h2>
            <FaqList items={FAQ} />
          </div>
        </section>

        {/* CTA */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>Нужна помощь с подбором?</h2>
            <p className={styles.ctaDesc}>Мы проверим наличие, подберём совместно нужное изделие и подготовим заказ к отправке.</p>
            <div className={styles.ctaBtns}>
              <Link to="/catalog" className={styles.ctaBtnPrimary}>Проверить наличие <ArrowRight size={16} /></Link>
              <a href="tel:+79611898933" className={styles.ctaBtnSecondary}>
                <Phone size={16} strokeWidth={1.5} />
                Позвонить специалисту
              </a>
            </div>
          </div>
          <div className={styles.ctaPhoto}>Графика</div>
        </div>
      </div>
    </div>
  )
}

function FaqList({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className={styles.faq}>
      {items.map((item, i) => (
        <div key={i} className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}>
          <button className={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <ChevronDown size={16} strokeWidth={2} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }} />
          </button>
          {open === i && <p className={styles.faqA}>{item.a}</p>}
        </div>
      ))}
    </div>
  )
}
