import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, User, Menu, X } from 'lucide-react'
import AuthDrawer from '../../ui/AuthDrawer/AuthDrawer'
import styles from './Header.module.css'

export default function Header() {
  const [authOpen, setAuthOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span>KOSTO</span>
            <span>VET —</span>
          </Link>

          <nav className={styles.nav}>
            <NavLink to="/catalog" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>Каталог</NavLink>
            <NavLink to="/delivery" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>Доставка</NavLink>
            <NavLink to="/about" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>О компании</NavLink>
            <NavLink to="/contacts" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>Контакты</NavLink>
            <NavLink to="/blog" className={({ isActive }) => [styles.navLink, isActive ? styles.active : ''].join(' ')}>Блог</NavLink>
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(v => !v)} aria-label="Поиск">
              <Search size={20} strokeWidth={2} />
            </button>
            <button className={styles.iconBtn} onClick={() => setAuthOpen(true)} aria-label="Личный кабинет">
              <User size={20} strokeWidth={2} />
            </button>
            <button className={styles.iconBtn} aria-label="Меню">
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>
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

      <AuthDrawer isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
