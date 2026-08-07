import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, MapPin, Phone, Mail, Building2, Plus, Trash2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import {
  listCustomerOrders,
  listDeliveryAddresses,
  createDeliveryAddress,
  deleteDeliveryAddress,
} from '../lib/api/account'
import { formatMoney } from '../lib/money'
import { orderStatusLabel } from '../lib/labels'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './AccountPage.module.css'

const TABS = [
  { key: 'orders', label: 'Заказы', Icon: Package },
  { key: 'addresses', label: 'Адреса', Icon: MapPin },
  { key: 'profile', label: 'Профиль', Icon: User },
]

const DESTINATION_LABELS = { voronezh: 'Воронеж', intercity: 'Другой город' }

export default function AccountPage() {
  const { customer, loading: authLoading, logout, isAuth } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')

  useDocumentTitle('Личный кабинет')

  useEffect(() => {
    if (!authLoading && !isAuth) navigate('/', { replace: true })
  }, [authLoading, isAuth, navigate])

  if (authLoading || !customer) return null

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {(customer.name || '?')[0].toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{customer.name}</h1>
            <p className={styles.email}>{customer.email}</p>
            {customer.company_name && <p className={styles.company}>{customer.company_name}</p>}
          </div>
          <button type="button" className={styles.logoutBtn} onClick={logout}>
            <LogOut size={18} strokeWidth={1.8} />
            Выйти
          </button>
        </div>

        {settings?.manager && (
          <div className={styles.managerCard}>
            <p className={styles.managerLabel}>Ваш менеджер</p>
            <p className={styles.managerName}>{settings.manager.name}</p>
            <div className={styles.managerContacts}>
              <a href={`tel:${settings.manager.phone}`} className={styles.managerLink}>
                <Phone size={15} strokeWidth={1.8} />
                {settings.manager.phone}
              </a>
              <a href={`mailto:${settings.manager.email}`} className={styles.managerLink}>
                <Mail size={15} strokeWidth={1.8} />
                {settings.manager.email}
              </a>
            </div>
          </div>
        )}

        <div className={styles.tabs}>
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
              onClick={() => setTab(key)}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'orders' && <OrdersTab />}
        {tab === 'addresses' && <AddressesTab />}
        {tab === 'profile' && <ProfileTab customer={customer} />}
      </div>
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 10

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listCustomerOrders({ page: p, limit: PER_PAGE })
      setOrders(res.items || [])
      setTotal(res.total || 0)
      setPage(p)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load])

  if (loading) return <div className={styles.tabLoading}>Загружаем заказы…</div>
  if (error) return <div className={styles.tabError}>{error}</div>
  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={48} strokeWidth={1.2} />
        <p>Заказов пока нет</p>
        <Link to="/catalog" className={styles.emptyLink}>Перейти в каталог</Link>
      </div>
    )
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <div className={styles.orderList}>
        {orders.map(order => (
          <Link key={order.public_id} to={`/orders/${order.public_id}`} className={styles.orderCard}>
            <div className={styles.orderMeta}>
              <span className={styles.orderId}>#{order.public_id}</span>
              <span className={`${styles.orderStatus} ${styles[`status_${order.status}`]}`}>
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <div className={styles.orderItems}>
              {(order.items || []).slice(0, 3).map((item, i) => (
                <span key={i} className={styles.orderItem}>
                  {item.name || item.subtitle || '—'}
                </span>
              ))}
              {order.items?.length > 3 && (
                <span className={styles.orderItemMore}>+{order.items.length - 3} ещё</span>
              )}
            </div>
            {order.pricing?.total && (
              <p className={styles.orderTotal}>{formatMoney(order.pricing.total)}</p>
            )}
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => load(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressesTab() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ destination: 'voronezh', city: 'Воронеж', address_line: '', postal_code: '', label: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listDeliveryAddresses()
      setAddresses(res.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setFormError(null)
    try {
      await createDeliveryAddress({
        destination: form.destination,
        city: form.city,
        address_line: form.address_line,
        postal_code: form.postal_code || null,
        label: form.label || undefined,
      })
      setShowForm(false)
      setForm({ destination: 'voronezh', city: 'Воронеж', address_line: '', postal_code: '', label: '' })
      await load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, version) => {
    try {
      await deleteDeliveryAddress(id, `"${version}"`)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className={styles.tabLoading}>Загружаем адреса…</div>
  if (error) return <div className={styles.tabError}>{error}</div>

  return (
    <div>
      <div className={styles.addressList}>
        {addresses.map(addr => (
          <div key={addr.id} className={`${styles.addressCard} ${addr.is_default ? styles.addressDefault : ''}`}>
            <div className={styles.addressInfo}>
              <p className={styles.addressLabel}>{addr.label || DESTINATION_LABELS[addr.destination] || addr.destination}</p>
              <p className={styles.addressLine}>{addr.city}, {addr.address_line}</p>
              {addr.postal_code && <p className={styles.addressPostal}>Индекс: {addr.postal_code}</p>}
              {addr.is_default && <span className={styles.defaultBadge}>По умолчанию</span>}
            </div>
            <button
              type="button"
              className={styles.deleteAddrBtn}
              onClick={() => handleDelete(addr.id, addr.version)}
              aria-label="Удалить адрес"
            >
              <Trash2 size={16} strokeWidth={1.8} />
            </button>
          </div>
        ))}
        {addresses.length === 0 && !showForm && (
          <div className={styles.emptyState}>
            <MapPin size={48} strokeWidth={1.2} />
            <p>Сохранённых адресов нет</p>
          </div>
        )}
      </div>

      {!showForm && (
        <button type="button" className={styles.addAddrBtn} onClick={() => setShowForm(true)}>
          <Plus size={18} strokeWidth={2} />
          Добавить адрес
        </button>
      )}

      {showForm && (
        <form className={styles.addrForm} onSubmit={handleAdd}>
          <p className={styles.formTitle}>Новый адрес</p>
          <div className={styles.radios}>
            {[{ value: 'voronezh', label: 'Воронеж' }, { value: 'intercity', label: 'Другой город' }].map(opt => (
              <label key={opt.value} className={`${styles.radio} ${form.destination === opt.value ? styles.radioActive : ''}`}>
                <input
                  type="radio"
                  name="destination"
                  value={opt.value}
                  checked={form.destination === opt.value}
                  onChange={() => setForm(f => ({
                    ...f,
                    destination: opt.value,
                    city: opt.value === 'voronezh' ? 'Воронеж' : '',
                  }))}
                  className={styles.radioHidden}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <input
            className={styles.input}
            placeholder="Метка (например: Клиника)"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          />
          {form.destination === 'intercity' && (
            <input
              className={styles.input}
              placeholder="Город*"
              required
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            />
          )}
          <input
            className={styles.input}
            placeholder="Адрес (улица, дом, кв.)*"
            required
            minLength={5}
            value={form.address_line}
            onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Почтовый индекс"
            value={form.postal_code}
            onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
          />
          {formError && <p className={styles.formError}>{formError}</p>}
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function ProfileTab({ customer }) {
  return (
    <div className={styles.profileGrid}>
      <div className={styles.profileField}>
        <span className={styles.fieldLabel}>Имя</span>
        <span className={styles.fieldValue}>{customer.name || '—'}</span>
      </div>
      <div className={styles.profileField}>
        <span className={styles.fieldLabel}>Email</span>
        <span className={styles.fieldValue}>{customer.email || '—'}</span>
      </div>
      <div className={styles.profileField}>
        <span className={styles.fieldLabel}>Телефон</span>
        <span className={styles.fieldValue}>{customer.phone || '—'}</span>
      </div>
      <div className={styles.profileField}>
        <span className={styles.fieldLabel}>Тип клиента</span>
        <span className={styles.fieldValue}>
          {customer.customer_type === 'legal_entity' ? 'Юридическое лицо' : 'Физическое лицо'}
        </span>
      </div>
      {customer.company_name && (
        <div className={styles.profileField}>
          <span className={styles.fieldLabel}><Building2 size={14} strokeWidth={1.8} /> Компания</span>
          <span className={styles.fieldValue}>{customer.company_name}</span>
        </div>
      )}
      {customer.inn && (
        <div className={styles.profileField}>
          <span className={styles.fieldLabel}>ИНН</span>
          <span className={styles.fieldValue}>{customer.inn}</span>
        </div>
      )}
      <div className={styles.profileField}>
        <span className={styles.fieldLabel}>Email подтверждён</span>
        <span className={styles.fieldValue}>{customer.is_email_verified ? 'Да' : 'Нет'}</span>
      </div>
    </div>
  )
}
