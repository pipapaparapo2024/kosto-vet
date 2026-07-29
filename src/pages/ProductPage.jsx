import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductBySlug, minPrice, CATEGORIES, PRODUCTS } from '../data/catalog'
import { img } from '../utils/assetUrl'
import styles from './ProductPage.module.css'
import orderStyles from './OrderDrawer.module.css'

function parseLength(dim) {
  if (!dim) return null
  return dim.split('/')[0]
}
function parseWidth(dim) {
  if (!dim) return null
  const parts = dim.split('/')
  return parts[1] || null
}
function unique(arr) {
  return [...new Set(arr.filter(Boolean))]
}

export default function ProductPage() {
  const { category, id } = useParams()
  const product = getProductBySlug(id)

  const [orderOpen, setOrderOpen] = useState(false)

  // Derive unique param values
  const lengths = unique((product?.variants || []).map(v => parseLength(v.dimensions)))
  const holes   = unique((product?.variants || []).map(v => v.holes != null ? String(v.holes) : null))
  const widths  = unique((product?.variants || []).map(v => parseWidth(v.dimensions)))

  const firstVariant = product?.variants?.[0]
  const [selLength, setSelLength] = useState(parseLength(firstVariant?.dimensions))
  const [selHoles,  setSelHoles]  = useState(firstVariant?.holes != null ? String(firstVariant.holes) : null)
  const [selWidth,  setSelWidth]  = useState(parseWidth(firstVariant?.dimensions))

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const v = product.variants[0]
      setSelLength(parseLength(v.dimensions))
      setSelHoles(v.holes != null ? String(v.holes) : null)
      setSelWidth(parseWidth(v.dimensions))
    }
  }, [product])

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.container}>
          <h1>Товар не найден</h1>
          <p>Возможно, он был удалён или вы перешли по устаревшей ссылке.</p>
          <Link to="/catalog" className={styles.backLink}>← Вернуться в каталог</Link>
        </div>
      </div>
    )
  }

  // Find matching variant
  const selectedVariant = product.variants?.find(v => {
    const lMatch = lengths.length === 0 || parseLength(v.dimensions) === selLength
    const hMatch = holes.length   === 0 || v.holes == null || String(v.holes) === selHoles
    const wMatch = widths.length  === 0 || parseWidth(v.dimensions) === selWidth
    return lMatch && hMatch && wMatch
  }) || product.variants?.[0]

  const catName = CATEGORIES.find(c => c.slug === product.category)?.name || 'Каталог'
  const activePrice = selectedVariant?.price || minPrice(product)

  // Related: installation products (from Винты), similar (same category, different product)
  const installProducts = PRODUCTS.filter(p => p.category === 'vinty').slice(0, 7)
  const similarProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 7)

  const hasVariantGroups = lengths.length > 1 || holes.length > 1 || widths.length > 1

  return (
    <>
      <div className={styles.page}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbWrap}>
          <div className={styles.container}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Главная</Link><span>›</span>
              <Link to="/catalog">Каталог</Link><span>›</span>
              <Link to={`/catalog/${product.category}`}>{catName}</Link><span>›</span>
              <span>{product.shortName || product.name}</span>
            </nav>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Фото */}
            <div className={styles.photoCol}>
              <div className={styles.mainPhoto}>
                <img
                  src={img(product.image)}
                  alt={product.name}
                  onError={e => { e.currentTarget.style.opacity = '0.3' }}
                />
              </div>
            </div>

            {/* Инфо */}
            <div className={styles.infoCol}>
              <div className={styles.stockRow}>
                <span className={product.inStock ? styles.inStock : styles.outOfStock}>
                  <span className={product.inStock ? styles.dot : styles.dotGrey} />
                  {product.inStock ? `В наличии${selectedVariant?.stock ? ` ${selectedVariant.stock} шт.` : ''}` : 'Нет в наличии'}
                </span>
                {selectedVariant?.sku && (
                  <span className={styles.article}>Артикул: {selectedVariant.sku}</span>
                )}
              </div>

              <h1 className={styles.name}>{product.name}</h1>

              {product.description && (
                <p className={styles.desc}>{product.description}</p>
              )}

              {/* Specs */}
              {selectedVariant && (
                <div className={styles.specs}>
                  {selectedVariant.dimensions && (
                    <div className={styles.spec}>
                      <span className={styles.specVal}>{parseLength(selectedVariant.dimensions)} мм</span>
                      <span className={styles.specLabel}>длина</span>
                    </div>
                  )}
                  {selectedVariant.holes != null && (
                    <div className={styles.spec}>
                      <span className={styles.specVal}>{selectedVariant.holes}</span>
                      <span className={styles.specLabel}>отверстий</span>
                    </div>
                  )}
                  {selectedVariant.dimensions && parseWidth(selectedVariant.dimensions) && (
                    <div className={styles.spec}>
                      <span className={styles.specVal}>{parseWidth(selectedVariant.dimensions)} мм</span>
                      <span className={styles.specLabel}>ширина</span>
                    </div>
                  )}
                  {selectedVariant.thickness != null && (
                    <div className={styles.spec}>
                      <span className={styles.specVal}>{selectedVariant.thickness} мм</span>
                      <span className={styles.specLabel}>толщина</span>
                    </div>
                  )}
                  {product.material && (
                    <div className={styles.spec}>
                      <span className={styles.specVal}>{product.material}</span>
                      <span className={styles.specLabel}>материал</span>
                    </div>
                  )}
                </div>
              )}

              {activePrice
                ? <p className={styles.price}>{activePrice.toLocaleString('ru')} <span className={styles.currency}>₽</span></p>
                : <p className={styles.priceOnRequest}>Цена по запросу</p>
              }

              <p className={styles.deliveryNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Доставим по Воронежу сегодня за 2–4 часа.
              </p>

              <button className={styles.orderBtn} onClick={() => setOrderOpen(true)}>
                Заказать
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              <a href="tel:+79611898933" className={styles.phoneLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +7 (961) 189-89-33
              </a>
            </div>
          </div>

          {/* Выберите вариант */}
          {hasVariantGroups && (
            <div className={styles.variants}>
              <h2 className={styles.variantsTitle}>Выберите вариант</h2>
              <div className={styles.variantGroups}>
                {lengths.length > 1 && (
                  <div className={styles.variantGroup}>
                    <p className={styles.variantLabel}>Длина</p>
                    <div className={styles.variantOptions}>
                      {lengths.map(l => (
                        <button
                          key={l}
                          className={`${styles.variantOption} ${selLength === l ? styles.variantSelected : ''}`}
                          onClick={() => setSelLength(l)}
                        >{l} мм</button>
                      ))}
                    </div>
                  </div>
                )}
                {holes.length > 1 && (
                  <div className={styles.variantGroup}>
                    <p className={styles.variantLabel}>Кол-во отверстий</p>
                    <div className={styles.variantOptions}>
                      {holes.map(h => (
                        <button
                          key={h}
                          className={`${styles.variantOption} ${selHoles === h ? styles.variantSelected : ''}`}
                          onClick={() => setSelHoles(h)}
                        >{h}</button>
                      ))}
                    </div>
                  </div>
                )}
                {widths.length > 1 && (
                  <div className={styles.variantGroup}>
                    <p className={styles.variantLabel}>Ширина</p>
                    <div className={styles.variantOptions}>
                      {widths.map(w => (
                        <button
                          key={w}
                          className={`${styles.variantOption} ${selWidth === w ? styles.variantSelected : ''}`}
                          onClick={() => setSelWidth(w)}
                        >{w} мм</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Преимущества */}
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <p className={styles.benefitTitle}>Нужно сегодня?</p>
                <p className={styles.benefitDesc}>Оформите заказ до 18:00 — доставим по Воронежу за 2–4 часа</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <div>
                <p className={styles.benefitTitle}>Актуальный остаток на складе</p>
                <p className={styles.benefitDesc}>Вы видите точное наличие до оформления заказа</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <div>
                <p className={styles.benefitTitle}>Помощь с подбором от специалиста</p>
                <p className={styles.benefitDesc}>Позвоните нам — поможем выбрать нужный имплант</p>
              </div>
            </div>
          </div>

          {/* Для установки */}
          {installProducts.length > 0 && (
            <div className={styles.related}>
              <div className={styles.relatedHead}>
                <p className={styles.relatedTitle}>Для установки этой пластины</p>
                <Link to="/catalog/vinty" className={styles.relatedLink}>Смотреть все →</Link>
              </div>
              <div className={styles.relatedScroll}>
                {installProducts.map(p => (
                  <SmallCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Похожие */}
          {similarProducts.length > 0 && (
            <div className={styles.related}>
              <div className={styles.relatedHead}>
                <p className={styles.relatedTitle}>Похожие пластины</p>
                <Link to={`/catalog/${product.category}`} className={styles.relatedLink}>Смотреть все →</Link>
              </div>
              <div className={styles.relatedScroll}>
                {similarProducts.map(p => (
                  <SmallCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderDrawer
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
        variant={selectedVariant}
      />
    </>
  )
}

function SmallCard({ product }) {
  const price = minPrice(product)
  return (
    <Link to={`/catalog/${product.category}/${product.slug}`} className={styles.smallCard}>
      <div className={styles.smallCardImg}>
        <img
          src={img(product.image)}
          alt={product.name}
          loading="lazy"
          onError={e => { e.currentTarget.style.opacity = '0.3' }}
        />
      </div>
      <div className={styles.smallCardBody}>
        <p className={styles.smallCardName}>{product.shortName || product.name}</p>
        {product.description && <p className={styles.smallCardDesc}>{product.description}</p>}
        {price && <p className={styles.smallCardPrice}>от {price.toLocaleString('ru')} ₽</p>}
        <button className={styles.smallCardBtn}>Подробнее →</button>
      </div>
    </Link>
  )
}

/* ===== OrderDrawer ===== */
function OrderDrawer({ open, onClose, product, variant }) {
  const [qty,       setQty]       = useState(1)
  const [delivery,  setDelivery]  = useState('voronezh')
  const [form,      setForm]      = useState({ name: '', phone: '', clinic: '', comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (!open) return null

  const priceToShow = variant?.price || minPrice(product)

  return (
    <div
      className={orderStyles.overlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={orderStyles.drawer}>
        <div className={orderStyles.header}>
          <h2 className={orderStyles.title}>Ваш заказ</h2>
          <button className={orderStyles.close} onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className={orderStyles.success}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
            </svg>
            <h3>Заказ принят!</h3>
            <p>Наш специалист свяжется с Вами в течение нескольких минут.</p>
            <button className={orderStyles.submitBtn} onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <>
            <div className={orderStyles.productRow}>
              <div className={orderStyles.productPhoto}>
                <img
                  src={img(product.image)}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                  onError={e => { e.currentTarget.style.opacity = '0.3' }}
                />
              </div>
              <div className={orderStyles.productInfo}>
                <p className={orderStyles.productName}>{product.shortName || product.name}</p>
                {variant?.sku && (
                  <p className={orderStyles.productArticle}>Артикул: {variant.sku}</p>
                )}
              </div>
              {priceToShow && (
                <p className={orderStyles.productPrice}>{priceToShow.toLocaleString('ru')} ₽</p>
              )}
            </div>

            <form className={orderStyles.form} onSubmit={handleSubmit}>
              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Количество</label>
                <div className={orderStyles.qtyRow}>
                  <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <span className={orderStyles.qtyVal}>{qty}</span>
                  <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>

              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Способ получения</label>
                <div className={orderStyles.radioGroup}>
                  {[
                    { value: 'voronezh', label: 'Доставка по Воронежу (2–4 часа)' },
                    { value: 'pickup',   label: 'Самовывоз' },
                    { value: 'russia',   label: 'Доставка по России (1–3 дня)' },
                  ].map(opt => (
                    <label key={opt.value} className={`${orderStyles.radio} ${delivery === opt.value ? orderStyles.radioActive : ''}`}>
                      <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Контактные данные</label>
                <input className={orderStyles.input} type="text" placeholder="Ваше имя*" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className={orderStyles.input} type="tel" placeholder="Телефон*" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <input className={orderStyles.input} type="text" placeholder="Клиника" value={form.clinic} onChange={e => setForm(f => ({ ...f, clinic: e.target.value }))} />
              </div>

              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Комментарий к заказу</label>
                <textarea className={orderStyles.textarea} placeholder="Например: нужно сегодня до 17:00" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
              </div>

              <button type="submit" className={orderStyles.submitBtn}>Оформить заказ</button>
              <p className={orderStyles.privacy}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Мы не передаём ваши данные третьим лицам
              </p>
            </form>

            <p className={orderStyles.callbackNote}>Наш специалист свяжется с Вами<br/>в течение нескольких минут.</p>
          </>
        )}
      </div>
    </div>
  )
}
