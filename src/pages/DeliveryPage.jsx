import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Clock, Star, MapPin, Truck, ClipboardList, Package, PackageCheck, Flag } from 'lucide-react'
import { img } from '../utils/assetUrl'
import { useSettings } from '../context/SettingsContext'
import { formatMoney } from '../lib/money'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './DeliveryPage.module.css'

const STEPS = [
  { num: '1', Icon: ClipboardList, title: 'Получаем заявку',    desc: 'Вы оставляете заявку на сайте или звоните специалисту.' },
  { num: '2', Icon: Package,       title: 'Проверяем склад',     desc: 'Менеджер сразу подтверждает наличие товара.' },
  { num: '3', Icon: PackageCheck,  title: 'Комплектуем заказ',   desc: 'Набираем товар со склада и передаём на упаковку.' },
  { num: '4', Icon: Truck,         title: 'Передаём в доставку', desc: 'Курьер уже направляется по указанному адресу.' },
  { num: '5', Icon: Flag,          title: 'Получаете заказ',     desc: 'Товар готов к использованию в работе.' },
]

const ZONES = [
  { name: 'Воронеж',          time: '2–4 часа',                    Icon: Clock },
  { name: 'ЦЧР',              time: 'Следующий день',               Icon: Truck },
  { name: 'Остальная Россия', time: 'Через транспортную компанию',  Icon: Package },
]

const FAQ = [
  { Icon: Clock,  q: 'Можно ли получить заказ сегодня?',     a: 'Да. Если товар есть на складе, доставим по Воронежу за 2–4 часа.' },
  { Icon: Star,   q: 'Можно заказать ночью?',                 a: 'Да. Заявка поступит менеджеру сразу после начала рабочего дня.' },
  { Icon: MapPin, q: 'Можно вызвать курьера?',                a: 'Да. Курьер привезёт заказ по указанному адресу в удобное время.' },
  { Icon: Truck,  q: 'Отправляете транспортными компаниями?', a: 'Да. Работаем со всеми крупными перевозчиками по всей России.' },
]

/* Воронеж — центр карты cx=150, cy=120 (в обрезанном viewBox) */
const MAP_CITIES = [
  { x: 32,  y: 86,  label: 'Курск' },
  { x: 132, y: 60,  label: 'Липецк' },
  { x: 258, y: 60,  label: 'Тамбов' },
  { x: 10,  y: 194, label: 'Белгород' },
  { x: 132, y: 210, label: 'Орёл' },
]

export default function DeliveryPage() {
  const { settings } = useSettings()
  const deliveryPrice = formatMoney(settings?.fixed_delivery_price, { empty: null })
  useDocumentTitle('Доставка', 'Доставка имплантов по Воронежу за 2–4 часа и в регионы ЦЧР.')

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/">Главная</Link>
        <span>›</span>
        <span>Доставка</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Когда операция не может ждать — доставка тоже.</h1>
          <p className={styles.heroDesc}>
            По Воронежу доставляем за 2–4 часа. В другие города Центрально-Черноземного региона — уже на следующий день. Работаем без выходных и праздников.
            {deliveryPrice ? ` Фиксированная стоимость доставки в demo: ${deliveryPrice}.` : ''}
          </p>
          <Link to="/catalog" className={styles.heroBtn}>
            Проверить наличие <ArrowRight size={20} strokeWidth={1.8} />
          </Link>
        </div>
        <div className={styles.heroRight}>
          <img src={img('images/delivery-graphic.png')} alt="" className={styles.heroImg} aria-hidden="true" />
        </div>
      </div>

      {/* Как происходит доставка */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <h2 className={styles.stepsTitle}>Как происходит доставка?</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.num} className={styles.stepRow}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>{s.num}</div>
                  <div className={styles.stepIcon}><s.Icon size={66} strokeWidth={1.2} /></div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={styles.stepArrow}>
                    <ArrowRight size={20} strokeWidth={2} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* География доставки */}
      <section className={styles.geoSection}>
        <div className={styles.container}>
          <h2 className={styles.geoTitle}>География доставки</h2>
          <div className={styles.geoGrid}>
            <div className={styles.geoMap}>
              {/* viewBox обрезан сверху/снизу на 35px с каждой стороны */}
              <svg viewBox="0 35 320 210" className={styles.mapSvg}>
                <circle cx="150" cy="140" r="11.5" fill="#111" />
                <text x="168" y="162" fontSize="14" fontWeight="700" fill="#111">Воронеж</text>
                {MAP_CITIES.map((city, i) => (
                  <g key={i}>
                    <line
                      x1="150" y1="140"
                      x2={city.x + 7} y2={city.y + 7}
                      stroke="#111111" strokeWidth="2"
                    />
                    <circle cx={city.x + 7} cy={city.y + 7} r="7" fill="#111" />
                    <text
                      x={city.x + 18} y={city.y + 12}
                      fontSize="12"
                      fontWeight="500"
                      fill="#111"
                    >
                      {city.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className={styles.geoDivider} />

            <div className={styles.geoZones}>
              {ZONES.map(({ name, time, Icon }, i) => (
                <div key={i} className={styles.geoZone}>
                  <div className={styles.geoIconWrap}>
                    <Icon size={56} strokeWidth={1.5} />
                  </div>
                  <div className={styles.geoText}>
                    <p className={styles.geoName}>{name}</p>
                    <p className={styles.geoTime}>{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Часто задаваемые вопросы */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.faqTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqGrid}>
            {FAQ.map(({ Icon, q, a }, i) => (
              <div key={i} className={styles.faqCard}>
                <div className={styles.faqIconWrap}>
                  <Icon size={42} strokeWidth={1.5} />
                </div>
                <div className={styles.faqText}>
                  <p className={styles.faqQ}>{q}</p>
                  <p className={styles.faqA}>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.cta}>
            <div className={styles.ctaLeft}>
              <h2 className={styles.ctaTitle}>Не знаете, успеем ли доставить?</h2>
              <p className={styles.ctaDesc}>Проверьте наличие или уточните у специалиста.</p>
              <div className={styles.ctaBtns}>
                <Link to="/catalog" className={styles.ctaBtnPrimary}>
                  Проверить наличие <ArrowRight size={20} strokeWidth={1.8} />
                </Link>
                <a href="tel:+79611898933" className={styles.ctaBtnSecondary}>
                  Позвонить специалисту <Phone size={20} strokeWidth={1.5} />
                </a>
              </div>
            </div>
            <div className={styles.ctaRight}>
              <img src={img('images/delivery-cta.png')} alt="" className={styles.ctaImg} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
