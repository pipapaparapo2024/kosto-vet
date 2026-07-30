import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Phone, Shield, Zap, FileText, ShoppingBag, Package, FileDown, UserPlus,
  ShoppingCart, Heart, CreditCard, MapPin, FolderOpen, User, LogOut, ChevronRight, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { listCustomerOrders, listFavorites, removeFavorite, getCustomerOrder } from '../../../lib/api/account'
import { getCustomerManager } from '../../../lib/api/auth'
import { formatMoney } from '../../../lib/money'
import styles from './AuthDrawer.module.css'

const FEATURES = [
  { Icon: Shield, title: 'Безопасность данных', desc: 'Мы не передаём Ваши данные третьим лицам и надёжно их защищаем' },
  { Icon: Zap, title: 'Быстрый доступ', desc: 'Повторяйте заказы в один клик и экономьте время' },
  { Icon: FileText, title: 'Документы под рукой', desc: 'Счета, накладные и сертификаты всегда доступны в кабинете' },
]

const MENU_ITEMS = [
  { Icon: ShoppingCart, label: 'Мои заказы', key: 'orders' },
  { Icon: Heart, label: 'Избранное', key: 'favorites' },
  { Icon: CreditCard, label: 'Реквизиты', key: 'profile' },
  { Icon: MapPin, label: 'Адрес доставки', key: 'address' },
  { Icon: FolderOpen, label: 'Документы', key: null, to: '/documents' },
  { Icon: User, label: 'Контактный менеджер', key: 'manager' },
]

