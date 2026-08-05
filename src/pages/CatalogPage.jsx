import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Clock, Box, ChevronDown, ArrowRight, LayoutGrid, X, SlidersHorizontal } from 'lucide-react'
import { listCategories, listProducts, getCategory } from '../lib/api/catalog'
import { formatMoney, isInStock, stockLabel, productImageUrl, productSpecsLine } from '../lib/money'
import { categoryTitle } from '../lib/labels'
import { img } from '../utils/assetUrl'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { CatalogProductsSkeleton } from '../components/ui/Skeleton/Skeleton'
import styles from './CatalogPage.module.css'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Самое популярное' },
  { value: 'price_asc', label: 'Цена по возрастанию' },
  { value: 'price_desc', label: 'Цена по убыванию' },
  { value: 'name_asc', label: 'По названию' },
  { value: 'stock_desc', label: 'По наличию' },
]

const PER_PAGE = 24

/** Верхний ряд карточек формы пластин (макет: 7 шт). */
export const PLATE_SUBCATS = [
  { slug: 'parnye', title: 'Парные', match: /парн/i },
  { slug: 't-obraznye', title: 'Т-образные', match: /т[\s-]?образ/i },
  { slug: 'l-obraznye', title: 'L-образные', match: /l[\s-]?образ|л[\s-]?образ/i },
  { slug: 'rekonstruktivnye', title: 'Реконструктивные', match: /реконструкт/i },
  { slug: 'bedrennaya', title: 'Для бедренной кости', match: /бедрен/i },
  { slug: 'taz', title: 'Для таза', match: /таз|тазов/i },
  { slug: 'all-plastiny', title: 'Все пластины', isAll: true },
]

