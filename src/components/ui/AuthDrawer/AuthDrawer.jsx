import { useState, useEffect } from 'react'
import styles from './AuthDrawer.module.css'

const MOCK_USER = null // заменить на useAuth() когда будет бэкенд

export default function AuthDrawer({ isOpen, onClose }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
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

  return (
    <>
      <div className={[styles.overlay, isOpen ? styles.overlayVisible : ''].join(' ')} onClick={onClose} />
      <aside className={[styles.drawer, isOpen ? styles.open : ''].join(' ')} role="dialog" aria-label="Личный кабинет">
        <div className={styles.head}>
          <h2 className={styles.title}>Личный кабинет</h2>
          <button className={styles.close} onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {user ? <ProfileView user={user} onClose={onClose} /> : (
            <>
              <div className={styles.tabs}>
                <button className={[styles.tab, tab === 'login' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('login')}>Вход</button>
                <button className={[styles.tab, tab === 'register' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('register')}>Регистрация</button>
              </div>
              {tab === 'login' ? <LoginView onSwitch={() => setTab('register')} /> : <RegisterView onSwitch={() => setTab('login')} />}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function LoginView({ onSwitch }) {
  return (
    <div className={styles.form}>
      <p className={styles.formDesc}>Войдите в кабинет, чтобы увидеть заказы, избранное и персональные условия</p>
      <Field label="Телефон или email" placeholder="Телефон или email" type="text" />
      <Field label="Пароль" placeholder="Пароль" type="password" />
      <button className={styles.btnPrimary}>Войти</button>
      <div className={styles.divider}><span>или</span></div>
      <button className={styles.btnSecondary}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
        Получить код по телефону
      </button>
      <a href="#" className={styles.link}>Забыли пароль?</a>
      <div className={styles.benefits}>
        <Benefit icon="🔒" title="Безопасность данных" desc="Мы не передаём Ваши данные третьим лицам и надёжно их защищаем" />
        <Benefit icon="⚡" title="Быстрый доступ" desc="Повторяйте заказы в один клик и экономьте время" />
        <Benefit icon="📄" title="Документы под рукой" desc="Счета, накладные и сертификаты всегда доступны в кабинете" />
      </div>
      <p className={styles.switchText}>Нет кабинета? <button className={styles.switchBtn} onClick={onSwitch}>Зарегистрироваться</button></p>
    </div>
  )
}

function RegisterView({ onSwitch }) {
  return (
    <div className={styles.form}>
      <p className={styles.formDesc}>Создайте кабинет, чтобы видеть заказы, сохранять избранное и ускорить оформление</p>
      <Field label="ФИО*" placeholder="Иванов Иван Иванович" />
      <Field label="Телефон*" placeholder="+7 (___) ___-__-__" type="tel" />
      <Field label="Email*" placeholder="ivanov@mail.ru" type="email" />
      <Field label="Город*" placeholder="Например, Воронеж" />
      <Field label="Название клиники (если вы не физ. лицо)" placeholder="Например, ВетПлюс" />
      <button className={styles.btnPrimary}>Создать кабинет</button>
      <p className={styles.legal}>Нажимая «Создать кабинет», вы соглашаетесь с <a href="/documents/agreement">пользовательским соглашением</a> и <a href="/documents/privacy">политикой конфиденциальности</a></p>
      <p className={styles.switchText}>Уже есть кабинет? <button className={styles.switchBtn} onClick={onSwitch}>Войти</button></p>
    </div>
  )
}

function ProfileView({ user, onClose }) {
  return (
    <div className={styles.profile}>
      <div className={styles.profileInfo}>
        <div className={styles.profileAvatar}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <p className={styles.profileName}>{user.clinic || user.name}</p>
          <p className={styles.profileSub}>{user.city && `Клиника, г. ${user.city}`}</p>
          {user.inn && <p className={styles.profileSub}>ИНН {user.inn}</p>}
          {user.verified && <span className={styles.badge}>✓ Подтверждён</span>}
        </div>
      </div>

      <div className={styles.quickActions}>
        <p className={styles.sectionLabel}>Быстрые действия</p>
        <div className={styles.quickGrid}>
          <QuickAction icon="🔄" label="Повторить заказ" />
          <QuickAction icon="📦" label="Проверить наличие" />
          <QuickAction icon="📄" label="Скачать документы" />
          <QuickAction icon="👤" label="Связаться с менеджером" />
        </div>
      </div>

      <div className={styles.menu}>
        <MenuItem label="Мои заказы" count={user.ordersCount} />
        <MenuItem label="Избранное" count={user.favCount} />
        <MenuItem label="Реквизиты" />
        <MenuItem label="Адрес доставки" count={user.addressCount} />
        <MenuItem label="Документы" />
        <MenuItem label="Контактный менеджер" />
      </div>

      <button className={styles.logout}>Выйти из кабинета</button>

      {user.manager && (
        <div className={styles.manager}>
          <div className={styles.managerPhoto}>Фото</div>
          <div>
            <p className={styles.managerLabel}>Ваш персональный менеджер</p>
            <p className={styles.managerName}>{user.manager.name}</p>
            <a href={`tel:${user.manager.phone}`} className={styles.managerPhone}>{user.manager.phone}</a>
          </div>
          <a href={`tel:${user.manager.phone}`} className={styles.callBtn}>Позвонить</a>
        </div>
      )}
    </div>
  )
}

function Field({ label, placeholder, type = 'text' }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <input type={type} placeholder={placeholder} className={styles.input} />
    </div>
  )
}

function Benefit({ icon, title, desc }) {
  return (
    <div className={styles.benefit}>
      <span>{icon}</span>
      <div>
        <p className={styles.benefitTitle}>{title}</p>
        <p className={styles.benefitDesc}>{desc}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon, label }) {
  return (
    <button className={styles.quickAction}>
      <span className={styles.quickIcon}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function MenuItem({ label, count }) {
  return (
    <div className={styles.menuItem}>
      <span>{label}</span>
      <div className={styles.menuRight}>
        {count !== undefined && <span className={styles.count}>{count}</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  )
}
