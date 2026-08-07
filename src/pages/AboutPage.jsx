import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Zap, Users, Compass, Clock, Headphones, ArrowRight, Phone, ChevronDown, FileText, Box, Truck, Flag } from 'lucide-react'
import { img } from '../utils/assetUrl'
import styles from './AboutPage.module.css'

const STATS = [
  { Icon: Package,    value: '1000+',              label: 'позиций в наличии',                          isNum: true },
  { Icon: Clock,      value: '2–4 часа',           label: 'доставка по Воронежу в день заказа',         isNum: true },
  { Icon: Users,      value: 'Работаем с клиниками', label: 'от небольших кабинетов до крупных центров', isNum: false },
  { Icon: Headphones, value: 'Помогаем с подбором', label: 'если нет уверенности — подскажем совместимое решение', isNum: false },
]

const STEPS = [
  { num: '1', Icon: FileText, title: 'Вы оставляете заявку', desc: 'На сайте или по телефону.' },
  { num: '2', Icon: Package,  title: 'Проверяем наличие',    desc: 'Менеджер сразу подтверждает наличие товара.' },
  { num: '3', Icon: Box,      title: 'Комплектуем заказ',    desc: 'Собираем и готовим к отправке.' },
  { num: '4', Icon: Truck,    title: 'Отправляем',           desc: 'Курьером или транспортной компанией.' },
  { num: '5', Icon: Flag,     title: 'Получаете заказ',      desc: 'Можно сразу использовать в работе.' },
]

const WHY = [
  { Icon: Box,      title: 'Остатки в реальном времени', desc: 'Точная информация о наличии на складе' },
  { Icon: Zap,      title: 'Быстрая комплектация',       desc: 'Собираем заказы в день обращения' },
  { Icon: Users,    title: 'Помощь специалиста',         desc: 'Подскажем совместимые решения и аналоги' },
  { Icon: Compass,  title: 'Работаем по всей России',    desc: 'Доставляем курьером в ТК по всей стране' },
]

const FAQ = [
  { q: 'Как быстро вы отправляете заказ?',         a: 'При заказе до 14:00 — в этот же день. При заказе после 14:00 — на следующий рабочий день.' },
  { q: 'Работаете ли с физ. лицами?',              a: 'Работаем преимущественно с ветеринарными клиниками и специалистами.' },
  { q: 'Как узнать наличие товара?',               a: 'Актуальный остаток виден прямо на сайте в режиме реального времени.' },
  { q: 'Какие транспортные компании используете?', a: 'СДЭК, Почта России, курьерская доставка по Воронежу собственным транспортом.' },
  { q: 'Можно ли заказать ночью?',                 a: 'Да, принимаем заказы в любое время через сайт. Обработка — в рабочее время с 9:00 до 18:00.' },
  { q: 'Есть ли помощь с подбором?',              a: 'Конечно. Позвоните или оставьте заявку — специалист поможет подобрать нужный имплант.' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Главная</Link><span>›</span><span>О компании</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Работаем так, чтобы хирург думал только об операции</h1>
          <p className={styles.heroDesc}>Мы поставляем ветеринарные импланты, инструменты и расходные материалы для клиник по всей России. Постоянно поддерживаем склад, быстро комплектуем заказы и понимаем, что иногда каждая минута имеет значение.</p>
        </div>
        <div className={styles.heroRight}>
          <img src={img('images/about-graphic.png')} alt="" className={styles.heroPhoto} aria-hidden="true" />
        </div>
      </div>

      {/* Почему нам доверяют */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle24}>Почему нам доверяют</h2>
          <div className={styles.statsGrid}>
            {STATS.map(({ Icon, value, label, isNum }, i) => (
              <div key={i} className={styles.statCard}>
                <Icon size={58} strokeWidth={1.2} className={styles.statIcon} />
                <p className={isNum ? styles.statValueNum : styles.statValueText}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Как мы работаем */}
      <section className={styles.stepsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle24}>Как мы работаем</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.num} className={styles.stepRow}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>{s.num}</div>
                  <div className={styles.stepIcon}><s.Icon size={71} strokeWidth={1.2} /></div>
                  <div className={styles.stepText}>
                    <p className={styles.stepTitle}>{s.title}</p>
                    <p className={styles.stepDesc}>{s.desc}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={styles.stepArrow}><ArrowRight size={20} strokeWidth={2} /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Наш склад */}
      <section className={styles.vkladSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle24}>Наш склад</h2>
          <p className={styles.vkladDesc}>На складе всегда поддерживается ассортимент самых востребованных пластин, винтов и инструментов, чтобы клиника могла получить продукцию без долгого ожидания.</p>
          <div className={styles.warehousePhotos}>
            {[1,2,3,4,5].map(n => (
              <div key={n} className={styles.warehousePhoto}>
                <Box size={40} strokeWidth={1.2} style={{ color: '#ccc' }} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Почему клиники выбирают + FAQ */}
      <section className={styles.splitSection}>
        <div className={styles.container}>
          <div className={styles.splitInner}>
            <div className={styles.splitLeft}>
              <h2 className={styles.sectionTitle24}>Почему клиники выбирают Kosto-Vet</h2>
              <div className={styles.whyList}>
                {WHY.map(({ Icon, title, desc }, i) => (
                  <div key={i} className={styles.whyItem}>
                    <Icon size={45} strokeWidth={1.5} className={styles.whyIcon} />
                    <div>
                      <p className={styles.whyTitle}>{title}</p>
                      <p className={styles.whyDesc}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.splitDivider} aria-hidden="true" />

            <div className={styles.splitRight}>
              <h2 className={styles.sectionTitle24}>Частые вопросы</h2>
              <FaqList items={FAQ} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.cta}>
            <div className={styles.ctaLeft}>
              <h2 className={styles.ctaTitle}>Нужна помощь с подбором?</h2>
              <p className={styles.ctaDesc}>Если вы не уверены, какой имплант подойдет, мы бесплатно поможем подобрать совместимое решение.</p>
              <div className={styles.ctaBtns}>
                <Link to="/catalog" className={styles.ctaBtnPrimary}>
                  Подобрать имплант <ArrowRight size={20} strokeWidth={1.8} />
                </Link>
                <a href="tel:+79611898933" className={styles.ctaBtnSecondary}>
                  Позвонить специалисту <Phone size={20} strokeWidth={1.5} />
                </a>
              </div>
            </div>
            <div className={styles.ctaRight}>
              <img src={img('images/about-cat.png')} alt="" className={styles.ctaImg} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FaqList({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className={styles.faq}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} className={`${styles.faqItem}${isOpen ? ` ${styles.faqOpen}` : ''}`}>
            <button
              type="button"
              className={styles.faqQ}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q}
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`${styles.faqChevron}${isOpen ? ` ${styles.faqChevronOpen}` : ''}`}
                aria-hidden="true"
              />
            </button>
            <div className={`${styles.faqPanel}${isOpen ? ` ${styles.faqPanelOpen}` : ''}`}>
              <div className={styles.faqPanelInner}>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
