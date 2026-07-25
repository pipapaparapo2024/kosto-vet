import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from './CatalogPage.module.css'

const CATEGORIES = [
  { slug: 'plastiny', name: 'Пластины', desc: 'Для фиксации переломов у собак и кошек. Актуальные наличие и доставка по Воронежу за 2–4 часа.' },
  { slug: 'vinty', name: 'Винты', desc: 'Для остеосинтеза и фиксации пластин. Широкий выбор диаметров и длин.' },
  { slug: 'instrumenty', name: 'Инструменты', desc: 'Специализированные инструменты для операций остеосинтеза.' },
  { slug: 'shvovny', name: 'Шовный материал', desc: 'Рассасывающийся и нерассасывающийся шовный материал.' },
  { slug: 'nabory', name: 'Наборы', desc: 'Готовые наборы для остеосинтеза под конкретный тип операции.' },
]

const SUBCATEGORIES = {
  plastiny: [
    { slug: 'pryamye', name: 'Прямые', count: 45 },
    { slug: 't-obraznye', name: 'Т-образные', count: 19 },
    { slug: 'l-obraznye', name: 'L-образные', count: 45 },
    { slug: 'rekonstruktivnye', name: 'Реконструктивные', count: 12 },
    { slug: 'dlya-bedrennoj', name: 'Для бедренной кости', count: 42 },
    { slug: 'dlya-taza', name: 'Для таза', count: 38 },
    { slug: 'vse-plastiny', name: 'Все пластины', count: 127 },
  ],
  vinty: [
    { slug: 'kortikalnye', name: 'Кортикальные', count: 34 },
    { slug: 'gubchatye', name: 'Губчатые', count: 28 },
    { slug: 'blokitruyushchie', name: 'Блокирующие', count: 20 },
    { slug: 'vse-vinty', name: 'Все винты', count: 82 },
  ],
  instrumenty: [
    { slug: 'sverla', name: 'Свёрла', count: 12 },
    { slug: 'razvyortki', name: 'Развёртки', count: 8 },
    { slug: 'vse-instrumenty', name: 'Все инструменты', count: 31 },
  ],
  shvovny: [
    { slug: 'rassasyvayushhijsya', name: 'Рассасывающийся', count: 32 },
    { slug: 'nerrassasyvayushhijsya', name: 'Нерассасывающийся', count: 26 },
    { slug: 'vse-shvovny', name: 'Весь шовный материал', count: 58 },
  ],
  nabory: [
    { slug: 'vse-nabory', name: 'Все наборы', count: 16 },
  ],
}

// Моковые товары
const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: 'Пластина парная',
  desc: 'Для фиксации перелома трубчатых костей',
  price: 1143,
  stock: Math.floor(Math.random() * 20) + 1,
  sizes: `${(i % 3 + 1) * 33} мм`,
  article: `KV-P-${String(i + 1).padStart(3, '0')}`,
}))

const SORT_OPTIONS = [
  { value: 'popular', label: 'Популярные' },
  { value: 'price_asc', label: 'Цена по возрастанию' },
  { value: 'price_desc', label: 'Цена по убыванию' },
  { value: 'name', label: 'По названию' },
]