function formatProductCount(n) {
  if (n == null || n === '') return ''
  const count = Number(n)
  if (Number.isNaN(count)) return String(n)
  const mod10 = count % 10
  const mod100 = count % 100
  let word = 'товаров'
  if (mod10 === 1 && mod100 !== 11) word = 'товар'
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = 'товара'
  return `${count} ${word}`
}

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
  const [plateShape, setPlateShape] = useState(searchParams.get('shape') || '')
  const [lengthMm, setLengthMm] = useState('')
  const [widthMm, setWidthMm] = useState('')
  const [holes, setHoles] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [openGroups, setOpenGroups] = useState({ nalichie: true })
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  useEffect(() => {
    const q = searchParams.get('q') || ''
    if (q && q !== search) setSearch(q)
  }, [searchParams])

  const currentCat = categoryDetail || categories.find(c => c.slug === category) || null

  const categoryDisplayName = categoryTitle(currentCat || category, category ? 'Категория' : 'Каталог')

  useDocumentTitle(
    currentCat?.seo?.title || categoryDisplayName,
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

  useEffect(() => {
    const shape = searchParams.get('shape') || ''
    if (shape !== plateShape) setPlateShape(shape)
  }, [searchParams])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const shapeMeta = PLATE_SUBCATS.find(s => s.slug === plateShape && !s.isAll)
      const res = await listProducts({
        category: category || (plateShape ? 'plastiny' : undefined),
        includeDescendants: true,
        q: search.trim() || undefined,
        inStock: onlyInStock || undefined,
        stockState: stockState || undefined,
        sort,
        page: shapeMeta ? 1 : page,
        limit: shapeMeta ? 200 : PER_PAGE,
      })
      let nextItems = res.items || []
      let nextTotal = res.total || 0
      if (shapeMeta?.match) {
        nextItems = nextItems.filter(p =>
          shapeMeta.match.test(p.name || '') || shapeMeta.match.test(p.subtitle || ''),
        )
        nextTotal = nextItems.length
        const start = (page - 1) * PER_PAGE
        nextItems = nextItems.slice(start, start + PER_PAGE)
      }
      setItems(nextItems)
      setTotal(nextTotal)
    } catch (e) {
      setError(e.message || 'Не удалось загрузить каталог')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [category, search, onlyInStock, stockState, sort, page, plateShape])

  useEffect(() => {
    const t = setTimeout(loadProducts, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadProducts, search])

  useEffect(() => {
    setPage(1)
  }, [category, search, onlyInStock, stockState, sort, plateShape])

  useEffect(() => {
    const next = {}
    if (search) next.q = search
    if (sort !== 'popular') next.sort = sort
    if (onlyInStock) next.in_stock = 'true'
    if (stockState) next.stock_state = stockState
    if (plateShape && plateShape !== 'all-plastiny') next.shape = plateShape
    if (page > 1) next.page = String(page)
    setSearchParams(next, { replace: true })
  }, [search, sort, onlyInStock, stockState, plateShape, page, setSearchParams])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const toggleGroup = key => setOpenGroups(g => ({ ...g, [key]: !g[key] }))
  const activeChips = [
    ...(onlyInStock ? [{ label: 'В наличии', key: 'stock' }] : []),
    ...(stockState === 'out' ? [{ label: 'Под заказ', key: 'stock_state' }] : []),
    ...(plateShape ? [{ label: `Форма: ${PLATE_SUBCATS.find(s => s.slug === plateShape)?.title || plateShape}`, key: 'shape' }] : []),
    ...(lengthMm ? [{ label: `Длина ${lengthMm}`, key: 'length' }] : []),
    ...(widthMm ? [{ label: `Ширина ${widthMm}`, key: 'width' }] : []),
    ...(holes ? [{ label: `${holes} отверстий`, key: 'holes' }] : []),
    ...(priceRange ? [{ label: `Цена ${priceRange}`, key: 'price' }] : []),
  ]

  const clearChip = key => {
    if (key === 'stock') setOnlyInStock(false)
    else if (key === 'stock_state') setStockState('')
    else if (key === 'shape') setPlateShape('')
    else if (key === 'length') setLengthMm('')
    else if (key === 'width') setWidthMm('')
    else if (key === 'holes') setHoles('')
    else if (key === 'price') setPriceRange('')
  }

  const clearAll = () => {
    setOnlyInStock(false)
    setStockState('')
    setPlateShape('')
    setLengthMm('')
    setWidthMm('')
    setHoles('')
    setPriceRange('')
  }

  const scrollToFilters = () => {
    document.getElementById('catalog-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToPage = (next) => {
    setPage(next)
    window.scrollTo(0, 0)
  }

  const rootCats = categories
  const showPlateSubcats = !category || category === 'plastiny'
  const subcats = showPlateSubcats
    ? PLATE_SUBCATS
    : (categoryDetail?.children?.length
      ? categoryDetail.children
      : (currentCat?.children?.length ? currentCat.children : rootCats))

  return (
    <div className={styles.page}>
      {!category && (
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Главная</Link><span>›</span>
              <span>Каталог</span>
            </nav>
            <h1 className={styles.heroTitle}>Пластины для остеосинтеза</h1>
            <p className={styles.heroDesc}>Для фиксации переломов у кошек и собак. Текущее наличие и доставка по Воронежу за 2–4 часа.</p>
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
                <Link to={`/catalog/${a.slug}`}>{categoryTitle(a)}</Link><span>›</span>
              </span>
            ))}
            <span>{categoryDisplayName}</span>
          </nav>
          <h1 className={styles.heroTitle}>{categoryDisplayName}</h1>
          {currentCat?.description && <p className={styles.heroDesc}>{currentCat.description}</p>}
        </div>
      )}

      <div className={styles.container}>
        {subcats.length > 0 && (
          <div className={styles.subcats}>
            {subcats.map(s => {
              const isPlateCard = showPlateSubcats
              const isAll = s.isAll || s.slug === 'all-plastiny'
              const active = isPlateCard
                ? (isAll ? !plateShape : plateShape === s.slug)
                : category === s.slug
              const to = isPlateCard
                ? (isAll ? '/catalog/plastiny' : `/catalog/plastiny?shape=${encodeURIComponent(s.slug)}`)
                : `/catalog/${s.slug}`

              return (
                <Link
                  key={s.id || s.slug}
                  to={to}
                  className={`${styles.subcat} ${active ? styles.subcatActive : ''}`}
                  onClick={() => {
                    if (isPlateCard) setPlateShape(isAll ? '' : s.slug)
                  }}
                >
                  <div className={styles.subcatPhoto}>
                    {isAll
                      ? <LayoutGrid size={60} strokeWidth={1.4} className={styles.subcatAllIcon} aria-hidden="true" />
                      : 'Фото товара'}
                  </div>
                  <p className={styles.subcatName}>{s.title || categoryTitle(s)}</p>
                  <p className={styles.subcatCount}>
                    {formatProductCount(s.count ?? s.subtree_product_count ?? s.direct_product_count)}
                  </p>
                </Link>
              )
            })}
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.filters} id="catalog-filters">
            <div className={styles.filterHead}>
              <span className={styles.filterTitle}>Фильтр</span>
              <button type="button" className={styles.filterClear} onClick={clearAll}>Сбросить всё</button>
            </div>
            <div className={styles.filterBody}>
              <div className={styles.filterGroup}>
                <button type="button" className={styles.filterGroupBtn} onClick={() => toggleGroup('nalichie')}>
                  Наличие
                  <ChevronDown size={14} strokeWidth={2.5} style={{ transform: openGroups.nalichie !== false ? 'rotate(180deg)' : 'none', transition: 'transform 240ms ease', flexShrink: 0 }} />
                </button>
                <div className={`${styles.filterGroupBodyWrap} ${openGroups.nalichie !== false ? styles.filterGroupBodyWrapOpen : ''}`}>
                  <div className={`${styles.filterGroupBody} ${openGroups.nalichie !== false ? styles.filterGroupBodyOpen : ''}`}>
                    <label className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={e => { setOnlyInStock(e.target.checked); if (e.target.checked) setStockState('') }}
                        className={styles.filterCheckbox}
                      />
                      <span className={styles.filterOptionLabel}>В наличии</span>
                      <span className={styles.filterCount}>{total || '—'}</span>
                    </label>
                    <label className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={stockState === 'out'}
                        onChange={e => { setStockState(e.target.checked ? 'out' : ''); if (e.target.checked) setOnlyInStock(false) }}
                        className={styles.filterCheckbox}
                      />
                      <span className={styles.filterOptionLabel}>Под заказ</span>
                    </label>
                  </div>
                </div>
              </div>

              {[
                {
                  key: 'shape',
                  title: 'Форма пластины',
                  value: plateShape,
                  set: setPlateShape,
                  options: [
                    { value: 'parnye', label: 'Парные' },
                    { value: 't-obraznye', label: 'Т-образные' },
                    { value: 'l-obraznye', label: 'L-образные' },
                    { value: 'rekonstruktivnye', label: 'Реконструктивные' },
                    { value: 'bedrennaya', label: 'Для бедренной кости' },
                    { value: 'taz', label: 'Для таза' },
                  ],
                },
                {
                  key: 'length',
                  title: 'Длина, мм',
                  value: lengthMm,
                  set: setLengthMm,
                  options: ['33', '47', '50–65', '58', '70', '85'].map(v => ({ value: v, label: v })),
                },
                {
                  key: 'width',
                  title: 'Ширина, мм',
                  value: widthMm,
                  set: setWidthMm,
                  options: ['4,5', '6', '8', '10'].map(v => ({ value: v, label: v })),
                },
                {
                  key: 'holes',
                  title: 'Кол-во отверстий',
                  value: holes,
                  set: setHoles,
                  options: ['4', '6', '8', '10'].map(v => ({ value: v, label: v })),
                },
                {
                  key: 'price',
                  title: 'Цена (₽)',
                  value: priceRange,
                  set: setPriceRange,
                  options: ['до 1500', '1500–3000', 'от 3000'].map(v => ({ value: v, label: v })),
                },
              ].map(group => (
                <div key={group.key} className={styles.filterGroup}>
                  <button type="button" className={styles.filterGroupBtn} onClick={() => toggleGroup(group.key)}>
                    {group.title}
                    <ChevronDown size={14} strokeWidth={2.5} style={{ transform: openGroups[group.key] ? 'rotate(180deg)' : 'none', transition: 'transform 240ms ease', flexShrink: 0 }} />
                  </button>
                  <div className={`${styles.filterGroupBodyWrap} ${openGroups[group.key] ? styles.filterGroupBodyWrapOpen : ''}`}>
                    <div className={`${styles.filterGroupBody} ${openGroups[group.key] ? styles.filterGroupBodyOpen : ''}`}>
                      {group.options.map(opt => (
                        <label key={opt.value} className={styles.filterOption}>
                          <input
                            type="checkbox"
                            checked={group.value === opt.value}
                            onChange={() => group.set(group.value === opt.value ? '' : opt.value)}
                            className={styles.filterCheckbox}
                          />
                          <span className={styles.filterOptionLabel}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
                <div className={styles.sortWrap}>
                  <SortSelect value={sort} onChange={setSort} options={SORT_OPTIONS} />
                </div>
                <button type="button" className={styles.filterBtn} onClick={scrollToFilters}>
                  <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
                  Фильтр
                  {activeChips.length > 0 && (
                    <span className={styles.filterBadge}>{activeChips.length}</span>
                  )}
                </button>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className={styles.chips}>
                {activeChips.map(chip => (
                  <button
                    key={chip.key}
                    type="button"
                    className={styles.chip}
                    onClick={() => clearChip(chip.key)}
                  >
                    {chip.label}
                    <X size={14} strokeWidth={2} className={styles.chipX} aria-hidden="true" />
                  </button>
                ))}
                <button type="button" className={styles.chipsReset} onClick={clearAll}>Сбросить всё</button>
              </div>
            )}

            {error && (
              <div className={styles.empty}>
                <p>Не удалось загрузить каталог. Попробуйте обновить страницу или зайдите позже.</p>
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
            {!error && loading && <CatalogProductsSkeleton count={8} />}
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
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            <ArrowRight size={16} strokeWidth={2} className={styles.pageArrowPrev} aria-hidden="true" />
          </button>
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0 || loading}
          >
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SortSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(o => o.value === value) || options[0]

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={styles.sortSelect} ref={ref}>
      <button
        type="button"
        className={styles.sortBtn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Сортировка"
        onClick={() => setOpen(v => !v)}
      >
        <span>{current.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`${styles.sortChevron}${open ? ` ${styles.sortChevronOpen}` : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className={styles.sortMenu} role="listbox">
          {options.map(o => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={`${styles.sortOption}${o.value === value ? ` ${styles.sortOptionActive}` : ''}`}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProductCard({ product }) {
  const image = productImageUrl(product.image, 'card')
  const inStock = isInStock(product.stock)
  const specs = productSpecsLine(product)

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
        <p className={styles.cardName}>{product.subtitle || product.name}</p>
        <p className={styles.cardSku}>{product.name !== product.subtitle ? product.name : (product.article || '')}</p>
        {specs && <p className={styles.cardSpecs}>{specs}</p>}
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>{formatMoney(product.price)}</span>
          <span className={inStock ? styles.inStock : styles.outOfStock}>
            <span className={inStock ? styles.dot : styles.dotGrey} />
            {stockLabel(product.stock)}
          </span>
        </div>
        <div className={styles.cardBtn}>
          <span>Подробнее</span>
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
    </Link>
  )
}
