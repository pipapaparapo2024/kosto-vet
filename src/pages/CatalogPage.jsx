import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock, Box, ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { CATEGORIES, getProductsByCategory, minPrice } from '../data/catalog'
import { img } from '../utils/assetUrl'
import styles from './CatalogPage.module.css'

const SUBCATS = [
  { name: 'Парные',              count: 32,  slug: 'parnye' },
  { name: 'Т-образные',          count: 28,  slug: 'tobraznye' },
  { name: 'L-образные',          count: 19,  slug: 'lobraznye' },
  { name: 'Реконструктивные',    count: 22,  slug: 'rekonstruktivnye' },
  { name: 'Для бедренной кости', count: 14,  slug: 'bedro' },
  { name: 'Для таза',            count: 12,  slug: 'taz' },
  { name: 'Все пластины',        count: 127, slug: null },
]

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Самое популярное' },
  { value: 'price_asc',  label: 'Цена по возрастанию' },
  { value: 'price_desc', label: 'Цена по убыванию' },
  { value: 'name',       label: 'По названию' },
]

const FILTER_GROUPS = [
  { title: 'Форма пластины',   items: ['Прямая', 'Т-образная', 'L-образная', 'Реконструктивная'] },
  { title: 'Длина мм',         items: ['50–65', '66–80', '81–100', '101–120', '121+'] },
  { title: 'Ширина мм',        items: ['4–6', '7–9', '10–12', '13+'] },
  { title: 'Кол-во отверстий', items: ['4', '6', '8', '10', '12', '14+'] },
  { title: 'Цена (₽)',         items: ['до 500', '500–1000', '1000–3000', '3000+'] },
]

const PER_PAGE = 12

