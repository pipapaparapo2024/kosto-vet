import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowRight, ChevronDown, Package, Truck, SquareArrowOutUpRight, Timer, AlertCircle } from 'lucide-react'
import { img } from '../utils/assetUrl'
import { createLead } from '../lib/api/leads'
import { useSettings } from '../context/SettingsContext'
import { formatFieldErrors } from '../lib/payment'
import { ApiError } from '../lib/apiClient'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './ContactsPage.module.css'

const FAQ_LEFT = [
  { q: 'Можно ли приехать лично?', a: 'Да, мы работаем по адресу: г. Воронеж, ул. Димитрова 56а. Предварительно позвоните, чтобы убедиться в наличии нужного товара.' },
  { q: 'Есть ли самовывоз?', a: 'Да, самовывоз доступен. Уточните время работы склада по телефону.' },
  { q: 'Работаете ли в выходные?', a: 'По вопросам заказов — звоните в любое время. Доставка осуществляется в рабочие дни.' },
]

const FAQ_RIGHT = [
  { q: 'Как быстро отвечаете?', a: 'Обычно в течение 15–30 минут в рабочее время. В выходные — по мере возможности.' },
  { q: 'Можно ли отправить снимок для подбора?', a: 'Да, пришлите фото в ВКонтакте или на email — специалист поможет с подбором.' },
  { q: 'Работаете ли вы с физическими лицами?', a: 'Работаем преимущественно с ветеринарными клиниками и специалистами.' },
]

