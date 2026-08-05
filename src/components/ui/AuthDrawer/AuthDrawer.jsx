import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Phone, Lock, Clock, FileText, ShoppingBag, Package, FileDown, UserPlus,
  ShoppingCart, Heart, CreditCard, MapPin, FolderOpen, User, LogOut, ArrowRight,
  Eye, EyeOff, Check,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { listCustomerOrders, listFavorites, removeFavorite, getCustomerOrder } from '../../../lib/api/account'
import { getCustomerManager, startYandexLogin } from '../../../lib/api/auth'
import { formatMoney } from '../../../lib/money'
import { orderStatusLabel, paymentStatusLabel } from '../../../lib/labels'
import { AuthListSkeleton, AuthProfileSkeleton } from '../Skeleton/Skeleton'
import styles from './AuthDrawer.module.css'

const FEATURES = [
  { Icon: Lock, title: 'Безопасность данных', desc: 'Мы не передаём Ваши данные третьим лицам и надёжно их защищаем' },
  { Icon: Clock, title: 'Быстрый доступ', desc: 'Повторяйте заказы в один клик и экономьте время' },
  { Icon: FileText, title: 'Документы под рукой', desc: 'Счета, накладные и сертификаты всегда доступны в кабинете' },
]

const QUICK_ACTIONS = [
  { Icon: ShoppingBag, label: 'Повторить заказ', key: 'orders' },
  { Icon: Package, label: 'Проверить наличие', to: '/catalog' },
  { Icon: FileDown, label: 'Скачать документы', to: '/documents' },
  { Icon: UserPlus, label: 'Связаться с менеджером', key: 'manager' },
]

