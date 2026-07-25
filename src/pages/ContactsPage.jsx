import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowRight, ChevronDown, Lock, Package, Truck } from 'lucide-react'
import styles from './ContactsPage.module.css'

const FAQ = [
  { q: 'Можно ли приехать лично?', a: 'Да, мы работаем по адресу: г. Воронеж, ул. Димитрова 56а. Предварительно позвоните, чтобы убедиться в наличии нужного товара.' },
  { q: 'Есть ли самовывоз?', a: 'Да, самовывоз доступен. Уточните время работы склада по телефону.' },
  { q: 'Работаете ли в выходные?', a: 'По вопросам заказов — звоните в любое время. Доставка осуществляется в рабочие дни.' },
  { q: 'Как быстро отвечаете?', a: 'Обычно в течение 15–30 минут в рабочее время. В выходные — по мере возможности.' },
  { q: 'Можно ли отправить снимок для подбора?', a: 'Да, пришлите фото в ВКонтакте или на email — специалист поможет с подбором.' },
  { q: 'Работаете ли вы с физическими лицами?', a: 'Работаем преимущественно с ветеринарными клиниками и специалистами.' },
]

export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', phone: '', clinic: '', comment: '' })
  const [sent, setSent] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>/</span>
            <span>Контакты</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Всегда на связи,<br/>когда это действительно<br/>важно</h1>
            <p className={styles.heroDesc}>Если импланты нужны срочно — свяжитесь с нами любым удобным способом. Мы быстро проверим наличие, поможем подобрать изделия и организуем доставку.</p>
          </div>
          <div className={styles.heroPhoto}>ГРАФИКА</div>
        </div>

        {/* Способы связи */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Способы связи</h2>
          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}><Phone size={28} strokeWidth={1.5} /></div>
              <p className={styles.contactMethod}>Телефон</p>
              <a href="tel:+79611898933" className={styles.contactValue}>+7 (961) 189-89-33</a>
              <a href="tel:+79611898933" className={styles.contactBtn}>Позвонить</a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}><MessageCircle size={28} strokeWidth={1.5} /></div>
              <p className={styles.contactMethod}>ВКонтакте</p>
              <p className={styles.contactValue}>быстрые ответы</p>
              <a href="#" className={styles.contactBtn}>Написать</a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}><Mail size={28} strokeWidth={1.5} /></div>
              <p className={styles.contactMethod}>Email</p>
              <a href="mailto:Kosto-Vet@yandex.ru" className={styles.contactValue}>Kosto-Vet@yandex.ru</a>
              <a href="mailto:Kosto-Vet@yandex.ru" className={styles.contactBtn}>Написать письмо</a>
            </div>
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
                  <button type="submit" className={styles.submitBtn}>Связаться с нами</button>
                  <p className={styles.privacy}>
                    <Lock size={12} strokeWidth={2} />
                    Обрабатываем в рамках политики конфиденциальности
                  </p>
                </form>
              )}
            </div>

            <div className={styles.mapCol}>
              <h2 className={styles.sectionTitle}>Где мы находимся</h2>
              <div className={styles.mapPlaceholder}>ТУТ БУДЕТ Яндекс.КАРТА</div>
              <div className={styles.mapInfo}>
                <div className={styles.mapInfoItem}>
                  <MapPin size={16} strokeWidth={1.5} />
                  <div>
                    <p className={styles.mapInfoLabel}>Адрес</p>
                    <p>Россия, г. Воронеж,<br/>ул. Димитрова 56а</p>
                  </div>
                </div>
                <div className={styles.mapInfoItem}>
                  <Clock size={16} strokeWidth={1.5} />
                  <div>
                    <p className={styles.mapInfoLabel}>Режим работы</p>
                    <p>Ежедневно<br/>09:00–18:00</p>
                  </div>
                </div>
                <div className={styles.mapInfoItem}>
                  <MapPin size={16} strokeWidth={1.5} />
                  <div>
                    <p className={styles.mapInfoLabel}>Самовывоз</p>
                    <p>По предварительной договорённости</p>
                  </div>
                </div>
                <div className={styles.mapInfoItem}>
                  <Truck size={16} strokeWidth={1.5} />
                  <div>
                    <p className={styles.mapInfoLabel}>Доставка</p>
                    <p>По Воронежу — 2–4 часа.<br/>По России — 1–3 рабочих дня.</p>
                  </div>
                </div>
                <a href="#" className={styles.mapRouteBtn}>Открыть в Яндекс.Картах →</a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Часто задаваемые вопросы</h2>
          <div className={styles.faqGrid}>
            {[FAQ.slice(0, 3), FAQ.slice(3)].map((col, ci) => (
              <div key={ci}>
                {col.map((item, i) => {
                  const idx = ci * 3 + i
                  return (
                    <div key={idx} className={`${styles.faqItem} ${faqOpen === idx ? styles.faqOpen : ''}`}>
                      <button className={styles.faqQ} onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}>
                        {item.q}
                        <ChevronDown size={14} strokeWidth={2} style={{ transform: faqOpen === idx ? 'rotate(180deg)' : 'none', transition: '200ms', flexShrink: 0 }} />
                      </button>
                      {faqOpen === idx && <p className={styles.faqA}>{item.a}</p>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>Нужен имплант сегодня?</h2>
            <p className={styles.ctaDesc}>Мы проверим наличие, подберём совместно нужное изделие и подготовим заказ к отправке.</p>
            <div className={styles.ctaBtns}>
              <Link to="/catalog" className={styles.ctaBtnPrimary}>Проверить наличие <ArrowRight size={16} /></Link>
              <a href="tel:+79611898933" className={styles.ctaBtnSecondary}>
                <Phone size={16} strokeWidth={1.5} />
                Позвонить сейчас
              </a>
            </div>
          </div>
          <div className={styles.ctaPhoto}>Графика</div>
        </div>
      </div>
    </div>
  )
}
