import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, Truck, Phone, ArrowRight, Clock, Package, User, X, MapPin, Shield } from 'lucide-react'
import { getProduct } from '../lib/api/catalog'
import { createLead, createStockSubscription } from '../lib/api/leads'
import { addFavorite, removeFavorite, listFavorites } from '../lib/api/account'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney, isInStock, stockLabel, productImageUrl } from '../lib/money'
import { categoryTitleFromProduct } from '../lib/labels'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ProductPageSkeleton } from '../components/ui/Skeleton/Skeleton'
import styles from './ProductPage.module.css'
import orderStyles from './OrderDrawer.module.css'

function parseDim(dim) {
  if (!dim) return { length: null, width: null }
  const [length, width] = String(dim).split('/')
  return {
    length: length?.replace(/[^\d,.]/g, '').trim() || null,
    width: width?.replace(/[^\d,.]/g, '').trim() || null,
  }
}

export default function ProductPage() {
  const { id } = useParams()
  const { isAuth } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderOpen, setOrderOpen] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [favBusy, setFavBusy] = useState(false)
  const [selectedLength, setSelectedLength] = useState(null)
  const [selectedHoles, setSelectedHoles] = useState(null)
  const [selectedWidth, setSelectedWidth] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getProduct(id)
      .then(data => { if (!cancelled) setProduct(data) })
      .catch(e => { if (!cancelled) { setProduct(null); setError(e.message) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!isAuth || !product?.id) {
      setFavorited(false)
      return
    }
    listFavorites()
      .then(res => setFavorited((res.items || []).some(f => f.product?.id === product.id)))
      .catch(() => {})
  }, [isAuth, product?.id])

  const variantOptions = useMemo(() => {
    const variants = product?.variants || []
    const lengths = new Set()
    const holes = new Set()
    const widths = new Set()
    variants.forEach(v => {
      const { length, width } = parseDim(v.dimensions)
      if (length) lengths.add(length)
      if (width) widths.add(width)
      if (v.holes != null) holes.add(String(v.holes))
    })
    if (!lengths.size) ['33', '47', '58', '70', '85'].forEach(v => lengths.add(v))
    if (!holes.size) ['4', '6', '8', '10'].forEach(v => holes.add(v))
    if (!widths.size) ['4.5', '6', '10'].forEach(v => widths.add(v))
    return {
      lengths: [...lengths],
      holes: [...holes],
      widths: [...widths],
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    const v = product.variants?.[0]
    const { length, width } = parseDim(v?.dimensions)
    setSelectedLength(length || variantOptions.lengths[2] || variantOptions.lengths[0] || null)
    setSelectedHoles(v?.holes != null ? String(v.holes) : (variantOptions.holes[1] || variantOptions.holes[0] || null))
    setSelectedWidth(width || variantOptions.widths[variantOptions.widths.length - 1] || null)
  }, [product, variantOptions])

  useDocumentTitle(
    product?.seo?.title || product?.name,
    product?.seo?.description || product?.description || product?.subtitle,
  )

  const toggleFavorite = async () => {
    if (!isAuth || !product || favBusy) return
    setFavBusy(true)
    try {
      if (favorited) {
        await removeFavorite(product.id)
        setFavorited(false)
      } else {
        await addFavorite(product.id)
        setFavorited(true)
      }
    } catch {
      // ignore
    } finally {
      setFavBusy(false)
    }
  }

  if (loading) {
    return <ProductPageSkeleton />
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.container}>
          <h1>Товар не найден</h1>
          <p>{error || 'Возможно, он был удалён или вы перешли по устаревшей ссылке.'}</p>
          <Link to="/catalog" className={styles.backLink}>
            <ArrowRight size={18} strokeWidth={2} className={styles.backArrow} aria-hidden="true" />
            Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  const inStock = isInStock(product.stock)
  const qty = product.stock?.quantity ?? (inStock ? 10 : 0)
  const mainImage = productImageUrl(product.image, 'detail') || productImageUrl(product.images?.[0], 'detail')
  const related = product.related || []
  const accessories = product.accessories?.length ? product.accessories : related.slice(0, 4)
  const similar = related

  const thicknessFromProduct = product.specs?.find(s => s.name === 'Толщина')
  const materialFromProduct = product.specs?.find(s => s.name === 'Материал')
  const activeVariant = (product.variants || []).find(v => {
    const { length, width } = parseDim(v.dimensions)
    return (
      (!selectedLength || length === selectedLength)
      && (!selectedHoles || String(v.holes) === String(selectedHoles))
      && (!selectedWidth || width === selectedWidth)
    )
  }) || (product.variants || []).find(v => {
    const { length } = parseDim(v.dimensions)
    return length === selectedLength
  })

  const displayArticle = activeVariant?.sku || product.article
  const displayPrice = activeVariant?.price != null
    ? { amount: Math.round(Number(activeVariant.price) * 100), currency: 'RUB' }
    : product.price

  const specs = [
    { name: 'Длина', value: selectedLength || '58', unit: 'мм' },
    { name: 'Кол-во отверстий', value: selectedHoles || '6', unit: '' },
    { name: 'Ширина', value: selectedWidth || '10', unit: 'мм' },
    {
      name: 'Толщина',
      value: activeVariant?.thickness || thicknessFromProduct?.value || '2,5',
      unit: 'мм',
    },
    {
      name: 'Материал',
      value: materialFromProduct?.value || product.material || 'Сплав титана',
      unit: '',
    },
  ]

  return (
    <>
      <div className={styles.page}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <Link to="/catalog">Каталог</Link><span>›</span>
            <Link to={`/catalog/${product.category_slug}`}>{categoryTitleFromProduct(product)}</Link><span>›</span>
            <span>{product.subtitle || product.name}</span>
          </nav>

          <div className={styles.grid}>
            <div className={styles.photoCol}>
              <div className={styles.mainPhoto}>
                {mainImage && (
                  <img
                    src={mainImage}
                    alt={product.image?.alt || product.name}
                    onError={e => { e.currentTarget.style.opacity = '0.3' }}
                  />
                )}
              </div>
            </div>

            <div className={styles.infoCol}>
              <div className={styles.stockRow}>
                <span className={inStock ? styles.inStock : styles.outOfStock}>
                  <span className={inStock ? styles.dot : styles.dotGrey} />
                  <span className={styles.stockText}>{stockLabel(product.stock, { withQuantity: false })}</span>
                  {inStock && <span className={styles.stockQty}>{qty} шт</span>}
                </span>
                {displayArticle && (
                  <span className={styles.article}>Артикул: {displayArticle}</span>
                )}
              </div>

              <h1 className={styles.name}>{product.name}</h1>
              <p className={styles.desc}>{product.description || product.subtitle}</p>

              <div className={styles.specs}>
                {specs.map(spec => (
                  <div key={spec.name} className={styles.spec}>
                    <span className={styles.specVal}>
                      {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                    <span className={styles.specLabel}>{spec.name}</span>
                  </div>
                ))}
              </div>

              <p className={styles.price}>{formatMoney(displayPrice)}</p>

              <p className={styles.deliveryNote}>
                <Truck size={25} strokeWidth={1.8} aria-hidden="true" />
                Доставим по Воронежу сегодня за 2–4 часа.
              </p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() => setOrderOpen(true)}
                >
                  <span>Заказать</span>
                  <ArrowRight size={22} strokeWidth={1.8} />
                </button>
                {isAuth && (
                  <button
                    type="button"
                    className={styles.favBtn}
                    onClick={toggleFavorite}
                    disabled={favBusy}
                    aria-label="Избранное"
                  >
                    <Heart size={20} fill={favorited ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>

              <a href="tel:+79611898933" className={styles.phoneLink}>
                <Phone size={25} strokeWidth={1.8} aria-hidden="true" />
                +7 (961) 189-89-33
              </a>
            </div>
          </div>

          <section className={styles.variants}>
            <p className={styles.variantsTitle}>Выберите вариант</p>
            <div className={styles.variantGroup}>
              <span className={styles.variantLabel}>Длина</span>
              <div className={`${styles.variantOptions} ${styles.variantOptionsRow}`}>
                {variantOptions.lengths.map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.variantOption} ${selectedLength === v ? styles.variantSelected : ''}`}
                    onClick={() => setSelectedLength(v)}
                  >
                    {v} мм
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.variantGroup}>
              <span className={styles.variantLabel}>Кол-во отверстий</span>
              <div className={`${styles.variantOptions} ${styles.variantOptionsGrid}`}>
                {variantOptions.holes.map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.variantOption} ${styles.variantOptionSquare} ${selectedHoles === v ? styles.variantSelected : ''}`}
                    onClick={() => setSelectedHoles(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.variantGroup}>
              <span className={styles.variantLabel}>Ширина</span>
              <div className={`${styles.variantOptions} ${styles.variantOptionsGrid}`}>
                {variantOptions.widths.map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.variantOption} ${styles.variantOptionSquare} ${selectedWidth === v ? styles.variantSelected : ''}`}
                    onClick={() => setSelectedWidth(v)}
                  >
                    {v} мм
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.benefits}>
            <div className={styles.benefit}>
              <Clock size={60} strokeWidth={1.5} aria-hidden="true" />
              <div className={styles.benefitCopy}>
                <p className={styles.benefitTitle}>Нужно сегодня?</p>
                <p className={styles.benefitDesc}>Оформите заказ до 18:00 — доставим по Воронежу за 2–4 часа</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <Package size={60} strokeWidth={1.5} aria-hidden="true" />
              <p className={styles.benefitText}>Актуальный остаток на складе</p>
            </div>
            <div className={styles.benefit}>
              <User size={60} strokeWidth={1.5} aria-hidden="true" />
              <p className={styles.benefitText}>Помощь с подбором от специалиста</p>
            </div>
          </section>

          <div className={styles.relatedRow}>
            {accessories.length > 0 && (
              <div className={styles.related}>
                <div className={styles.relatedHead}>
                  <p className={styles.relatedTitle}>Для установки этой пластины</p>
                  <Link to="/catalog/vinty" className={styles.relatedLink}>Смотреть всё <ArrowRight size={16} strokeWidth={1.8} /></Link>
                </div>
                <div className={styles.relatedScroll}>
                  {accessories.slice(0, 3).map(p => <SmallCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {similar.length > 0 && (
              <div className={styles.related}>
                <div className={styles.relatedHead}>
                  <p className={styles.relatedTitle}>Похожие пластины</p>
                  <Link to={`/catalog/${product.category_slug}`} className={styles.relatedLink}>Смотреть всё <ArrowRight size={16} strokeWidth={1.8} /></Link>
                </div>
                <div className={styles.relatedScroll}>
                  {similar.slice(0, 3).map(p => <SmallCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderDrawer
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
        inStock={inStock}
        meta={{
          length: selectedLength,
          holes: selectedHoles,
          article: displayArticle,
          price: displayPrice,
        }}
      />
    </>
  )
}

function getLengthLabel(product) {
  if (product.length_label) return product.length_label
  const lengthSpec = Array.isArray(product.specs)
    ? product.specs.find(s => /длин/i.test(s.name || ''))
    : null
  if (lengthSpec?.value != null && lengthSpec.value !== '') {
    return `Длина: ${lengthSpec.value}${lengthSpec.unit ? ` ${lengthSpec.unit}` : ''}`
  }
  return 'Длина: —'
}

function SmallCard({ product }) {
  const image = productImageUrl(product.image, 'thumb')
  const lengthLabel = getLengthLabel(product)

  return (
    <Link to={`/catalog/${product.category_slug}/${product.slug}`} className={styles.smallCard}>
      <div className={styles.smallCardImg}>
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : null}
        <span className={styles.smallCardImgLabel}>Фото товара</span>
      </div>
      <div className={styles.smallCardBody}>
        <p className={styles.smallCardName}>{product.subtitle || product.name}</p>
        <p className={styles.smallCardDesc}>{lengthLabel}</p>
        <p className={styles.smallCardPrice}>
          {product.price?.amount != null
            ? `от ${(product.price.amount / 100).toLocaleString('ru-RU')} ₽`
            : 'от · ₽'}
        </p>
        <span className={styles.smallCardBtn}>
          <span>Подробнее</span>
          <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

function OrderDrawer({ open, onClose, product, inStock, meta = {} }) {
  const { settings } = useSettings()
  const overlayRef = useRef(null)
  const [qty, setQty] = useState(1)
  const [delivery, setDelivery] = useState('voronezh')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    companyName: '',
    comment: '',
    website: '',
  })
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const deliveryOptions = [
    { value: 'voronezh', label: 'Доставка по Воронежу (2–4 часа)', Icon: Truck },
    { value: 'pickup', label: 'Самовывоз', Icon: MapPin },
    { value: 'russia', label: 'Доставка по России (1–3 дня)', Icon: Package },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) {
      setSubmitted(null)
      setError(null)
      setQty(1)
      setDelivery('voronezh')
    }
  }, [open, inStock])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const image = productImageUrl(product.image, 'thumb')
  const specsLine = [
    meta.length ? `${meta.length} мм` : null,
    meta.holes ? `${meta.holes} отверстий` : null,
  ].filter(Boolean).join(' · ')

  const deliveryLabel = deliveryOptions.find(o => o.value === delivery)?.label || delivery

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (!inStock) {
        await createStockSubscription({
          productSlug: product.slug,
          name: form.name,
          contact: form.phone,
          website: form.website,
        })
        setSubmitted({ type: 'notify' })
      } else {
        const message = [
          `Товар: ${product.name}`,
          meta.article ? `Артикул: ${meta.article}` : null,
          `Количество: ${qty}`,
          `Способ получения: ${deliveryLabel}`,
          form.comment ? `Комментарий: ${form.comment}` : null,
        ].filter(Boolean).join('\n')

        await createLead({
          name: form.name,
          phone: form.phone,
          company: form.companyName || undefined,
          message,
          productSlug: product.slug,
          source: 'product',
          website: form.website,
        })
        setSubmitted({ type: 'lead' })
      }
    } catch (err) {
      setError(err.message || 'Не удалось отправить заявку')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={orderStyles.overlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={orderStyles.drawer} role="dialog" aria-label="Ваш заказ">
        <div className={orderStyles.header}>
          <h2 className={orderStyles.title}>
            {inStock ? 'Ваш заказ' : 'Уведомить о наличии'}
          </h2>
          <button type="button" className={orderStyles.close} onClick={onClose} aria-label="Закрыть">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {submitted ? (
          <div className={orderStyles.success}>
            <h3>Заявка отправлена</h3>
            <p>
              {submitted.type === 'notify'
                ? 'Мы сообщим, когда товар появится на складе.'
                : 'Наш специалист свяжется с Вами в течение нескольких минут.'}
            </p>
            {settings?.manager?.phone && (
              <p>Менеджер: {settings.manager.name}, {settings.manager.phone}</p>
            )}
            <button type="button" className={orderStyles.submitBtn} onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <>
            <div className={orderStyles.productRow}>
              <div className={orderStyles.productPhoto}>
                {image ? (
                  <img src={image} alt="" />
                ) : (
                  'Фото товара'
                )}
              </div>
              <div className={orderStyles.productInfo}>
                <p className={orderStyles.productName}>{product.subtitle || product.name}</p>
                {specsLine && <p className={orderStyles.productMeta}>{specsLine}</p>}
                {(meta.article || product.article) && (
                  <p className={orderStyles.productArticle}>
                    Артикул: {meta.article || product.article}
                  </p>
                )}
                <p className={orderStyles.productPrice}>
                  {formatMoney(meta.price ?? product.price)}
                </p>
              </div>
            </div>

            <form className={orderStyles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className={orderStyles.honeypot}
              />

              {inStock && (
                <div className={orderStyles.section}>
                  <p className={orderStyles.label}>Количество</p>
                  <div className={orderStyles.qtyRow}>
                    <button
                      type="button"
                      className={orderStyles.qtyBtn}
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      aria-label="Уменьшить"
                    >
                      −
                    </button>
                    <span className={orderStyles.qtyVal}>{qty}</span>
                    <button
                      type="button"
                      className={orderStyles.qtyBtn}
                      onClick={() => setQty(q => q + 1)}
                      aria-label="Увеличить"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {inStock && (
                <div className={orderStyles.section}>
                  <p className={orderStyles.label}>Способ получения</p>
                  <div className={orderStyles.radioGroup}>
                    {deliveryOptions.map(({ value, label, Icon }) => (
                      <label key={value} className={orderStyles.radio}>
                        <input
                          type="radio"
                          name="delivery"
                          className={orderStyles.radioInput}
                          checked={delivery === value}
                          onChange={() => setDelivery(value)}
                        />
                        <span className={orderStyles.radioLabel}>{label}</span>
                        <Icon size={20} strokeWidth={1.6} className={orderStyles.radioIcon} aria-hidden="true" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className={orderStyles.section}>
                <p className={orderStyles.label}>Контактные данные</p>
                <div className={orderStyles.fieldsStack}>
                  <input
                    className={orderStyles.input}
                    type="text"
                    placeholder="Ваше имя*"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className={orderStyles.input}
                    type="tel"
                    placeholder="Телефон*"
                    required
                    minLength={7}
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                  {inStock && (
                    <input
                      className={orderStyles.input}
                      type="text"
                      placeholder="Клиника"
                      value={form.companyName}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {inStock && (
                <div className={`${orderStyles.section} ${orderStyles.sectionLast}`}>
                  <p className={orderStyles.label}>Комментарий к заказу</p>
                  <textarea
                    className={orderStyles.textarea}
                    placeholder="Например: нужно сегодня до 17:00"
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  />
                </div>
              )}

              {error && <p className={orderStyles.formError}>{error}</p>}

              <button type="submit" className={orderStyles.submitBtn} disabled={submitting}>
                {submitting
                  ? 'Отправка…'
                  : inStock
                    ? 'Оформить заказ'
                    : 'Сообщить о поступлении'}
              </button>

              <p className={orderStyles.privacy}>
                <Shield size={14} strokeWidth={1.6} className={orderStyles.privacyIcon} aria-hidden="true" />
                <span>Мы не передаём ваши данные третьим лицам</span>
              </p>

              <p className={orderStyles.callbackNote}>
                Наш специалист свяжется с Вами в течение нескольких минут.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