export default function CatalogPage() {
  const { category } = useParams()
  const currentCat = CATEGORIES.find(c => c.slug === category) || null

  const [search,      setSearch]      = useState('')
  const [sort,        setSort]        = useState('popular')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [openGroups,  setOpenGroups]  = useState({})
  const [page,        setPage]        = useState(1)

  const allProducts = useMemo(() => getProductsByCategory(category || null), [category])

  const products = useMemo(() => {
    let list = allProducts
    if (search)      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (onlyInStock) list = list.filter(p => p.inStock)
    if (sort === 'price_asc')  list = [...list].sort((a, b) => (minPrice(a) || 0) - (minPrice(b) || 0))
    if (sort === 'price_desc') list = [...list].sort((a, b) => (minPrice(b) || 0) - (minPrice(a) || 0))
    if (sort === 'name')       list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    return list
  }, [allProducts, search, onlyInStock, sort])

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE))
  const paginated  = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleGroup = key => setOpenGroups(g => ({ ...g, [key]: !g[key] }))

  const activeChips = onlyInStock ? [{ label: 'В наличии', key: 'stock' }] : []
  const clearAll    = () => setOnlyInStock(false)

  return (
    <div className={styles.page}>

      {/* ── Hero (главная каталога) ─────────────── */}
      {!currentCat && (
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Главная</Link><span>›</span>
              <span>Каталог</span>
            </nav>
            <h1 className={styles.heroTitle}>Пластины для остеосинтеза</h1>
            <p className={styles.heroDesc}>Медицинская сталь 316L и титановый сплав. Широкий ассортимент форм и размеров.</p>
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>
                <Clock size={40} strokeWidth={1.5} className={styles.benefitIcon} />
                <div>
                  <p className={styles.benefitTitle}>2–4 часа</p>
                  <p className={styles.benefitDesc}>Доставка по Воронежу в день заказа</p>
                </div>
              </div>
              <div className={styles.benefitItem}>
                <Box size={40} strokeWidth={1.5} className={styles.benefitIcon} />
                <div>
                  <p className={styles.benefitTitle}>Остаток в реальном времени</p>
                  <p className={styles.benefitDesc}>Вы видите, что товар точно есть, до оформления заказа.</p>
                </div>
              </div>
            </div>
          </div>
          <img src={img('images/пластина-каталог.png')} alt="" className={styles.heroImg} aria-hidden="true" />
        </div>
      )}

      {/* ── Hero (страница категории) ──────────── */}
      {currentCat && (
        <div className={styles.catHero}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <Link to="/catalog">Каталог</Link><span>›</span>
            <span>{currentCat.name}</span>
          </nav>
          <h1 className={styles.heroTitle}>{currentCat.name}</h1>
        </div>
      )}

      <div className={styles.container}>

        {/* ── Подкатегории ──────────────────────── */}
        {!currentCat && (
          <div className={styles.subcats}>
            {SUBCATS.map((s, i) => (
              <Link
                key={i}
                to={s.slug ? `/catalog/${s.slug}` : '/catalog'}
                className={`${styles.subcat} ${(!category && !s.slug) || category === s.slug ? styles.subcatActive : ''}`}
              >
                <div className={styles.subcatPhoto} />
                <p className={styles.subcatName}>{s.name}</p>
                <p className={styles.subcatCount}>{s.count}</p>
              </Link>
            ))}
          </div>
        )}

        {/* ── layout: фильтр + товары ───────────── */}
        <div className={styles.layout}>

          {/* Фильтр — всегда виден */}
          <aside className={styles.filters}>
            {/* Чёрный хедер */}
            <div className={styles.filterHead}>
              <span className={styles.filterTitle}>Фильтр</span>
              <button className={styles.filterClear} onClick={clearAll}>Сбросить всё</button>
            </div>

            {/* Белое тело — накладывается поверх хедера */}
            <div className={styles.filterBody}>
              {/* Наличие */}
              <div className={styles.filterGroup}>
                <button className={styles.filterGroupBtn} onClick={() => toggleGroup('nalichie')}>
                  Наличие
                  <ChevronDown size={14} strokeWidth={2} style={{ transform: openGroups['nalichie'] ? 'rotate(180deg)' : 'none', transition: '150ms', flexShrink: 0 }} />
                </button>
                {openGroups['nalichie'] !== false && (
                  <div className={styles.filterGroupBody}>
                    <label className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={e => setOnlyInStock(e.target.checked)}
                        className={styles.filterCheckbox}
                      />
                      <span className={styles.filterOptionLabel}>В наличии</span>
                      <span className={styles.filterCount}>127</span>
                    </label>
                    <label className={styles.filterOption}>
                      <input type="checkbox" className={styles.filterCheckbox} readOnly />
                      <span className={styles.filterOptionLabel}>Под заказ</span>
                      <span className={styles.filterCount}>14</span>
                    </label>
                  </div>
                )}
              </div>

              {FILTER_GROUPS.map(group => (
                <div key={group.title} className={styles.filterGroup}>
                  <button
                    className={styles.filterGroupBtn}
                    onClick={() => toggleGroup(group.title)}
                  >
                    {group.title}
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{ transform: openGroups[group.title] ? 'rotate(180deg)' : 'none', transition: '150ms', flexShrink: 0 }}
                    />
                  </button>
                  {openGroups[group.title] && (
                    <div className={styles.filterGroupBody}>
                      {group.items.map(item => (
                        <label key={item} className={styles.filterOption}>
                          <input type="checkbox" className={styles.filterCheckbox} readOnly />
                          <span className={styles.filterOptionLabel}>{item}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* Область товаров */}
          <div className={styles.productsArea}>

            {/* Тулбар */}
            <div className={styles.toolbar}>
              <span className={styles.count}>{products.length} товаров</span>
              <div className={styles.toolbarRight}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Поиск по каталогу"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button className={styles.filterBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="4" y1="6" x2="20" y2="6"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="11" y1="18" x2="13" y2="18"/>
                  </svg>
                  Фильтр
                  {activeChips.length > 0 && (
                    <span className={styles.filterBadge}>{activeChips.length}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Активные чипы */}
            {activeChips.length > 0 && (
              <div className={styles.chips}>
                {activeChips.map(chip => (
                  <button key={chip.key} className={styles.chip} onClick={clearAll}>
                    {chip.label}
                    <span className={styles.chipX}>✕</span>
                  </button>
                ))}
                <button className={styles.chipsReset} onClick={clearAll}>Сбросить всё</button>
              </div>
            )}

            {/* Сетка товаров */}
            {products.length === 0 ? (
              <div className={styles.empty}>Товары не найдены. Попробуйте изменить запрос или фильтры.</div>
            ) : (
              <div className={styles.grid}>
                {paginated.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

          </div>
        </div>

        {/* ── CTA — вне layout, полная ширина ───── */}
        <div className={styles.cta}>
          <div className={styles.ctaLeft}>
            <h3 className={styles.ctaTitle}>Нужна пластина сегодня?</h3>
            <p className={styles.ctaDesc}>Отправьте параметры или фото рентгенограммы. Наш специалист поможет подобрать корректный вариант.</p>
            <a href="tel:+79611898933" className={styles.ctaBtn}>
              Написать специалисту <ArrowRight size={20} strokeWidth={1.8} />
            </a>
          </div>
          <img src={img('images/котик-каталог.png')} alt="" className={styles.ctaImg} aria-hidden="true" />
        </div>

        {/* ── Пагинация ──────────────────────────── */}
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const price      = minPrice(product)
  const sku        = product.variants?.[0]?.sku || null
  const stockCount = product.variants?.length || 0

  return (
    <Link to={`/catalog/${product.category}/${product.slug}`} className={styles.card}>
      <div className={styles.cardImg}>
        <img
          src={img(product.image)}
          alt={product.name}
          loading="lazy"
          onError={e => { e.currentTarget.style.opacity = '0.3' }}
        />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{product.name}</p>
        {sku && <p className={styles.cardSku}>{sku}</p>}
        <div className={styles.cardFooter}>
          {price
            ? <span className={styles.cardPrice}>{price.toLocaleString('ru')} ₽</span>
            : <span className={styles.cardPriceEmpty}>Цена по запросу</span>
          }
          {product.inStock
            ? <span className={styles.inStock}><span className={styles.dot} />В наличии{stockCount > 1 ? ` ${stockCount} шт.` : ''}</span>
            : <span className={styles.outOfStock}><span className={styles.dotGrey} />Нет в наличии</span>
          }
        </div>
        <div className={styles.cardBtn}>Подробнее →</div>
      </div>
    </Link>
  )
}