export default function CatalogPage() {
  const { category } = useParams()
  const currentCat = CATEGORIES.find(c => c.slug === category) || CATEGORIES[0]
  const subcats = SUBCATEGORIES[currentCat.slug] || []

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({ inStock: false, size: null })
  const [activeSubcat, setActiveSubcat] = useState(null)

  const products = useMemo(() => {
    let list = MOCK_PRODUCTS
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (activeFilters.inStock) list = list.filter(p => p.stock > 0)
    return list
  }, [search, activeFilters])

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link>
            <span>/</span>
            <Link to="/catalog">Каталог</Link>
            <span>/</span>
            <span>{currentCat.name}</span>
          </nav>
        </div>
      </div>

      {/* Заголовок */}
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{currentCat.name} для остеосинтеза</h1>
            <p className={styles.desc}>{currentCat.desc}</p>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                2–4 часа по Воронежу
              </span>
              <span className={styles.metaItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                Остаток в реальном времени
              </span>
            </div>
          </div>
          <div className={styles.headerPhoto}>Фото/графика</div>
        </div>

        {/* Подкатегории */}
        {subcats.length > 0 && (
          <div className={styles.subcats}>
            {subcats.map(s => (
              <button
                key={s.slug}
                className={`${styles.subcatBtn} ${activeSubcat === s.slug ? styles.subcatActive : ''}`}
                onClick={() => setActiveSubcat(activeSubcat === s.slug ? null : s.slug)}
              >
                <span className={styles.subcatPhoto}>Фото<br/>товара</span>
                <span className={styles.subcatName}>{s.name}</span>
                <span className={styles.subcatCount}>{s.count} товара</span>
              </button>
            ))}
          </div>
        )}

        {/* Тулбар */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              className={`${styles.filterBtn} ${filtersOpen ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Фильтр
            </button>
            <span className={styles.count}><strong>{products.length}</strong> товаров</span>
          </div>
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
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Активные фильтры */}
        {activeFilters.inStock && (
          <div className={styles.activeFilters}>
            <span className={styles.filterTag}>
              В наличии
              <button onClick={() => setActiveFilters(f => ({ ...f, inStock: false }))}>×</button>
            </span>
          </div>
        )}
      </div>

      {/* Основной контент */}
      <div className={styles.container}>
        <div className={`${styles.layout} ${filtersOpen ? styles.layoutWithFilters : ''}`}>
          {/* Панель фильтров */}
          {filtersOpen && (
            <aside className={styles.filters}>
              <div className={styles.filterHeader}>
                <span className={styles.filterTitle}>Фильтр</span>
                <button
                  className={styles.clearAll}
                  onClick={() => setActiveFilters({ inStock: false, size: null })}
                >
                  Сбросить всё
                </button>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterGroupTitle}>Наличие</p>
                <label className={styles.filterCheck}>
                  <input
                    type="checkbox"
                    checked={activeFilters.inStock}
                    onChange={e => setActiveFilters(f => ({ ...f, inStock: e.target.checked }))}
                  />
                  В наличии
                </label>
                <label className={styles.filterCheck}>
                  <input type="checkbox" />
                  Под заказ
                </label>
              </div>

              <FilterGroup title="Форма пластины" collapsed />
              <FilterGroup title="Длина, мм" collapsed />
              <FilterGroup title="Ширина, мм" collapsed />
              <FilterGroup title="Кол-во отверстий" collapsed />
              <FilterGroup title="Цена (₽)" collapsed />
            </aside>
          )}

          {/* Сетка товаров */}
          <div className={styles.products}>
            <div className={styles.grid}>
              {products.map(p => (
                <ProductCard key={p.id} product={p} category={currentCat.slug} />
              ))}
            </div>

            {/* CTA блок */}
            <div className={styles.ctaBanner}>
              <div className={styles.ctaText}>
                <h3>Нужна пластина сегодня?</h3>
                <p>Отправьте параметры или фото вашей пластины/рентгенограммы. Наш партнёр поможет вам подобрать корректный вариант.</p>
                <a href="tel:+79611898933" className={styles.ctaBtn}>
                  Написать специалисту →
                </a>
              </div>
              <div className={styles.ctaPhoto}>Фото/графика</div>
            </div>

            {/* Пагинация */}
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled>‹</button>
              {[1, 2, 3, '...', 9].map((p, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${p === 1 ? styles.pageBtnActive : ''}`}
                  disabled={p === '...'}
                >
                  {p}
                </button>
              ))}
              <button className={styles.pageBtn}>›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, collapsed: initialCollapsed }) {
  const [open, setOpen] = useState(!initialCollapsed)
  return (
    <div className={styles.filterGroup}>
      <button className={styles.filterGroupTitle} onClick={() => setOpen(!open)}>
        {title}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '200ms' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className={styles.filterGroupBody}><p style={{ color: '#999', fontSize: 13 }}>Опции появятся после подключения API</p></div>}
    </div>
  )
}

function ProductCard({ product, category }) {
  return (
    <Link to={`/catalog/${category}/${product.id}`} className={styles.card}>
      <div className={styles.cardPhoto}>Фото товара</div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{product.name}</p>
        <p className={styles.cardDesc}>{product.desc}</p>
        <p className={styles.cardMeta}>В наличии {product.stock} шт.</p>
        <div className={styles.cardBottom}>
          <span className={styles.cardPrice}>{product.price.toLocaleString('ru')} ₽</span>
          <button className={styles.cardBtn} onClick={e => { e.preventDefault() }}>
            Подробнее <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
