import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, Truck, Phone, ArrowRight, Clock, Package, User } from 'lucide-react'
import { getProduct } from '../lib/api/catalog'
import { createQuoteOrder, saveOrderAccess } from '../lib/api/orders'
import { createLead, createStockSubscription } from '../lib/api/leads'
import { addFavorite, removeFavorite, listFavorites } from '../lib/api/account'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { formatMoney, isInStock, stockLabel, productImageUrl } from '../lib/money'
import { categoryTitleFromProduct, orderStatusLabel } from '../lib/labels'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
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
    return (
      <div className={styles.notFound}>
        <div className={styles.container}><p>Загрузка товара…</p></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.container}>
          <h1>Товар не найден</h1>
          <p>{error || 'Возможно, он был удалён или вы перешли по устаревшей ссылке.'}</p>
          <Link to="/catalog" className={styles.backLink}>← Вернуться в каталог</Link>
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
                  <span className={styles.stockText}>{stockLabel(product.stock)}</span>
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
              <Clock size={40} strokeWidth={1.5} aria-hidden="true" />
              <p className={styles.benefitText}>Нужно сегодня? Оформите заказ до 18:00 — доставим по Воронежу за 2–4 часа</p>
            </div>
            <div className={styles.benefit}>
              <Package size={40} strokeWidth={1.5} aria-hidden="true" />
              <p className={styles.benefitText}>Актуальный остаток на складе</p>
            </div>
            <div className={styles.benefit}>
              <User size={40} strokeWidth={1.5} aria-hidden="true" />
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
      />
    </>
  )
}

function SmallCard({ product }) {
  const image = productImageUrl(product.image, 'thumb')
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
        <p className={styles.smallCardDesc}>
          {product.article ? product.article : 'Длина: 6–22 мм'}
        </p>
        <p className={styles.smallCardPrice}>
          {product.price?.amount != null
            ? `от ${(product.price.amount / 100).toLocaleString('ru-RU')} ₽`
            : 'от · ₽'}
        </p>
        <span className={styles.smallCardBtn}>Подробнее <ArrowRight size={14} strokeWidth={1.8} /></span>
      </div>
    </Link>
  )
}

