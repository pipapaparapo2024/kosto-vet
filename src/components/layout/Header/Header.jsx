import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, User, Menu, X } from 'lucide-react'
import AuthDrawer from '../../ui/AuthDrawer/AuthDrawer'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/delivery', label: 'Доставка' },
  { to: '/about', label: 'О компании' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/blog', label: 'Блог' },
]

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
            <span>KOSTO</span>
            <span>VET —</span>
          </Link>

          <nav className={styles.nav}>
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(v => !v)} aria-label="Поиск">
              <Search size={22} strokeWidth={1.8} />
            </button>
            <button className={styles.iconBtn} onClick={() => setAuthOpen(true)} aria-label="Личный кабинет">
              <User size={22} strokeWidth={1.8} />
            </button>
            <button className={styles.iconBtn} onClick={() => setMenuOpen(v => !v)} aria-label="Меню">
              {menuOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
            </button>
          </div>

          <div className={styles.headerBorder} />
        </div>

        {searchOpen && (
          <div className={styles.searchBar}>
            <div className={styles.searchInner}>
              <Search size={18} strokeWidth={2} className={styles.searchIcon} />
              <input
                autoFocus
                type="search"
                placeholder="Поиск по каталогу..."
                className={styles.searchInput}
              />
              <button className={styles.searchClose} onClick={() => setSearchOpen(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </header>

      {menuOpen && (
        <>
          <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
          <nav className={styles.menuPanel}>
            <div className={styles.menuHead}>
              <span className={styles.menuTitle}>Навигация</span>
              <button className={styles.iconBtn} onClick={() => setMenuOpen(false)} aria-label="Закрыть">
                <X size={22} strokeWidth={1.8} />
              </button>
            </div>
            <div className={styles.menuLinks}>
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => [styles.menuLink, isActive ? styles.menuLinkActive : ''].join(' ')}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className={styles.menuFooter}>
              <a href="tel:+79611898933" className={styles.menuContact}>+7 (961) 189-89-33</a>
              <a href="mailto:Kosto-Vet@yandex.ru" className={styles.menuContact}>Kosto-Vet@yandex.ru</a>
            </div>
          </nav>
        </>
      )}

      <AuthDrawer isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
