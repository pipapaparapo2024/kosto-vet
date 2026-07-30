import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../../context/CartContext'
import { formatMoney, productImageUrl, stockLabel } from '../../../lib/money'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const {
    open, setOpen, items, subtotal, delivery, total, hasConflicts,
    count, busy, error, setQuantity, removeItem, mode,
  } = useCart()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setOpen])

  if (!open) return null

  return (
    <>
      <div className={styles.overlay} onClick={() => setOpen(false)} />
      <aside className={styles.drawer} role="dialog" aria-label="Корзина">
        <div className={styles.head}>
          <h2 className={styles.title}>Корзина{count ? ` · ${count}` : ''}</h2>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Закрыть">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {hasConflicts && (
          <p className={styles.warn}>В корзине есть конфликты по наличию или цене. Проверьте позиции перед оплатой.</p>
        )}
        {mode === 'guest' && (
          <p className={styles.hint}>Гостевая корзина. После входа позиции синхронизируются с аккаунтом.</p>
        )}

        <div className={styles.body}>
          {!items.length && <p className={styles.empty}>Корзина пуста</p>}
          {items.map(item => {
            const product = item.product
            const img = productImageUrl(product?.image, 'thumb')
            const itemKey = item._guest ? item.product?.id : item.id
            return (
              <div key={itemKey} className={styles.item}>
                <div className={styles.photo}>
                  {img && <img src={img} alt="" />}
                </div>
                <div className={styles.info}>
                  <Link
                    to={`/catalog/${product?.category_slug}/${product?.slug}`}
                    className={styles.name}
                    onClick={() => setOpen(false)}
                  >
                    {product?.name}
                  </Link>
                  {product?.article && <p className={styles.meta}>Арт. {product.article}</p>}
                  <p className={styles.meta}>{stockLabel(item.stock || product?.stock)}</p>
                  {item.conflict && <p className={styles.conflict}>{item.conflict}</p>}
                  <div className={styles.row}>
                    <div className={styles.qty}>
                      <button
                        type="button"
                        disabled={busy || item.quantity <= 1}
                        onClick={() => setQuantity(itemKey, item.quantity - 1)}
                        aria-label="Меньше"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setQuantity(itemKey, item.quantity + 1)}
                        aria-label="Больше"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className={styles.price}>{formatMoney(item.line_total || item.unit_price)}</span>
                    <button
                      type="button"
                      className={styles.remove}
                      disabled={busy}
                      onClick={() => removeItem(itemKey)}
                      aria-label="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totals}>
              <div><span>Товары</span><span>{formatMoney(subtotal)}</span></div>
              {delivery && <div><span>Доставка</span><span>{formatMoney(delivery)}</span></div>}
              <div className={styles.total}><span>Итого</span><span>{formatMoney(total)}</span></div>
            </div>
            <Link
              to="/checkout"
              className={styles.checkoutBtn}
              onClick={() => setOpen(false)}
            >
              Оформить заказ
            </Link>
            <p className={styles.footerNote}>B2B-заявку без оплаты можно отправить со страницы товара.</p>
          </div>
        )}
      </aside>
    </>
  )
}
