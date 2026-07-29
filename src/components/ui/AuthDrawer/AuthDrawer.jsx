import { useState, useEffect } from 'react'
import { X, Phone, Shield, Zap, FileText, ShoppingBag, Package, FileDown, UserPlus, ShoppingCart, Heart, CreditCard, MapPin, FolderOpen, User, LogOut, ChevronRight } from 'lucide-react'
import styles from './AuthDrawer.module.css'

const FEATURES = [
  { Icon: Shield,   title: 'Безопасность данных', desc: 'Мы не передаём Ваши данные третьим лицам и надёжно их защищаем' },
  { Icon: Zap,      title: 'Быстрый доступ',      desc: 'Повторяйте заказы в один клик и экономьте время' },
  { Icon: FileText, title: 'Документы под рукой', desc: 'Счета, накладные и сертификаты всегда доступны в кабинете' },
]

const QUICK_ACTIONS = [
  { Icon: ShoppingBag, label: 'Повторить заказ' },
  { Icon: Package,     label: 'Проверить наличие' },
  { Icon: FileDown,    label: 'Скачать документы' },
  { Icon: UserPlus,    label: 'Связаться с менеджером' },
]

const MENU_ITEMS = [
  { Icon: ShoppingCart, label: 'Мои заказы',          count: 6 },
  { Icon: Heart,        label: 'Избранное',            count: 12 },
  { Icon: CreditCard,   label: 'Реквизиты',            count: null },
  { Icon: MapPin,       label: 'Адрес доставки',       count: 3 },
  { Icon: FolderOpen,   label: 'Документы',            count: null },
  { Icon: User,         label: 'Контактный менеджер',  count: null },
]

const MOCK_USER = {
  clinic: 'ВетПлюс',
  city: 'Воронеж',
  inn: '3661234567',
  verified: true,
}

export default function AuthDrawer({ isOpen, onClose }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', clinicName: '' })
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
  const [user] = useState(MOCK_USER)

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

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-label="Личный кабинет">
        {user ? (
          <ProfileView user={user} onClose={onClose} />
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
              <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => setTab('login')}>Вход</button>
              <button className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>Регистрация</button>
            </div>

            <div className={styles.body}>
              {tab === 'login' ? (
                <>
                  <form className={styles.form} onSubmit={e => e.preventDefault()}>
                    <Field label="Телефон или email" required>
                      <input className={styles.input} type="text" placeholder="Телефон или email" value={loginForm.phone} onChange={e => setLoginForm(f => ({...f, phone: e.target.value}))} />
                    </Field>
                    <Field label="Пароль" required>
                      <input className={styles.input} type="password" placeholder="Введите пароль" value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))} />
                    </Field>
                    <button type="submit" className={styles.submitBtn}>Войти</button>
                    <button type="button" className={styles.forgotBtn}>Забыли пароль?</button>
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
                    <button className={styles.switchLink} onClick={() => setTab('register')}>Зарегистрироваться</button>
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.formHint}>Заполните основные данные</p>
                  <form className={styles.form} onSubmit={e => e.preventDefault()}>
                    <Field label="ФИО" required>
                      <input className={styles.input} type="text" placeholder="Иванов Иван Иванович" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                    </Field>
                    <Field label="Телефон" required>
                      <div className={styles.phoneWrap}>
                        <Phone size={16} strokeWidth={1.5} className={styles.phoneIcon} />
                        <input className={`${styles.input} ${styles.inputPhone}`} type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                      </div>
                    </Field>
                    <Field label="Email" required>
                      <input className={styles.input} type="email" placeholder="ivanov@mail.ru" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                    </Field>
                    <Field label="Город" required>
                      <input className={styles.input} type="text" placeholder="Например, Воронеж" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} />
                    </Field>
                    <Field label="Название клиники (если вы не физ. лицо)">
                      <input className={styles.input} type="text" placeholder="Например, ВетПлюс" value={form.clinicName} onChange={e => setForm(f => ({...f, clinicName: e.target.value}))} />
                    </Field>
                    <button type="submit" className={styles.submitBtn}>Создать кабинет</button>
                    <p className={styles.termsText}>
                      Нажимая «Создать кабинет», вы соглашаетесь с{' '}
                      <a href="#" className={styles.termsLink}>пользовательским соглашением</a> и{' '}
                      <a href="#" className={styles.termsLink}>политикой конфиденциальности</a>
                    </p>
                  </form>

                  <p className={styles.switchNote}>
                    Уже есть кабинет?{' '}
                    <button className={styles.switchLink} onClick={() => setTab('login')}>Войти</button>
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

function ProfileView({ user, onClose }) {
  return (
    <div className={styles.profileWrap}>
      {/* Header */}
      <div className={styles.profileHead}>
        <h2 className={styles.title}>Личный кабинет</h2>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть"><X size={18} strokeWidth={2} /></button>
      </div>

      {/* Profile info */}
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <User size={28} strokeWidth={1.5} />
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileNameRow}>
            <span className={styles.profileName}>{user.clinic}</span>
            {user.verified && <span className={styles.badge}>✓ Подтвержден</span>}
          </div>
          <p className={styles.profileCity}>Клиника, г. {user.city}</p>
          <p className={styles.profileInn}>ИНН {user.inn}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickBlock}>
        <p className={styles.quickTitle}>Быстрые действия</p>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map(({ Icon, label }) => (
            <button key={label} className={styles.quickItem}>
              <Icon size={22} strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className={styles.menuBlock}>
        {MENU_ITEMS.map(({ Icon, label, count }) => (
          <button key={label} className={styles.menuItem}>
            <Icon size={18} strokeWidth={1.5} className={styles.menuIcon} />
            <span className={styles.menuLabel}>{label}</span>
            {count !== null && <span className={styles.menuCount}>{count}</span>}
            <ChevronRight size={16} strokeWidth={2} className={styles.menuChevron} />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className={styles.logoutBlock}>
        <button className={styles.logoutBtn}>
          <LogOut size={18} strokeWidth={1.5} />
          Выйти из кабинета
        </button>
      </div>

      {/* Manager card */}
      <div className={styles.managerCard}>
        <div className={styles.managerPhoto}>Сток фото</div>
        <div className={styles.managerInfo}>
          <p className={styles.managerTitle}>Ваш персональный менеджер</p>
          <p className={styles.managerName}>Мария Смирнова</p>
          <p className={styles.managerPhone}>+7 (961) 189-89-33</p>
          <button className={styles.managerBtn}>Позвонить</button>
        </div>
      </div>
    </div>
  )
}