export default function AuthDrawer({ isOpen, onClose }) {
  const { customer, isAuth, loading, error, setError, login, register, logout } = useAuth()
  const [tab, setTab] = useState('login')
  const [panel, setPanel] = useState('home')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    customerType: 'individual',
    companyName: '',
    inn: '',
    consent: false,
    website: '',
  })

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      setPanel('home')
      setFormError(null)
      setError?.(null)
    }
  }, [isOpen, setError])

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    const result = await login({ email: loginForm.email.trim(), password: loginForm.password })
    setSubmitting(false)
    if (!result.ok) setFormError(result.error || 'Неверный email или пароль')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!regForm.consent) {
      setFormError('Нужно согласие с условиями')
      return
    }
    if (regForm.password.length < 12) {
      setFormError('Пароль не короче 12 символов')
      return
    }
    setFormError(null)
    setSubmitting(true)
    const result = await register({
      name: regForm.name.trim(),
      email: regForm.email.trim(),
      password: regForm.password,
      phone: regForm.phone.trim() || null,
      customerType: regForm.customerType,
      companyName: regForm.companyName.trim() || undefined,
      inn: regForm.inn.trim() || undefined,
      website: regForm.website,
    })
    setSubmitting(false)
    if (!result.ok) setFormError(result.error || 'Не удалось зарегистрироваться')
  }

  const handleLogout = async () => {
    await logout()
    setPanel('home')
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-label="Личный кабинет">
        {isAuth && customer ? (
          panel === 'home' ? (
            <ProfileView
              customer={customer}
              onClose={onClose}
              onLogout={handleLogout}
              onOpenPanel={setPanel}
            />
          ) : (
            <AccountPanel panel={panel} customer={customer} onBack={() => setPanel('home')} onClose={onClose} />
          )
        ) : (
          <div className={styles.authWrap}>
            <div className={styles.head}>
              <div>
                <h2 className={styles.title}>Личный кабинет</h2>
                <p className={styles.subtitle}>
                  {tab === 'login'
                    ? 'Войдите в кабинет, чтобы увидеть заказы, избранное и персональные условия'
                    : 'Создайте кабинет, чтобы видеть заказы, сохранять избранное и ускорить оформление'}
                </p>
              </div>
              <button className={styles.close} onClick={onClose} aria-label="Закрыть"><X size={18} strokeWidth={2} /></button>
            </div>

            <div className={styles.tabs}>
              <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => { setTab('login'); setFormError(null) }}>Вход</button>
              <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => { setTab('register'); setFormError(null) }}>Регистрация</button>
            </div>

            <div className={styles.body}>
              {(formError || error) && <p className={styles.formError}>{formError || error}</p>}

              {tab === 'login' ? (
                <>
                  <form className={styles.form} onSubmit={handleLogin}>
                    <Field label="Email" required>
                      <input
                        className={styles.input}
                        type="email"
                        autoComplete="email"
                        placeholder="ivanov@mail.ru"
                        required
                        value={loginForm.email}
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </Field>
                    <Field label="Пароль" required>
                      <input
                        className={styles.input}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Не менее 12 символов"
                        required
                        minLength={12}
                        value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      />
                    </Field>
                    <button type="submit" className={styles.submitBtn} disabled={submitting || loading}>
                      {submitting ? 'Входим…' : 'Войти'}
                    </button>
                    <p className={styles.forgotHint}>Сброс пароля временно недоступен</p>
                  </form>

                  <div className={styles.features}>
                    {FEATURES.map(({ Icon, title, desc }) => (
                      <div key={title} className={styles.feature}>
                        <div className={styles.featureIcon}><Icon size={18} strokeWidth={1.5} /></div>
                        <div>
                          <p className={styles.featureTitle}>{title}</p>
                          <p className={styles.featureDesc}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className={styles.switchNote}>
                    Нет кабинета?{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setTab('register')}>Зарегистрироваться</button>
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.formHint}>Заполните основные данные</p>
                  <form className={styles.form} onSubmit={handleRegister}>
                    <input
                      type="text"
                      name="website"
                      value={regForm.website}
                      onChange={e => setRegForm(f => ({ ...f, website: e.target.value }))}
                      tabIndex={-1}
                      autoComplete="off"
                      className={styles.honeypot}
                      aria-hidden="true"
                    />
                    <Field label="ФИО" required>
                      <input className={styles.input} type="text" required minLength={2} placeholder="Иванов Иван Иванович" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} />
                    </Field>
                    <Field label="Email" required>
                      <input className={styles.input} type="email" required placeholder="ivanov@mail.ru" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} />
                    </Field>
                    <Field label="Пароль" required>
                      <input className={styles.input} type="password" required minLength={12} placeholder="Не менее 12 символов" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} />
                    </Field>
                    <Field label="Телефон">
                      <div className={styles.phoneWrap}>
                        <Phone size={16} strokeWidth={1.5} className={styles.phoneIcon} />
                        <input className={`${styles.input} ${styles.inputPhone}`} type="tel" placeholder="+7 (___) ___-__-__" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </Field>
                    <Field label="Тип клиента">
                      <select
                        className={styles.input}
                        value={regForm.customerType}
                        onChange={e => setRegForm(f => ({ ...f, customerType: e.target.value }))}
                      >
                        <option value="individual">Физлицо</option>
                        <option value="legal_entity">Юрлицо / клиника</option>
                      </select>
                    </Field>
                    {regForm.customerType === 'legal_entity' && (
                      <>
                        <Field label="Название клиники / компании">
                          <input className={styles.input} type="text" placeholder="Например, ВетПлюс" value={regForm.companyName} onChange={e => setRegForm(f => ({ ...f, companyName: e.target.value }))} />
                        </Field>
                        <Field label="ИНН">
                          <input className={styles.input} type="text" minLength={10} maxLength={12} placeholder="10 или 12 цифр" value={regForm.inn} onChange={e => setRegForm(f => ({ ...f, inn: e.target.value }))} />
                        </Field>
                      </>
                    )}
                    <label className={styles.consentRow}>
                      <input type="checkbox" checked={regForm.consent} onChange={e => setRegForm(f => ({ ...f, consent: e.target.checked }))} />
                      <span>
                        Соглашаюсь с{' '}
                        <Link to="/documents/agreement" className={styles.termsLink} onClick={onClose}>пользовательским соглашением</Link>
                      </span>
                    </label>
                    <button type="submit" className={styles.submitBtn} disabled={submitting || loading || !regForm.consent}>
                      {submitting ? 'Создаём…' : 'Создать кабинет'}
                    </button>
                  </form>

                  <p className={styles.switchNote}>
                    Уже есть кабинет?{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setTab('login')}>Войти</button>
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.req}>*</span>}</label>
      {children}
    </div>
  )
}

