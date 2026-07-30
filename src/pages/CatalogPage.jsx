import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Clock, Box, ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { listCategories, listProducts, getCategory } from '../lib/api/catalog'
import { formatMoney, isInStock, stockLabel, productImageUrl } from '../lib/money'
import { img } from '../utils/assetUrl'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './CatalogPage.module.css'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Самое популярное' },
  { value: 'price_asc', label: 'Цена по возрастанию' },
  { value: 'price_desc', label: 'Цена по убыванию' },
  { value: 'name_asc', label: 'По названию' },
  { value: 'stock_desc', label: 'По наличию' },
]

const PER_PAGE = 24

export default function CatalogPage() {
  const { category } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [categoryDetail, setCategoryDetail] = useState(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular')
  const [onlyInStock, setOnlyInStock] = useState(searchParams.get('in_stock') === 'true')
  const [stockState, setStockState] = useState(searchParams.get('stock_state') || '')
  const [openGroups, setOpenGroups] = useState({ nalichie: true })
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (q && q !== search) setSearch(q)
  }, [searchParams])

  const currentCat = categoryDetail || categories.find(c => c.slug === category) || null

  useDocumentTitle(
    currentCat?.seo?.title || currentCat?.title || currentCat?.name || (category ? category : 'Каталог'),
    currentCat?.seo?.description || currentCat?.description || 'Каталог имплантов для остеосинтеза KOSTO-VET',
  )

  useEffect(() => {
    listCategories()
      .then(res => setCategories(res.items || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!category) {
      setCategoryDetail(null)
      return
    }
    getCategory(category)
      .then(setCategoryDetail)
      .catch(() => setCategoryDetail(null))
  }, [category])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listProducts({
        category: category || undefined,
        includeDescendants: true,
        q: search.trim() || undefined,
        inStock: onlyInStock || undefined,
        stockState: stockState || undefined,
        sort,
        page,
        limit: PER_PAGE,
      })
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (e) {
      setError(e.message || 'Не удалось загрузить каталог')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [category, search, onlyInStock, stockState, sort, page])

  useEffect(() => {
    const t = setTimeout(loadProducts, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadProducts, search])

  useEffect(() => {
    setPage(1)
  }, [category, search, onlyInStock, stockState, sort])

  useEffect(() => {
    const next = {}
    if (search) next.q = search
    if (sort !== 'popular') next.sort = sort
    if (onlyInStock) next.in_stock = 'true'
    if (stockState) next.stock_state = stockState
    if (page > 1) next.page = String(page)
    setSearchParams(next, { replace: true })
  }, [search, sort, onlyInStock, stockState, page, setSearchParams])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const toggleGroup = key => setOpenGroups(g => ({ ...g, [key]: !g[key] }))
  const activeChips = [
    ...(onlyInStock ? [{ label: 'В наличии', key: 'stock' }] : []),
    ...(stockState ? [{ label: `Статус: ${stockState}`, key: 'stock_state' }] : []),
  ]
  const clearAll = () => {
    setOnlyInStock(false)
    setStockState('')
  }

  const rootCats = categories
  const subcats = categoryDetail?.children?.length
    ? categoryDetail.children
    : (!category ? rootCats : (currentCat?.children || []))

  return (
    <div className={styles.page}>
      {!category && (
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Главная</Link><span>›</span>
              <span>Каталог</span>
            </nav>
            <h1 className={styles.heroTitle}>Каталог продукции</h1>
            <p className={styles.heroDesc}>Импланты и инструменты для остеосинтеза. Наличие и цены со склада в реальном времени.</p>
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

      {category && (
        <div className={styles.catHero}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <Link to="/catalog">Каталог</Link><span>›</span>
            {(categoryDetail?.ancestors || []).map(a => (
              <span key={a.id} style={{ display: 'contents' }}>
                <Link to={`/catalog/${a.slug}`}>{a.title}</Link><span>›</span>
              </span>
            ))}
            <span>{currentCat?.title || currentCat?.name || category}</span>
          </nav>
          <h1 className={styles.heroTitle}>{currentCat?.title || currentCat?.name || category}</h1>
          {currentCat?.description && <p className={styles.heroDesc}>{currentCat.description}</p>}
        </div>
      )}

      <div className={styles.container}>
        {subcats.length > 0 && (
          <div className={styles.subcats}>
            {subcats.map(s => (
              <Link
                key={s.id || s.slug}
                to={`/catalog/${s.slug}`}
                className={`${styles.subcat} ${category === s.slug ? styles.subcatActive : ''}`}
              >
                <div className={styles.subcatPhoto} />
                <p className={styles.subcatName}>{s.title || s.name}</p>
                <p className={styles.subcatCount}>{s.subtree_product_count ?? s.direct_product_count ?? ''}</p>
              </Link>
            ))}
            {category && (
              <Link to="/catalog" className={styles.subcat}>
                <div className={styles.subcatPhoto} />
                <p className={styles.subcatName}>Весь каталог</p>
              </Link>
            )}
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.filters}>
            <div className={styles.filterHead}>
              <span className={styles.filterTitle}>Фильтр</span>
              <button type="button" className={styles.filterClear} onClick={clearAll}>Сбросить всё</button>
            </div>
            <div className={styles.filterBody}>
              <div className={styles.filterGroup}>
                <button type="button" className={styles.filterGroupBtn} onClick={() => toggleGroup('nalichie')}>
                  Наличие
                  <ChevronDown size={14} strokeWidth={2} style={{ transform: openGroups.nalichie ? 'rotate(180deg)' : 'none', transition: '150ms', flexShrink: 0 }} />
                </button>
                {openGroups.nalichie !== false && (
                  <div className={styles.filterGroupBody}>
                    <label className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={e => setOnlyInStock(e.target.checked)}
                        className={styles.filterCheckbox}
                      />
                      <span className={styles.filterOptionLabel}>В наличии</span>
                    </label>
                    {[
                      { value: '', label: 'Любой статус' },
                      { value: 'available', label: 'Много (available)' },
                      { value: 'low', label: 'Мало (low)' },
                      { value: 'out', label: 'Нет (out)' },
                      { value: 'unknown', label: 'Неизвестно' },
                    ].map(opt => (
                      <label key={opt.value || 'any'} className={styles.filterOption}>
                        <input
                          type="radio"
                          name="stock_state"
                          checked={stockState === opt.value}
                          onChange={() => setStockState(opt.value)}
                          className={styles.filterCheckbox}
                        />
                        <span className={styles.filterOptionLabel}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className={styles.productsArea}>
            <div className={styles.toolbar}>
              <span className={styles.count}>{loading ? '…' : `${total} товаров`}</span>
              <div className={styles.toolbarRight}>
                <input
                  className={styles.searchInput}
                  type="search"
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
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className={styles.chips}>
                {activeChips.map(chip => (
                  <button key={chip.key} type="button" className={styles.chip} onClick={clearAll}>
                    {chip.label}
                    <span className={styles.chipX}>✕</span>
                  </button>
                ))}
                <button type="button" className={styles.chipsReset} onClick={clearAll}>Сбросить всё</button>
              </div>
            )}

            {error && (
              <div className={styles.empty}>
                <p>{error}</p>
                <p style={{ marginTop: 8, fontSize: 14, color: '#6F6F6F' }}>
                  Проверьте, что API запущен (localhost:8000) и CORS/proxy настроены.
                </p>
                <button
                  type="button"
                  className={styles.ctaBtn}
                  style={{ marginTop: 16, display: 'inline-flex' }}
                  onClick={loadProducts}
                >
                  Повторить
                </button>
              </div>
            )}
            {!error && loading && <div className={styles.empty}>Загрузка каталога…</div>}
            {!error && !loading && items.length === 0 && (
              <div className={styles.empty}>Ничего не нашли. Попробуйте изменить параметры поиска.</div>
            )}
            {!error && !loading && items.length > 0 && (
              <div className={styles.grid}>
                {items.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>

        <div className={styles.cta}>
          <div className={styles.ctaLeft}>
            <h3 className={styles.ctaTitle}>Нужна пластина сегодня?</h3>
            <p className={styles.ctaDesc}>Отправьте параметры или фото пластины/название. Мы проверим склад и подберём подходящий вариант.</p>
            <a href="tel:+79611898933" className={styles.ctaBtn}>
              Написать специалисту <ArrowRight size={20} strokeWidth={1.8} />
            </a>
          </div>
          <img src={img('images/котик-каталог.png')} alt="" className={styles.ctaImg} aria-hidden="true" />
        </div>

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0 || loading}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  const image = productImageUrl(product.image, 'card')
  const inStock = isInStock(product.stock)

  return (
    <Link to={`/catalog/${product.category_slug}/${product.slug}`} className={styles.card}>
      <div className={styles.cardImg}>
        {image && (
          <img
            src={image}
            alt={product.image?.alt || product.name}
            loading="lazy"
            onError={e => { e.currentTarget.style.opacity = '0.3' }}
          />
        )}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{product.name}</p>
        {product.article && <p className={styles.cardSku}>{product.article}</p>}
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>{formatMoney(product.price)}</span>
          <span className={inStock ? styles.inStock : styles.outOfStock}>
            <span className={inStock ? styles.dot : styles.dotGrey} />
            {stockLabel(product.stock)}
          </span>
        </div>
        <div className={styles.cardBtn}>Подробнее →</div>
      </div>
    </Link>
  )
}