function OrderDrawer({ open, onClose, product, inStock }) {
  const { settings } = useSettings()
  const overlayRef = useRef(null)
  const [mode, setMode] = useState(inStock ? 'quote' : 'notify')
  const [qty, setQty] = useState(1)
  const [destination, setDestination] = useState('voronezh')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    inn: '',
    kpp: '',
    documentsEmail: '',
    city: 'Воронеж',
    addressLine: '',
    comment: '',
    contact: '',
    consent: false,
    website: '',
  })
  const [submitted, setSubmitted] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (open) {
      setMode(inStock ? 'quote' : 'notify')
      setSubmitted(null)
      setError(null)
    }
  }, [open, inStock])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const image = productImageUrl(product.image, 'thumb')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.consent || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'notify') {
        await createStockSubscription({
          productSlug: product.slug,
          name: form.name,
          contact: form.contact || form.phone || form.email,
          website: form.website,
        })
        setSubmitted({ type: 'notify' })
      } else if (mode === 'lead') {
        await createLead({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          company: form.companyName || undefined,
          message: form.comment || undefined,
          productSlug: product.slug,
          source: 'product',
          website: form.website,
        })
        setSubmitted({ type: 'lead' })
      } else {
        const res = await createQuoteOrder({
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email || undefined,
          },
          legal_entity: {
            company_name: form.companyName,
            inn: form.inn,
            kpp: form.kpp || undefined,
            documents_email: form.documentsEmail || form.email,
          },
          delivery: {
            destination,
            city: form.city,
            address_line: form.addressLine,
            comment: form.comment || null,
          },
          items: [{ product_id: product.id, quantity: qty }],
          comment: form.comment || undefined,
          consent: true,
          website: form.website,
        })
        if (res?.public_id && res?.order_access_token) {
          saveOrderAccess(res.public_id, res.order_access_token)
        }
        setSubmitted({ type: 'quote', publicId: res.public_id, status: res.status })
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
      <div className={orderStyles.drawer}>
        <div className={orderStyles.header}>
          <h2 className={orderStyles.title}>
            {mode === 'notify' ? 'Уведомить о наличии' : mode === 'lead' ? 'Заявка' : 'Заявка для клиник'}
          </h2>
          <button type="button" className={orderStyles.close} onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        {submitted ? (
          <div className={orderStyles.success}>
            <h3>{submitted.type === 'quote' ? 'Заявка принята' : 'Запрос отправлен'}</h3>
            <p>
              {submitted.type === 'quote'
                ? `Номер: ${submitted.publicId}. Статус: ${orderStatusLabel(submitted.status)}. Менеджер свяжется с вами.`
                : 'Мы сохранили запрос. Когда товар появится или менеджер обработает заявку — свяжемся с вами.'}
            </p>
            {submitted.type === 'quote' && submitted.publicId && (
              <Link to={`/orders/${submitted.publicId}`} className={orderStyles.submitBtn} onClick={onClose} style={{ display: 'inline-flex', textDecoration: 'none', marginBottom: 8 }}>
                Статус заказа
              </Link>
            )}
            {settings?.manager?.phone && (
              <p>Менеджер: {settings.manager.name}, {settings.manager.phone}</p>
            )}
            <button type="button" className={orderStyles.submitBtn} onClick={onClose}>Закрыть</button>
          </div>
        ) : (
          <>
            <div className={orderStyles.productRow}>
              <div className={orderStyles.productPhoto}>
                {image && <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />}
              </div>
              <div className={orderStyles.productInfo}>
                <p className={orderStyles.productName}>{product.name}</p>
                {product.article && <p className={orderStyles.productArticle}>Артикул: {product.article}</p>}
              </div>
              <p className={orderStyles.productPrice}>{formatMoney(product.price)}</p>
            </div>

            <div className={orderStyles.radioGroup} style={{ padding: '0 24px', marginBottom: 8 }}>
              {inStock && (
                <label className={`${orderStyles.radio} ${mode === 'quote' ? orderStyles.radioActive : ''}`}>
                  <input type="radio" checked={mode === 'quote'} onChange={() => setMode('quote')} />
                  <span>Оформить заявку для клиники</span>
                </label>
              )}
              <label className={`${orderStyles.radio} ${mode === 'lead' ? orderStyles.radioActive : ''}`}>
                <input type="radio" checked={mode === 'lead'} onChange={() => setMode('lead')} />
                <span>Перезвоните мне</span>
              </label>
              {!inStock && (
                <label className={`${orderStyles.radio} ${mode === 'notify' ? orderStyles.radioActive : ''}`}>
                  <input type="radio" checked={mode === 'notify'} onChange={() => setMode('notify')} />
                  <span>Сообщить о поступлении</span>
                </label>
              )}
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
                style={{ position: 'absolute', left: -9999, opacity: 0, height: 0, width: 0 }}
              />

              {mode === 'quote' && (
                <div className={orderStyles.field}>
                  <label className={orderStyles.label}>Количество</label>
                  <div className={orderStyles.qtyRow}>
                    <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                    <span className={orderStyles.qtyVal}>{qty}</span>
                    <button type="button" className={orderStyles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </div>
              )}

              {mode === 'quote' && (
                <div className={orderStyles.field}>
                  <label className={orderStyles.label}>Доставка</label>
                  <div className={orderStyles.radioGroup}>
                    {[
                      { value: 'voronezh', label: 'По Воронежу' },
                      { value: 'intercity', label: 'В другой город' },
                    ].map(opt => (
                      <label key={opt.value} className={`${orderStyles.radio} ${destination === opt.value ? orderStyles.radioActive : ''}`}>
                        <input type="radio" name="destination" value={opt.value} checked={destination === opt.value} onChange={() => setDestination(opt.value)} />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className={orderStyles.field}>
                <label className={orderStyles.label}>Контактные данные</label>
                <input className={orderStyles.input} type="text" placeholder="Ваше имя*" required minLength={2} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                {mode !== 'notify' && (
                  <input className={orderStyles.input} type="tel" placeholder="Телефон*" required minLength={7} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                )}
                {mode === 'notify' && (
                  <input className={orderStyles.input} type="text" placeholder="Телефон или email*" required minLength={7} value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
                )}
                {mode !== 'notify' && (
                  <input className={orderStyles.input} type="email" placeholder={mode === 'quote' ? 'Эл. почта для документов*' : 'Эл. почта'} required={mode === 'quote'} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value, documentsEmail: e.target.value }))} />
                )}
              </div>

              {mode === 'quote' && (
                <div className={orderStyles.field}>
                  <label className={orderStyles.label}>Юрлицо</label>
                  <input className={orderStyles.input} type="text" placeholder="Название клиники / компании*" required minLength={2} value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
                  <input className={orderStyles.input} type="text" placeholder="ИНН*" required minLength={10} maxLength={12} value={form.inn} onChange={e => setForm(f => ({ ...f, inn: e.target.value }))} />
                  <input className={orderStyles.input} type="text" placeholder="КПП" maxLength={9} value={form.kpp} onChange={e => setForm(f => ({ ...f, kpp: e.target.value }))} />
                  <input className={orderStyles.input} type="text" placeholder="Город*" required minLength={2} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  <input className={orderStyles.input} type="text" placeholder="Адрес доставки*" required minLength={5} value={form.addressLine} onChange={e => setForm(f => ({ ...f, addressLine: e.target.value }))} />
                </div>
              )}

              {mode !== 'notify' && (
                <div className={orderStyles.field}>
                  <label className={orderStyles.label}>Комментарий</label>
                  <textarea className={orderStyles.textarea} placeholder="Например: нужно сегодня до 17:00" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
                </div>
              )}

              <label className={orderStyles.privacy} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} required />
                <span>Согласен на обработку персональных данных</span>
              </label>

              {error && <p style={{ color: '#eb5757', fontSize: 13 }}>{error}</p>}

              <button type="submit" className={orderStyles.submitBtn} disabled={!form.consent || submitting}>
                {submitting ? 'Отправка…' : mode === 'quote' ? 'Отправить заявку' : 'Отправить'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