export default function AuthDrawer({ isOpen, onClose }) {
  const { customer, isAuth, loading, error, setError, login, register, logout } = useAuth()
  const [tab, setTab] = useState('login')
  const [panel, setPanel] = useState('home')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ login: '', password: '' })
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    companyName: '',
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
      setShowPassword(false)
    } else {
      // Обработать oauth_error из URL (после редиректа от Яндекса)
      const params = new URLSearchParams(window.location.search)
      const oauthError = params.get('oauth_error')
      if (oauthError) {
        setFormError(
          oauthError === 'provider_denied'
            ? 'Вы отменили вход через Яндекс. Попробуйте ещё раз.'
            : 'Не удалось войти через Яндекс. Попробуйте другой способ.'
        )
        params.delete('oauth_error')
        const newSearch = params.toString()
        window.history.replaceState(null, '', window.location.pathname + (newSearch ? `?${newSearch}` : ''))
      }
    }
  }, [isOpen, setError])

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setFormError(null)
    const value = loginForm.login.trim()
    if (!value.includes('@')) {
      setFormError('Сейчас вход доступен по email. Укажите адрес электронной почты.')
      return
    }
    setSubmitting(true)
    const result = await login({ email: value, password: loginForm.password })
    setSubmitting(false)
    if (!result.ok) setFormError(result.error || 'Неверный email или пароль')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (regForm.password.length < 12) {
      setFormError('Пароль не короче 12 символов')
      return
    }
    setSubmitting(true)
    const hasClinic = Boolean(regForm.companyName.trim())
    const result = await register({
      name: regForm.name.trim(),
      email: regForm.email.trim(),
      password: regForm.password,
      phone: regForm.phone.trim() || null,
      customerType: hasClinic ? 'legal_entity' : 'individual',
      companyName: hasClinic ? regForm.companyName.trim() : undefined,
      website: regForm.website,
    })
    setSubmitting(false)
    if (!result.ok) {
      setFormError(result.error || 'Не удалось зарегистрироваться')
      return
    }
    if (regForm.city.trim()) {
      try {
        localStorage.setItem('kv_customer_city', regForm.city.trim())
      } catch { /* ignore */ }
    }
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
                    : 'Создайте кабинет, чтобы видеть заказы сохранять избранное и ускорить оформление'}
                </p>
              </div>
              <button className={styles.close} onClick={onClose} aria-label="Закрыть">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
                onClick={() => { setTab('login'); setFormError(null) }}
              >
                Вход
              </button>
              <button
                type="button"
                className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
                onClick={() => { setTab('register'); setFormError(null) }}
              >
                Регистрация
              </button>
            </div>

            <div className={styles.body}>
              {(formError || error) && <p className={styles.formError}>{formError || error}</p>}

              {tab === 'login' ? (
                <>
                  <form className={styles.form} onSubmit={handleLogin}>
                    <input
                      className={styles.input}
                      type="text"
                      autoComplete="username"
                      placeholder="Телефон или email"
                      required
                      value={loginForm.login}
                      onChange={e => setLoginForm(f => ({ ...f, login: e.target.value }))}
                    />
                    <div className={styles.passwordWrap}>
                      <input
                        className={`${styles.input} ${styles.inputPassword}`}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Пароль"
                        required
                        minLength={12}
                        value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      >
                        {showPassword
                          ? <Eye size={18} strokeWidth={1.6} />
                          : <EyeOff size={18} strokeWidth={1.6} />}
                      </button>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={submitting || loading}>
                      {submitting ? 'Входим…' : 'Войти'}
                    </button>
                  </form>

                  <div className={styles.orRow}>
                    <span className={styles.orLine} />
                    <span className={styles.orText}>или</span>
                    <span className={styles.orLine} />
                  </div>

                  <button
                    type="button"
                    className={styles.yandexBtn}
                    onClick={() => startYandexLogin(window.location.pathname)}
                  >
                    <YandexIcon />
                    Войти через Яндекс ID
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setFormError('Вход по коду скоро будет доступен. Используйте email и пароль.')}
                  >
                    <Phone size={18} strokeWidth={1.6} aria-hidden="true" />
                    Получить код по телефону
                  </button>

                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={() => setFormError('Сброс пароля временно недоступен')}
                  >
                    Забыли пароль?
                  </button>

                  <div className={styles.features}>
                    {FEATURES.map(({ Icon, title, desc }) => (
                      <div key={title} className={styles.feature}>
                        <div className={styles.featureIcon}><Icon size={24} strokeWidth={1.5} /></div>
                        <div>
                          <p className={styles.featureTitle}>{title}</p>
                          <p className={styles.featureDesc}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className={styles.switchNote}>
                    Нет кабинета?{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setTab('register')}>
                      Зарегистрироваться
                    </button>
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
                      <input
                        className={`${styles.input} ${styles.inputSoft}`}
                        type="text"
                        required
                        minLength={2}
                        placeholder="Иванов Иван Иванович"
                        value={regForm.name}
                        onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </Field>
                    <Field label="Телефон" required>
                      <div className={styles.phoneWrap}>
                        <Phone size={16} strokeWidth={1.5} className={styles.phoneIcon} />
                        <input
                          className={`${styles.input} ${styles.inputSoft} ${styles.inputPhone}`}
                          type="tel"
                          required
                          placeholder="+7 (___) ___-__-__"
                          value={regForm.phone}
                          onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </Field>
                    <Field label="Email" required>
                      <input
                        className={`${styles.input} ${styles.inputSoft}`}
                        type="email"
                        required
                        placeholder="ivanov@mail.ru"
                        value={regForm.email}
                        onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </Field>
                    <Field label="Пароль" required>
                      <div className={styles.passwordWrap}>
                        <input
                          className={`${styles.input} ${styles.inputSoft} ${styles.inputPassword}`}
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={12}
                          autoComplete="new-password"
                          placeholder="Не менее 12 символов"
                          value={regForm.password}
                          onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                          {showPassword
                            ? <Eye size={18} strokeWidth={1.6} />
                            : <EyeOff size={18} strokeWidth={1.6} />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Город" required>
                      <input
                        className={`${styles.input} ${styles.inputSoft}`}
                        type="text"
                        required
                        placeholder="Например, Воронеж"
                        value={regForm.city}
                        onChange={e => setRegForm(f => ({ ...f, city: e.target.value }))}
                      />
                    </Field>
                    <Field label="Название клиники (если вы не физ. лицо)">
                      <input
                        className={`${styles.input} ${styles.inputSoft}`}
                        type="text"
                        placeholder="Например, ВетПлюс"
                        value={regForm.companyName}
                        onChange={e => setRegForm(f => ({ ...f, companyName: e.target.value }))}
                      />
                    </Field>

                    <button type="submit" className={styles.submitBtn} disabled={submitting || loading}>
                      {submitting ? 'Создаём…' : 'Создать кабинет'}
                    </button>
                  </form>

                  <p className={styles.termsText}>
                    Нажимая «Создать кабинет», вы соглашаетесь с{' '}
                    <Link to="/documents/polzovatelskoe-soglashenie" className={styles.termsLink} onClick={onClose}>
                      пользовательским соглашением
                    </Link>
                    {' '}и{' '}
                    <Link to="/documents/politika-konfidencialnosti" className={styles.termsLink} onClick={onClose}>
                      политикой конфиденциальности
                    </Link>
                  </p>

                  <p className={styles.switchNote}>
                    Уже есть кабинет?{' '}
                    <button type="button" className={styles.switchLink} onClick={() => setTab('login')}>
                      Войти
                    </button>
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
      <label className={styles.fieldLabel}>
        {label}{required && <span className={styles.req}>*</span>}
      </label>
      {children}
    </div>
  )
}

function ProfileView({ customer, onClose, onLogout, onOpenPanel }) {
  const [counts, setCounts] = useState({ orders: null, favorites: null })
  const displayName = customer.company_name || customer.name
  const verified = customer.is_email_verified
  const manager = customer.manager
  const isClinic = customer.customer_type === 'legal_entity'
  let city = ''
  try { city = localStorage.getItem('kv_customer_city') || '' } catch { /* ignore */ }
  const metaLine = [
    isClinic ? 'Клиника' : 'Физлицо',
    city ? `г. ${city}` : null,
  ].filter(Boolean).join(', ')

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      listCustomerOrders({ page: 1, limit: 1 }),
      listFavorites(),
    ]).then(([ordersRes, favRes]) => {
      if (cancelled) return
      setCounts({
        orders: ordersRes.status === 'fulfilled'
          ? (ordersRes.value.total ?? ordersRes.value.items?.length ?? 0)
          : null,
        favorites: favRes.status === 'fulfilled'
          ? (favRes.value.total ?? favRes.value.items?.length ?? 0)
          : null,
      })
    })
    return () => { cancelled = true }
  }, [])

  const menuItems = [
    { Icon: ShoppingCart, label: 'Мои заказы', key: 'orders', count: counts.orders },
    { Icon: Heart, label: 'Избранное', key: 'favorites', count: counts.favorites },
    { Icon: CreditCard, label: 'Реквизиты', key: 'profile' },
    { Icon: MapPin, label: 'Адрес доставки', key: 'address', count: null },
    { Icon: FolderOpen, label: 'Документы', to: '/documents' },
    { Icon: User, label: 'Контактный менеджер', key: 'manager' },
  ]

  return (
    <div className={styles.profileWrap}>
      <div className={styles.profileHead}>
        <h2 className={styles.title}>Личный кабинет</h2>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <User size={28} strokeWidth={1.5} />
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileNameRow}>
            <span className={styles.profileName}>{displayName}</span>
            {verified && (
              <span className={styles.badge}>
                <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                Подтвержден
              </span>
            )}
          </div>
          <p className={styles.profileCity}>{metaLine}</p>
          {customer.inn && <p className={styles.profileInn}>ИНН {customer.inn}</p>}
        </div>
      </div>

      <div className={styles.quickBlock}>
        <p className={styles.quickTitle}>Быстрые действия</p>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map(({ Icon, label, key, to }) => {
            if (to) {
              return (
                <Link key={label} to={to} className={styles.quickItem} onClick={onClose}>
                  <Icon size={22} strokeWidth={1.5} />
                  <span>{label}</span>
                </Link>
              )
            }
            return (
              <button key={label} type="button" className={styles.quickItem} onClick={() => onOpenPanel(key)}>
                <Icon size={22} strokeWidth={1.5} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.menuBlock}>
        {menuItems.map(({ Icon, label, key, to, count }) => {
          const inner = (
            <>
              <Icon size={18} strokeWidth={1.5} className={styles.menuIcon} />
              <span className={styles.menuLabel}>{label}</span>
              {count != null && count > 0 && (
                <span className={styles.menuCount}>{count}</span>
              )}
              <ArrowRight size={16} strokeWidth={2} className={styles.menuChevron} />
            </>
          )
          if (to) {
            return <Link key={label} to={to} className={styles.menuItem} onClick={onClose}>{inner}</Link>
          }
          return (
            <button key={label} type="button" className={styles.menuItem} onClick={() => onOpenPanel(key)}>
              {inner}
            </button>
          )
        })}
        <div className={styles.menuDivider} />
        <button type="button" className={styles.menuItem} onClick={onLogout}>
          <LogOut size={18} strokeWidth={1.5} className={styles.menuIcon} />
          <span className={styles.menuLabel}>Выйти из кабинета</span>
          <ArrowRight size={16} strokeWidth={2} className={styles.menuChevron} />
        </button>
      </div>

      <div className={styles.managerCard}>
        <div className={styles.managerTop}>
          <div className={styles.managerPhoto}>
            {manager?.name ? manager.name.slice(0, 1) : 'Сток фото'}
          </div>
          <div className={styles.managerInfo}>
            <p className={styles.managerTitle}>Ваш персональный менеджер</p>
            <p className={styles.managerName}>{manager?.name || 'Менеджер KOSTO-VET'}</p>
            <p className={styles.managerPhone}>{manager?.phone || '+7 (800) 000-00-00'}</p>
          </div>
        </div>
        <a
          href={`tel:${String(manager?.phone || '').replace(/\D/g, '') || '78000000000'}`}
          className={styles.managerBtn}
        >
          Позвонить
        </a>
      </div>
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
          <ArrowRight size={20} strokeWidth={2} className={styles.backBtnArrow} />
        </button>
        <h2 className={styles.title}>{titles[panel] || 'Кабинет'}</h2>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          <X size={20} strokeWidth={2} />
        </button>
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
  if (!data) return <AuthListSkeleton rows={4} />
  if (!data.items?.length) return <p className={styles.panelMuted}>Заказов пока нет</p>

  if (detail) {
    return (
      <div className={styles.profileFields}>
        <button type="button" className={styles.linkBtn} onClick={() => setDetail(null)}>
          <ArrowRight size={14} strokeWidth={2} className={styles.linkBtnArrowBack} aria-hidden="true" />
          К списку
        </button>
        <p><strong>Заказ {detail.public_id}</strong></p>
        <p>Статус: {orderStatusLabel(detail.status)}</p>
        <p>Оплата: {paymentStatusLabel(detail.payment_status)}</p>
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
          <button
            type="button"
            className={styles.listTitle}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            onClick={() => openDetail(order.public_id)}
          >
            Заказ {order.public_id}
            <span className={styles.panelMuted} style={{ display: 'block', fontWeight: 400 }}>
              {orderStatusLabel(order.status)} · {paymentStatusLabel(order.payment_status)}
            </span>
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
  if (!data) return <AuthListSkeleton rows={4} />
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
        Сохранённые адреса пока недоступны.
        Адрес указывается при оформлении заказа или в заявке для клиник.
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
  if (!manager) return <AuthProfileSkeleton />
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

function YandexIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="22" height="22" rx="5" fill="#000"/>
      <path d="M12.53 16.5H14V5.5H11.617C9.24 5.5 7.9 6.77 7.9 8.8c0 1.76.88 2.77 2.53 3.86L7.5 16.5h1.77l3.07-3.67-.79-.52c-1.34-.89-1.94-1.65-1.94-3.04 0-1.21.82-2 2.2-2h.72V16.5z" fill="#fff"/>
    </svg>
  )
}
