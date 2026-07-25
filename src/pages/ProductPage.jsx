import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from './ProductPage.module.css'
import orderStyles from './OrderDrawer.module.css'

const MOCK_PRODUCT = {
  id: 1,
  name: 'Пластина Т-образная',
  desc: 'Для фиксации переломов у собак мелких пород',
  price: 1143,
  stock: 12,
  article: 'KV-TP-058-06',
  category: 'plastiny',
  categoryName: 'Пластины',
  variants: {
    length: [33, 47, 58, 70, 85],
    holes: [4, 6, 8, 10],
    width: [4.5, 6, 10],
  },
  specs: [
    { label: 'Длина', value: '58 мм' },
    { label: 'Отверстий', value: '6' },
    { label: 'Ширина', value: '6 мм' },
    { label: 'Толщина', value: '2,0 мм' },
    { label: 'Материал', value: 'Сталь' },
  ],
}

export default function ProductPage() {
  const { category, id } = useParams()
  const product = MOCK_PRODUCT
  const [selectedVariant, setSelectedVariant] = useState({ length: 58, holes: 6, width: 6 })
  const [orderOpen, setOrderOpen] = useState(false)

  return (
    <>
      <div className={styles.page}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumbWrap}>
          <div className={styles.container}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Главная</Link><span>/</span>
              <Link to="/catalog">Каталог</Link><span>/</span>
              <Link to={`/catalog/${product.category}`}>{product.categoryName}</Link><span>/</span>
              <span>{product.name} {selectedVariant.length} мм, {selectedVariant.holes} отв.</span>
            </nav>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Фото */}
            <div className={styles.photoCol}>
              <div className={styles.mainPhoto}>
                <button className={styles.zoomBtn} title="Увеличить">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
                <span className={styles.photoPlaceholder}>Фото товара</span>
              </div>
            </div>

            {/* Инфо */}
            <div className={styles.infoCol}>
              <div className={styles.stockRow}>
                <span className={styles.inStock}>
                  <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#27ae60"/></svg>
                  В наличии {product.stock} шт.
                </span>
                <span className={styles.article}>Артикул: {product.article}</span>
              </div>

              <h1 className={styles.name}>{product.name}</h1>
              <p className={styles.desc}>{product.desc}</p>

              <div className={styles.specs}>
                {product.specs.map(s => (
                  <div key={s.label} className={styles.spec}>
                    <span className={styles.specVal}>{s.value}</span>
                    <span className={styles.specLabel}>{s.label}</span>
                  </div>
                ))}
              </div>

              <p className={styles.price}>{product.price.toLocaleString('ru')} <span className={styles.currency}>₽</span></p>
              <p className={styles.deliveryNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Доставим по Воронежу сегодня за 2–4 часа.
              </p>

              <button className={styles.orderBtn} onClick={() => setOrderOpen(true)}>
                Заказать <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>

              <a href="tel:+79611898933" className={styles.phoneLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +7 (961) 189-89-33
              </a>
            </div>
          </div>

          {/* Вариант */}
          <div className={styles.variants}>
            <p className={styles.variantsTitle}>Выберите вариант</p>
            <div className={styles.variantGroups}>
              <VariantGroup
                label="Длина"
                options={product.variants.length}
                selected={selectedVariant.length}
                suffix=" мм"
                onChange={v => setSelectedVariant(s => ({ ...s, length: v }))}
              />
              <VariantGroup
                label="Кол-во отверстий"
                options={product.variants.holes}
                selected={selectedVariant.holes}
                onChange={v => setSelectedVariant(s => ({ ...s, holes: v }))}
              />
              <VariantGroup
                label="Ширина"
                options={product.variants.width}
                selected={selectedVariant.width}
                suffix=" мм"
                onChange={v => setSelectedVariant(s => ({ ...s, width: v }))}
              />
            </div>
          </div>

          {/* Преимущества */}
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <p className={styles.benefitTitle}>Нужна сегодня?</p>
                <p className={styles.benefitDesc}>Оформите заказ до 18:00 — доставим по Воронежу за 2–4 часа</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <div>
                <p className={styles.benefitTitle}>Актуальный остаток на складе</p>
                <p className={styles.benefitDesc}>Вы видите точное количество до оформления заказа</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div>
                <p className={styles.benefitTitle}>Помощь с подбором от специалиста</p>
                <p className={styles.benefitDesc}>Позвоните нам — поможем выбрать нужный имплант</p>
              </div>
            </div>
          </div>
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

function VariantGroup({ label, options, selected, suffix = '', onChange }) {
  return (
    <div className={styles.variantGroup}>
      <p className={styles.variantLabel}>{label}</p>
      <div className={styles.variantOptions}>
        {options.map(o => (
          <button
            key={o}
            className={`${styles.variantOption} ${selected === o ? styles.variantSelected : ''}`}
            onClick={() => onChange(o)}
          >
            {o}{suffix}
          </button>
        ))}
      </div>
    </div>
  )
}

function OrderDrawer({ open, onClose, product, variant }) {
  const [qty, setQty] = useState(1)
  const [delivery, setDelivery] = useState('voronezh')
  const [form, setForm] = useState({ name: '', phone: '', clinic: '', comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
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

  return (
    <div className={orderStyles.overlay} ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose() }}>
      <div className={orderStyles.drawer}>
        <div className={orderStyles.header}>
          <h2 className={orderStyles.title}>Ваш заказ</h2>
          <button className={orderStyles.close} onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {submitted ? (
          <div className={orderStyles.success}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
            <h3>Заказ принят!</h3>
            <p>Наш специалист свяжется с Вами в течение нескольких минут.</p>
            <button className={orderStyles.submitBtn} onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <>
            {/* Товар */}
            <div className={orderStyles.productRow}>
              <div className={orderStyles.productPhoto}>Фото</div>
              <div className={orderStyles.productInfo}>
                <p className={orderStyles.productName}>{product.name}</p>
                <p className={orderStyles.productMeta}>{variant.length} мм · {variant.holes} отверстий</p>
                <p className={orderStyles.productArticle}>Артикул: {product.article}</p>
              </div>
              <p className={orderStyles.productPrice}>{product.price.toLocaleString('ru')} ₽</p>
            </div>

            <form className={orderStyles.form} onSubmit={handleSubmit}>
              {/* Количество */}
              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Количество</label>
                <div className={orderStyles.qtyRow}>
                  <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <span className={orderStyles.qtyVal}>{qty}</span>
                  <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>

              {/* Способ получения */}
              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Способ получения</label>
                <div className={orderStyles.radioGroup}>
                  {[
                    { value: 'voronezh', label: 'Доставка по Воронежу (2–4 часа)', icon: '🚚' },
                    { value: 'pickup', label: 'Самовывоз', icon: '📍' },
                    { value: 'russia', label: 'Доставка по России (1–3 дня)', icon: '📦' },
                  ].map(opt => (
                    <label key={opt.value} className={`${orderStyles.radio} ${delivery === opt.value ? orderStyles.radioActive : ''}`}>
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.value}
                        checked={delivery === opt.value}
                        onChange={() => setDelivery(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Контактные данные */}
              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Контактные данные</label>
                <input
                  className={orderStyles.input}
                  type="text"
                  placeholder="Ваше имя*"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className={orderStyles.input}
                  type="tel"
                  placeholder="Телефон*"
                  required
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
                <input
                  className={orderStyles.input}
                  type="text"
                  placeholder="Клиника"
                  value={form.clinic}
                  onChange={e => setForm(f => ({ ...f, clinic: e.target.value }))}
                />
              </div>

              {/* Комментарий */}
              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Комментарий к заказу</label>
                <textarea
                  className={orderStyles.textarea}
                  placeholder="Например: нужно сегодня до 17:00"
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                />
              </div>

              <button type="submit" className={orderStyles.submitBtn}>Оформить заказ</button>
              <p className={orderStyles.privacy}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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
