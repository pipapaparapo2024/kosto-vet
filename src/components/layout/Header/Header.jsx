import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, Menu, X, ShoppingCart } from 'lucide-react'
import AuthDrawer from '../../ui/AuthDrawer/AuthDrawer'
import CartDrawer from '../../ui/CartDrawer/CartDrawer'
import { useAuth } from '../../../context/AuthContext'
import { useCart } from '../../../context/CartContext'
import { getSearchSuggestions } from '../../../lib/api/catalog'
import { suggestionTypeLabel } from '../../../lib/labels'
import styles from './Header.module.css'

const NAV_LINKS = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/delivery', label: 'Доставка' },
  { to: '/about', label: 'О компании' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/blog', label: 'Блог' },
]

export default function Header() {
  const { isAuth, customer } = useAuth()
  const { count, setOpen: setCartOpen } = useCart()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!searchOpen) return
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getSearchSuggestions(query.trim())
        .then(res => setSuggestions(res.items || []))
        .catch(() => setSuggestions([]))
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, searchOpen])

  const submitSearch = (e) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setSearchOpen(false)
    navigate(`/catalog?q=${encodeURIComponent(q)}`)
  }

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
            <button type="button" className={styles.iconBtn} onClick={() => setSearchOpen(v => !v)} aria-label="Поиск">
              <Search size={22} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setCartOpen(true)}
              aria-label={`Корзина${count ? `, ${count}` : ''}`}
            >
              <ShoppingCart size={22} strokeWidth={1.8} />
              {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setAuthOpen(true)}
              aria-label={isAuth ? `Кабинет ${customer?.name || ''}` : 'Личный кабинет'}
            >
              <User size={22} strokeWidth={1.8} />
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => setMenuOpen(v => !v)} aria-label="Меню">
              {menuOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
            </button>
          </div>

          <div className={styles.headerBorder} />
        </div>

        {searchOpen && (
          <div className={styles.searchBar}>
            <form className={styles.searchInner} onSubmit={submitSearch}>
              <Search size={18} strokeWidth={2} className={styles.searchIcon} />
              <input
                autoFocus
                type="text"
                inputMode="search"
                enterKeyHint="search"
                placeholder="Поиск по каталогу..."
                className={styles.searchInput}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => { setQuery(''); setSuggestions([]) }}
                  aria-label="Очистить"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              )}
              <button type="button" className={styles.searchClose} onClick={() => { setSearchOpen(false); setQuery(''); setSuggestions([]) }} aria-label="Закрыть поиск">
                <X size={18} strokeWidth={2} />
              </button>
            </form>
            {query.trim().length >= 2 && suggestions.length === 0 && (
              <p className={styles.suggestEmpty}>Ничего не нашли. Попробуйте изменить запрос.</p>
            )}
            {suggestions.length > 0 && (
              <ul className={styles.suggestList}>
                {suggestions.map((item, i) => {
                  const label = item.label || item.title || item.name || ''
                  return (
                    <li key={`${item.type}-${label}-${i}`}>
                      <Link
                        to={normalizeSuggestionUrl(item.url)}
                        className={styles.suggestItem}
                        onClick={() => { setSearchOpen(false); setQuery('') }}
                      >
                        <span className={styles.suggestType}>{suggestionTypeLabel(item.type)}</span>
                        <span className={styles.suggestLabel}>{label}</span>
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <button type="button" className={styles.suggestAll} onClick={submitSearch}>
                    Смотреть все результаты
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </header>

      {menuOpen && (
        <>
          <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
          <nav className={styles.menuPanel}>
            <div className={styles.menuHead}>
              <span className={styles.menuTitle}>Навигация</span>
              <button type="button" className={styles.iconBtn} onClick={() => setMenuOpen(false)} aria-label="Закрыть">
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
              <button
                type="button"
                className={styles.menuLink}
                onClick={() => { setMenuOpen(false); setCartOpen(true) }}
              >
                Корзина{count ? ` (${count})` : ''}
              </button>
            </div>
            <div className={styles.menuFooter}>
              <a href="tel:+79611898933" className={styles.menuContact}>+7 (961) 189-89-33</a>
              <a href="mailto:Kosto-Vet@yandex.ru" className={styles.menuContact}>Kosto-Vet@yandex.ru</a>
            </div>
          </nav>
        </>
      )}

      <AuthDrawer isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer />
    </>
  )
}

function normalizeSuggestionUrl(url) {
  if (!url) return '/catalog'
  if (url.startsWith('http')) {
    try {
      return new URL(url).pathname.replace(/^\/kosto-vet/, '') || '/catalog'
    } catch {
      return '/catalog'
    }
  }
  return url.replace(/^\/kosto-vet/, '') || url
}