export default function ContactsPage() {
  const { settings } = useSettings()
  const phone = settings?.manager?.phone || settings?.emergency_phone || '+7 (961) 189-89-33'
  const email = settings?.manager?.email || 'Kosto-Vet@yandex.ru'
  const phoneHref = `tel:${String(phone).replace(/\D/g, '')}`

  const [form, setForm] = useState({ name: '', phone: '', clinic: '', comment: '', consent: false, website: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)
  useDocumentTitle('Контакты', 'Свяжитесь с KOSTO-VET: телефон, email или заявка на сайте.')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.consent || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await createLead({
        name: form.name,
        phone: form.phone,
        company: form.clinic,
        message: form.comment,
        source: 'contact',
        website: form.website,
      })
      setSent(true)
    } catch (err) {
      const fields = formatFieldErrors(err instanceof ApiError ? err.fieldErrors : null)
      setError(fields ? `${err.message}. ${fields}` : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero — breadcrumb внутри, чтобы картинка выровнялась по верху */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <span>Контакты</span>
          </nav>
          <h1 className={styles.heroTitle}>Всегда на связи, когда это действительно важно</h1>
          <p className={styles.heroDesc}>Если импланты нужны срочно — свяжитесь с нами любым удобным способом. Мы быстро проверим наличие, поможем подобрать изделия и организуем доставку.</p>
        </div>
        <img src={img('images/cat-contacts.png')} alt="" className={styles.heroPhoto} aria-hidden="true" />
      </div>

      <div className={styles.container}>

        {/* Способы связи */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Способы связи</h2>
          <div className={styles.contactCards}>
            <ContactCard
              Icon={Phone}
              method="Телефон"
              value={phone}
              href={phoneHref}
              btnLabel="Позвонить"
            />
            <ContactCard
              Icon={MessageCircle}
              method="ВКонтакте"
              value="Быстрые ответы"
              href="#"
              btnLabel="Написать"
            />
            <ContactCard
              Icon={Mail}
              method="Эл. почта"
              value={email}
              href={`mailto:${email}`}
              btnLabel="Написать письмо"
            />
          </div>
        </section>

        {/* Форма + Карта */}
        <section className={styles.section}>
          <div className={styles.formMapGrid}>
            <div className={styles.formCol}>
              <h2 className={styles.sectionTitle}>Или оставьте заявку</h2>
              {sent ? (
                <div className={styles.formSuccess}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                  <p>Заявка получена! Свяжемся в течение нескольких минут.</p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <input className={styles.input} type="text" placeholder="Ваше имя*" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                  <input className={styles.input} type="tel" placeholder="Телефон*" required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                  <input className={styles.input} type="text" placeholder="Клиника" value={form.clinic} onChange={e => setForm(f => ({...f, clinic: e.target.value}))} />
                  <textarea className={styles.textarea} placeholder="Комментарий" value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} />
                  <input
                    type="text"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                    value={form.website}
                    onChange={e => setForm(f => ({...f, website: e.target.value}))}
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                    aria-hidden="true"
                  />
                  <label className={styles.consentRow}>
                    <input
                      type="checkbox"
                      required
                      checked={form.consent}
                      onChange={e => setForm(f => ({...f, consent: e.target.checked}))}
                    />
                    <span>
                      Согласен на{' '}
                      <Link to="/documents/obrabotka-personalnyh-dannyh" target="_blank">обработку персональных данных</Link>
                    </span>
                  </label>
                  {error && (
                    <p className={styles.formError}>
                      <AlertCircle size={16} strokeWidth={2} />
                      {error}
                    </p>
                  )}
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Отправляем…' : 'Связаться с нами'}
                  </button>
                  <p className={styles.privacy}>
                    <Timer size={18} strokeWidth={1.8} />
                    Обычно отвечаем в течение нескольких минут.
                  </p>
                </form>
              )}
            </div>

            <div className={styles.mapCol}>
              <h2 className={styles.sectionTitle}>Где мы находимся</h2>
              <div className={styles.mapBlock}>
                <div className={styles.mapPlaceholder}>ТУТ БУДЕТ Яндекс.КАРТА</div>
                <div className={styles.mapDivider} />
                <div className={styles.mapInfo}>
                  <div className={styles.mapInfoItem}>
                    <MapPin size={29} strokeWidth={2} className={styles.mapIcon} />
                    <div>
                      <p className={styles.mapInfoLabel}>Адрес</p>
                      <p className={styles.mapInfoText}>Россия, г. Воронеж, ул. Димитрова 56а</p>
                    </div>
                  </div>
                  <div className={styles.mapInfoItem}>
                    <Clock size={29} strokeWidth={2} className={styles.mapIcon} />
                    <div>
                      <p className={styles.mapInfoLabel}>Режим работы</p>
                      <p className={styles.mapInfoText}>Ежедневно 09:00–18:00</p>
                    </div>
                  </div>
                  <div className={styles.mapInfoItem}>
                    <Package size={29} strokeWidth={2} className={styles.mapIcon} />
                    <div>
                      <p className={styles.mapInfoLabel}>Самовывоз</p>
                      <p className={styles.mapInfoText}>По предварительному согласованию</p>
                    </div>
                  </div>
                  <div className={styles.mapInfoItem}>
                    <Truck size={29} strokeWidth={2} className={`${styles.mapIcon} ${styles.mapIconTruck}`} />
                    <div>
                      <p className={styles.mapInfoLabel}>Доставка</p>
                      <p className={styles.mapInfoText}>
                        По Воронежу — 2–4 часа<br />
                        По России — транспортными компаниями
                      </p>
                    </div>
                  </div>
                  <a href="#" className={styles.mapRouteBtn}>
                    Открыть в Яндекс.Картах
                    <SquareArrowOutUpRight size={16} strokeWidth={1.8} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqList}>
            <div className={styles.faqCol}>
              {FAQ_LEFT.map((item, i) => {
                const id = `L${i}`
                const isOpen = faqOpen === id
                return (
                  <div key={item.q} className={`${styles.faqItem}${isOpen ? ` ${styles.faqOpen}` : ''}`}>
                    <button
                      type="button"
                      className={styles.faqQ}
                      aria-expanded={isOpen}
                      onClick={() => setFaqOpen(isOpen ? null : id)}
                    >
                      {item.q}
                      <ChevronDown
                        size={14}
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
            <div className={styles.faqCol}>
              {FAQ_RIGHT.map((item, i) => {
                const id = `R${i}`
                const isOpen = faqOpen === id
                return (
                  <div key={item.q} className={`${styles.faqItem}${isOpen ? ` ${styles.faqOpen}` : ''}`}>
                    <button
                      type="button"
                      className={styles.faqQ}
                      aria-expanded={isOpen}
                      onClick={() => setFaqOpen(isOpen ? null : id)}
                    >
                      {item.q}
                      <ChevronDown
                        size={14}
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
          </div>
        </section>

        {/* CTA */}
        <div className={styles.cta}>
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>Нужен имплант сегодня?</h2>
            <p className={styles.ctaDesc}>Мы проверим наличие, подберём совместимое изделие и подготовим заказ к отправке.</p>
            <div className={styles.ctaBtns}>
              <Link to="/catalog" className={styles.ctaBtnPrimary}>
                Проверить наличие <ArrowRight size={20} strokeWidth={1.8} />
              </Link>
              <a href="tel:+79611898933" className={styles.ctaBtnSecondary}>
                Звоните сейчас <Phone size={20} strokeWidth={1.5} />
              </a>
            </div>
          </div>
          <div className={styles.ctaRight}>
            <img src={img('images/contacts-cta.png')} alt="" className={styles.ctaImg} aria-hidden="true" />
          </div>
        </div>

      </div>
    </div>
  )
}

function ContactCard({ Icon, method, value, href, btnLabel }) {
  return (
    <div className={styles.contactCard}>
      <div className={styles.contactIcon}><Icon size={28} strokeWidth={1.5} /></div>
      <p className={styles.contactMethod}>{method}</p>
      <p className={styles.contactValue}>{value}</p>
      <a href={href} className={styles.contactBtn}>{btnLabel}</a>
    </div>
  )
}
