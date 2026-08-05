import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { createCheckoutOrder, createQuoteOrder, saveOrderAccess } from '../lib/api/orders'
import { redirectToPayment, formatFieldErrors } from '../lib/payment'
import { formatMoney, productImageUrl } from '../lib/money'
import { ApiError } from '../lib/apiClient'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { customer, isAuth } = useAuth()
  const { settings } = useSettings()
  const { items, checkoutItems, total, subtotal, delivery, clearGuest, count, setOpen, refreshServerCart } = useCart()
  const [orderMode, setOrderMode] = useState('checkout')
  const [paymentMethod, setPaymentMethod] = useState('sbp')
  const [destination, setDestination] = useState('voronezh')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrorText, setFieldErrorText] = useState(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Воронеж',
    addressLine: '',
    comment: '',
    consent: false,
    website: '',
    companyName: '',
    inn: '',
    kpp: '',
    documentsEmail: '',
  })

  useEffect(() => {
    if (!customer) return
    setForm(f => ({
      ...f,
      name: f.name || customer.name || '',
      phone: f.phone || customer.phone || '',
      email: f.email || customer.email || '',
    }))
  }, [customer])

  useDocumentTitle('Оформление заказа')

  const canSubmit = useMemo(() => {
    const base = checkoutItems.length > 0 && form.consent && form.name && form.phone
    if (orderMode === 'quote') return base && form.companyName && form.inn && form.documentsEmail
    return base && form.city && form.addressLine
  }, [checkoutItems, form, orderMode])

  if (!count) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Оформление заказа</h1>
          <p className={styles.empty}>Корзина пуста. <Link to="/catalog">Перейти в каталог</Link></p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    setFieldErrorText(null)
    try {
      const customerContact = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      }

      let res
      if (orderMode === 'quote') {
        res = await createQuoteOrder({
          customer: customerContact,
          legal_entity: {
            company_name: form.companyName.trim(),
            inn: form.inn.trim(),
            kpp: form.kpp.trim() || undefined,
            documents_email: form.documentsEmail.trim(),
          },
          delivery: form.city ? {
            destination,
            city: form.city.trim(),
            address_line: form.addressLine.trim() || '—',
            comment: form.comment.trim() || null,
          } : undefined,
          items: checkoutItems,
          comment: form.comment.trim() || undefined,
          consent: true,
          website: form.website,
        })
      } else {
        res = await createCheckoutOrder({
          customer: customerContact,
          delivery: {
            destination,
            city: form.city.trim(),
            address_line: form.addressLine.trim(),
            comment: form.comment.trim() || null,
          },
          items: checkoutItems,
          payment_method: paymentMethod,
          comment: form.comment.trim() || undefined,
          consent: true,
          website: form.website,
        })
      }

      if (res?.public_id && res?.order_access_token) {
        saveOrderAccess(res.public_id, res.order_access_token)
      }
      clearGuest()
      try { await refreshServerCart() } catch { /* guest or empty */ }
      setOpen(false)

      if (res?.payment) {
        redirectToPayment(res.payment)
        return
      }
      navigate(`/orders/${res.public_id}`)
    } catch (err) {
      const fields = formatFieldErrors(err instanceof ApiError ? err.fieldErrors : null)
      setFieldErrorText(fields)
      setError(err.message || 'Не удалось оформить заказ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/">Главная</Link><span>/</span>
          <Link to="/catalog">Каталог</Link><span>/</span>
          <span>Оформление</span>
        </nav>
        <h1 className={styles.title}>Оформление заказа</h1>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${orderMode === 'checkout' ? styles.modeBtnActive : ''}`}
            onClick={() => setOrderMode('checkout')}
          >
            Онлайн-оплата
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${orderMode === 'quote' ? styles.modeBtnActive : ''}`}
            onClick={() => setOrderMode('quote')}
          >
            Счёт для юрлиц
          </button>
        </div>
        <p className={styles.sub}>
          {orderMode === 'quote'
            ? 'Заявка на выставление счёта. Менеджер свяжется с вами и выставит счёт по реквизитам.'
            : `Онлайн-оплата. Товар резервируется примерно на ${settings?.stock_reservation_ttl_seconds || 300} сек.${!isAuth ? ' Можно оформить без входа.' : ''}`
          }
        </p>

        <div className={styles.layout}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.honeypot}
              type="text"
              name="website"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <section className={styles.section}>
              <h2>Контакты</h2>
              <input className={styles.input} required minLength={2} placeholder="Имя*" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className={styles.input} required minLength={7} type="tel" placeholder="Телефон*" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <input className={styles.input} type="email" placeholder="Эл. почта" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </section>

            {orderMode === 'quote' && (
              <section className={styles.section}>
                <h2>Реквизиты юрлица</h2>
                <input className={styles.input} required placeholder="Название компании*" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
                <input className={styles.input} required minLength={10} maxLength={12} placeholder="ИНН*" value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} />
                <input className={styles.input} maxLength={9} placeholder="КПП (необязательно)" value={form.kpp} onChange={e => setForm(f => ({ ...f, kpp: e.target.value }))} />
                <input className={styles.input} required type="email" placeholder="Email для документов*" value={form.documentsEmail} onChange={e => setForm(f => ({ ...f, documentsEmail: e.target.value }))} />
              </section>
            )}

            <section className={styles.section}>
              <h2>Доставка</h2>
              <div className={styles.radios}>
                {[
                  { value: 'voronezh', label: 'По Воронежу' },
                  { value: 'intercity', label: 'В другой город' },
                ].map(opt => (
                  <label key={opt.value} className={`${styles.radio} ${destination === opt.value ? styles.radioActive : ''}`}>
                    <input type="radio" name="destination" checked={destination === opt.value} onChange={() => setDestination(opt.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <input className={styles.input} required minLength={2} placeholder="Город*" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              <input className={styles.input} required minLength={5} placeholder="Адрес*" value={form.addressLine} onChange={e => setForm(f => ({ ...f, addressLine: e.target.value }))} />
              <textarea className={styles.textarea} placeholder="Комментарий" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
            </section>

            {orderMode === 'checkout' && (
              <section className={styles.section}>
                <h2>Оплата</h2>
                <div className={styles.radios}>
                  {[
                    { value: 'sbp', label: 'СБП' },
                    { value: 'card', label: 'Карта' },
                  ].map(opt => (
                    <label key={opt.value} className={`${styles.radio} ${paymentMethod === opt.value ? styles.radioActive : ''}`}>
                      <input type="radio" name="pay" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </section>
            )}

            <label className={styles.consent}>
              <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} required />
              <span>Согласен на обработку персональных данных и условия оплаты</span>
            </label>

            {(error || fieldErrorText) && (
              <p className={styles.error}>
                {error}
                {fieldErrorText ? ` ${fieldErrorText}` : ''}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={!canSubmit || submitting}>
              {submitting
                ? (orderMode === 'quote' ? 'Отправляем заявку…' : 'Создаём оплату…')
                : (orderMode === 'quote' ? 'Запросить счёт' : 'Перейти к оплате')
              }
            </button>
          </form>

          <aside className={styles.summary}>
            <h2>Ваш заказ</h2>
            <ul className={styles.items}>
              {items.map(item => {
                const p = item.product
                const img = productImageUrl(p?.image, 'thumb')
                return (
                  <li key={item.id || p?.id}>
                    <div className={styles.itemPhoto}>{img && <img src={img} alt="" />}</div>
                    <div>
                      <p className={styles.itemName}>{p?.name}</p>
                      <p className={styles.itemMeta}>{item.quantity} шт. · {formatMoney(item.line_total || item.unit_price)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className={styles.totals}>
              <div><span>Товары</span><span>{formatMoney(subtotal)}</span></div>
              {delivery && <div><span>Доставка</span><span>{formatMoney(delivery)}</span></div>}
              <div className={styles.totalRow}><span>Итого</span><span>{formatMoney(total)}</span></div>
            </div>
            <p className={styles.note}>Итоговая доставка и сумма подтверждаются сервером при создании заказа.</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
