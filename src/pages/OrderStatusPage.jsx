import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicOrder, getOrderAccess, createOrderPaymentAttempt, saveOrderAccess } from '../lib/api/orders'
import { redirectToPayment, formatFieldErrors } from '../lib/payment'
import { formatMoney, stockLabel } from '../lib/money'
import { ApiError } from '../lib/apiClient'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './OrderStatusPage.module.css'

export default function OrderStatusPage() {
  const { publicId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('sbp')

  const load = async () => {
    const token = getOrderAccess(publicId)
    if (!token) {
      setError('Нет доступа к заказу. Токен выдаётся один раз при оформлении и хранится только в этой сессии браузера.')
      setLoading(false)
      return
    }
    try {
      const data = await getPublicOrder(publicId, token)
      setOrder(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [publicId])

  useDocumentTitle(publicId ? `Заказ ${publicId}` : 'Статус заказа')

  const canPay = order && ['awaiting_payment', 'new'].includes(order.status)
    && !['succeeded', 'not_required'].includes(order.payment_status)

  const handlePay = async () => {
    const token = getOrderAccess(publicId)
    if (!token || paying) return
    setPaying(true)
    setError(null)
    try {
      const res = await createOrderPaymentAttempt(publicId, token, paymentMethod)
      if (res?.public_id && res?.order_access_token) {
        saveOrderAccess(res.public_id, res.order_access_token)
      }
      if (res?.payment) {
        redirectToPayment(res.payment)
        return
      }
      await load()
    } catch (e) {
      const fields = formatFieldErrors(e instanceof ApiError ? e.fieldErrors : null)
      setError(fields ? `${e.message}. ${fields}` : e.message)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/">Главная</Link><span>/</span>
          <span>Статус заказа</span>
        </nav>
        <h1 className={styles.title}>Заказ {publicId}</h1>
        {loading && <p>Загрузка…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {order && (
          <div className={styles.card}>
            <p><strong>Статус:</strong> {order.status}</p>
            <p><strong>Оплата:</strong> {order.payment_status}</p>
            {order.delivery_tracking_number && (
              <p><strong>Трек:</strong> {order.delivery_tracking_number}</p>
            )}
            <p><strong>Итого:</strong> {formatMoney(order.pricing?.total)}</p>
            <ul className={styles.items}>
              {(order.items || []).map(item => (
                <li key={item.id || item.slug}>
                  {item.name} — {formatMoney(item.price)} · {stockLabel(item.stock)}
                </li>
              ))}
            </ul>
            {order.manager && (
              <p className={styles.manager}>
                Менеджер: {order.manager.name},{' '}
                <a href={`tel:${order.manager.phone.replace(/\D/g, '')}`}>{order.manager.phone}</a>
              </p>
            )}

            {canPay && (
              <div className={styles.payBox}>
                <p>Оплата ещё не завершена. Можно создать новую попытку (Robokassa sandbox).</p>
                <div className={styles.payRow}>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="sbp">СБП</option>
                    <option value="card">Карта</option>
                  </select>
                  <button type="button" onClick={handlePay} disabled={paying}>
                    {paying ? 'Переход…' : 'Оплатить'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