function ProfileView({ customer, onClose, onLogout, onOpenPanel }) {
  const displayName = customer.company_name || customer.name
  const verified = customer.is_email_verified
  const manager = customer.manager

  return (
    <div className={styles.profileWrap}>
      <div className={styles.profileHead}>
        <h2 className={styles.title}>Личный кабинет</h2>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть"><X size={18} strokeWidth={2} /></button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <User size={28} strokeWidth={1.5} />
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileNameRow}>
            <span className={styles.profileName}>{displayName}</span>
            {verified && <span className={styles.badge}>✓ Подтвержден</span>}
          </div>
          <p className={styles.profileCity}>{customer.email}</p>
          {customer.inn && <p className={styles.profileInn}>ИНН {customer.inn}</p>}
        </div>
      </div>

      <div className={styles.quickBlock}>
        <p className={styles.quickTitle}>Быстрые действия</p>
        <div className={styles.quickGrid}>
          <button type="button" className={styles.quickItem} onClick={() => onOpenPanel('orders')}>
            <ShoppingBag size={22} strokeWidth={1.5} /><span>Мои заказы</span>
          </button>
          <button type="button" className={styles.quickItem} onClick={() => onOpenPanel('favorites')}>
            <Package size={22} strokeWidth={1.5} /><span>Избранное</span>
          </button>
          <Link to="/documents" className={styles.quickItem} onClick={onClose}>
            <FileDown size={22} strokeWidth={1.5} /><span>Документы</span>
          </Link>
          <button type="button" className={styles.quickItem} onClick={() => onOpenPanel('manager')}>
            <UserPlus size={22} strokeWidth={1.5} /><span>Менеджер</span>
          </button>
        </div>
      </div>

      <div className={styles.menuBlock}>
        {MENU_ITEMS.map(({ Icon, label, key, to }) => {
          const inner = (
            <>
              <Icon size={18} strokeWidth={1.5} className={styles.menuIcon} />
              <span className={styles.menuLabel}>{label}</span>
              <ChevronRight size={16} strokeWidth={2} className={styles.menuChevron} />
            </>
          )
          if (to) {
            return <Link key={label} to={to} className={styles.menuItem} onClick={onClose}>{inner}</Link>
          }
          if (!key) {
            return <button key={label} type="button" className={styles.menuItem} disabled>{inner}</button>
          }
          return (
            <button key={label} type="button" className={styles.menuItem} onClick={() => onOpenPanel(key)}>
              {inner}
            </button>
          )
        })}
      </div>

      <div className={styles.logoutBlock}>
        <button type="button" className={styles.logoutBtn} onClick={onLogout}>
          <LogOut size={18} strokeWidth={1.5} />
          Выйти из кабинета
        </button>
      </div>

      {manager && (
        <div className={styles.managerCard}>
          <div className={styles.managerPhoto}>{manager.name?.slice(0, 1) || 'М'}</div>
          <div className={styles.managerInfo}>
            <p className={styles.managerTitle}>Ваш персональный менеджер</p>
            <p className={styles.managerName}>{manager.name}</p>
            <p className={styles.managerPhone}>{manager.phone}</p>
            <a href={`tel:${manager.phone.replace(/\D/g, '')}`} className={styles.managerBtn}>Позвонить</a>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountPanel({ panel, customer, onBack, onClose }) {
  const titles = {
    orders: 'Мои заказы',
    favorites: 'Избранное',
    profile: 'Реквизиты',
    address: 'Адрес доставки',
    manager: 'Менеджер',
  }

  return (
    <div className={styles.profileWrap}>
      <div className={styles.profileHead}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Назад">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <h2 className={styles.title}>{titles[panel] || 'Кабинет'}</h2>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть"><X size={18} strokeWidth={2} /></button>
      </div>

      <div className={styles.panelBody}>
        {panel === 'orders' && <OrdersPanel />}
        {panel === 'favorites' && <FavoritesPanel />}
        {panel === 'profile' && <ProfilePanel customer={customer} />}
        {panel === 'address' && <AddressPanel />}
        {panel === 'manager' && <ManagerPanel manager={customer.manager} />}
      </div>
    </div>
  )
}

function OrdersPanel() {
  const [data, setData] = useState(null)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listCustomerOrders({ page: 1, limit: 20 })
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  const openDetail = async (publicId) => {
    setError(null)
    try {
      setDetail(await getCustomerOrder(publicId))
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <p className={styles.formError}>{error}</p>
  if (!data) return <p className={styles.panelMuted}>Загрузка…</p>
  if (!data.items?.length) return <p className={styles.panelMuted}>Заказов пока нет</p>

  if (detail) {
    return (
      <div className={styles.profileFields}>
        <button type="button" className={styles.linkBtn} onClick={() => setDetail(null)}>← К списку</button>
        <p><strong>Заказ {detail.public_id}</strong></p>
        <p>Статус: {detail.status}</p>
        <p>Оплата: {detail.payment_status}</p>
        <p>Итого: {formatMoney(detail.pricing?.total)}</p>
        <ul className={styles.list}>
          {(detail.items || []).map(item => (
            <li key={item.id || item.slug} className={styles.listItem}>
              <span className={styles.listTitle}>{item.name}</span>
              <span className={styles.listMeta}>{formatMoney(item.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <ul className={styles.list}>
      {data.items.map(order => (
        <li key={order.public_id} className={styles.listItem}>
          <button type="button" className={styles.listTitle} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => openDetail(order.public_id)}>
            Заказ {order.public_id}
            <span className={styles.panelMuted} style={{ display: 'block', fontWeight: 400 }}>{order.status} · {order.payment_status}</span>
          </button>
          <span className={styles.listMeta}>{formatMoney(order.pricing?.total)}</span>
        </li>
      ))}
    </ul>
  )
}

function FavoritesPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    listFavorites()
      .then(setData)
      .catch(e => setError(e.message))
  }

  useEffect(() => { load() }, [])

  const onRemove = async (productId) => {
    try {
      await removeFavorite(productId)
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <p className={styles.formError}>{error}</p>
  if (!data) return <p className={styles.panelMuted}>Загрузка…</p>
  if (!data.items?.length) return <p className={styles.panelMuted}>В избранном пусто</p>

  return (
    <ul className={styles.list}>
      {data.items.map(fav => (
        <li key={fav.id} className={styles.listItem}>
          <Link
            to={`/catalog/${fav.product.category_slug}/${fav.product.slug}`}
            className={styles.listTitle}
          >
            {fav.product.name}
          </Link>
          <button type="button" className={styles.linkBtn} onClick={() => onRemove(fav.product.id)}>
            Убрать
          </button>
        </li>
      ))}
    </ul>
  )
}

function ProfilePanel({ customer }) {
  const { updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    customer_type: customer.customer_type || 'individual',
    company_name: customer.company_name || '',
    inn: customer.inn || '',
    documents_email: customer.documents_email || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const onSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    setErr(null)
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim(),
      customer_type: form.customer_type,
      company_name: form.company_name.trim() || undefined,
      inn: form.inn.trim() || undefined,
      documents_email: form.documents_email.trim() || undefined,
    }
    const result = await updateProfile(payload)
    setSaving(false)
    if (result.ok) setMsg('Сохранено')
    else setErr(result.error || 'Ошибка сохранения')
  }

  return (
    <form className={styles.form} onSubmit={onSave} style={{ padding: 0 }}>
      <Field label="Имя" required>
        <input className={styles.input} required minLength={2} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </Field>
      <Field label="Email" required>
        <input className={styles.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </Field>
      <Field label="Телефон">
        <input className={styles.input} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </Field>
      <Field label="Тип клиента">
        <select className={styles.input} value={form.customer_type} onChange={e => setForm(f => ({ ...f, customer_type: e.target.value }))}>
          <option value="individual">Физлицо</option>
          <option value="legal_entity">Юрлицо</option>
        </select>
      </Field>
      {form.customer_type === 'legal_entity' && (
        <>
          <Field label="Компания">
            <input className={styles.input} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
          </Field>
          <Field label="ИНН">
            <input className={styles.input} minLength={10} maxLength={12} value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} />
          </Field>
          <Field label="Email для документов">
            <input className={styles.input} type="email" value={form.documents_email} onChange={e => setForm(f => ({ ...f, documents_email: e.target.value }))} />
          </Field>
        </>
      )}
      {msg && <p className={styles.panelMuted}>{msg}</p>}
      {err && <p className={styles.formError}>{err}</p>}
      <button type="submit" className={styles.submitBtn} disabled={saving}>
        {saving ? 'Сохранение…' : 'Сохранить'}
      </button>
    </form>
  )
}

function AddressPanel() {
  return (
    <div className={styles.profileFields}>
      <p className={styles.panelMuted}>
        Сохранённые адреса доставки в API demo-release пока не предусмотрены.
        Адрес указывается при оформлении заказа на странице checkout или в B2B-заявке.
      </p>
      <Link to="/checkout" className={styles.submitBtn} style={{ display: 'inline-flex', textDecoration: 'none', marginTop: 12 }}>
        Перейти к оформлению
      </Link>
    </div>
  )
}

function ManagerPanel({ manager: initialManager }) {
  const [manager, setManager] = useState(initialManager)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCustomerManager()
      .then(setManager)
      .catch(e => {
        if (!initialManager) setError(e.message)
      })
  }, [initialManager])

  if (error && !manager) return <p className={styles.formError}>{error}</p>
  if (!manager) return <p className={styles.panelMuted}>Загрузка…</p>
  return (
    <div className={styles.profileFields}>
      <p><strong>{manager.name}</strong></p>
      <p><a href={`tel:${String(manager.phone || '').replace(/\D/g, '')}`}>{manager.phone}</a></p>
      <p><a href={`mailto:${manager.email}`}>{manager.email}</a></p>
      {manager.messenger_url && (
        <p><a href={manager.messenger_url} target="_blank" rel="noreferrer">Мессенджер</a></p>
      )}
    </div>
  )
}
