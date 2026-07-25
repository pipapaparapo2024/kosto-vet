import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Clock, CalendarDays, Package } from 'lucide-react'
import styles from './DeliveryPage.module.css'

const STEPS = [
  { num: '1', title: 'Получаем заявку', desc: 'Вы оставляете заявку на сайте или звоните специалисту.' },
  { num: '2', title: 'Проверяем склад', desc: 'Менеджер сразу подтверждает наличие товара.' },
  { num: '3', title: 'Комплектуем заказ', desc: 'Набираем товар со склада и передаём на упаковку.' },
  { num: '4', title: 'Передаём в доставку', desc: 'Курьер уже направляется по указанному адресу.' },
  { num: '5', title: 'Получаете заказ', desc: 'Товар готов к использованию в работе.' },
]

const ZONES = [
  { name: 'Воронеж', time: '2–4 часа', Icon: Clock },
  { name: 'ЦЧР', time: 'Следующий день', Icon: CalendarDays },
  { name: 'Остальная Россия', time: 'Через транспортную компанию', Icon: Package },
]

const FAQ = [
  { q: 'Можно ли получить заказ нично?', a: 'Да, всегда берём из склада, доставим курьером или отправим через ТК. Уточните при оформлении.' },
  { q: 'Можно заказать ночью?', a: 'Да, заявки принимаются круглосуточно. Обработка начнётся утром с 9:00.' },
  { q: 'Можно вызвать курьера?', a: 'Курьер доставит заказ по Воронежу прямо в клинику в рабочее время.' },
  { q: 'Отправляете транспортными компаниями?', a: 'Работаем со СДЭК и Почтой России. Срок доставки — 1–3 рабочих дня в зависимости от региона.' },
]

export default function DeliveryPage() {
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>/</span>
            <span>Доставка</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Когда операция<br/>не может ждать —<br/>доставка тоже.</h1>
            <p className={styles.heroDesc}>По Воронежу доставляем за 2–4 часа. В другие города Центрально-Черноземного региона — уже на следующий день. Работаем без выходных и праздников.</p>
            <Link to="/catalog" className={styles.heroBtn}>Проверить наличие →</Link>
          </div>
          <div className={styles.heroPhoto}>ГРАФИКА</div>
        </div>

        {/* Как происходит доставка */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Как происходит доставка?</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepTop}>
                  <div className={styles.stepNum}>{s.num}</div>
                  {i < STEPS.length - 1 && (
                    <svg className={styles.stepArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  )}
                </div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* География */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>География доставки</h2>
          <div className={styles.geoGrid}>
            <div className={styles.geoMap}>
              {/* SVG схема карты ЦЧР */}
              <svg viewBox="0 0 300 260" className={styles.mapSvg}>
                <circle cx="150" cy="130" r="8" fill="#111" />
                <text x="155" y="148" fontSize="13" fontWeight="700" fill="#111">Воронеж</text>
                {[
                  { x: 60, y: 80, label: 'Курск' },
                  { x: 170, y: 60, label: 'Липецк' },
                  { x: 230, y: 100, label: 'Тамбов' },
                  { x: 70, y: 200, label: 'Белгород' },
                  { x: 180, y: 210, label: 'Орёл' },
                ].map((city, i) => (
                  <g key={i}>
                    <line x1="150" y1="130" x2={city.x + 5} y2={city.y + 5} stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 3" />
                    <circle cx={city.x + 5} cy={city.y + 5} r="4" fill="#111" />
                    <text x={city.x + 12} y={city.y + 9} fontSize="11" fill="#444">{city.label}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div className={styles.geoInfo}>
              {ZONES.map(({ name, time, Icon }, i) => (
                <div key={i} className={styles.geoZone}>
                  <Icon size={24} strokeWidth={1.5} className={styles.geoIcon} />
                  <div>
                    <p className={styles.geoName}>{name}</p>
                    <p className={styles.geoTime}>{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqGrid}>
            {FAQ.map((item, i) => (
              <div key={i} className={styles.faqCard}>
                <button className={styles.faqQ} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {item.q}
                </button>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>Не знаете, успеем ли доставить?</h2>
            <p className={styles.ctaDesc}>Проверьте наличие и уточните у специалиста.</p>
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
