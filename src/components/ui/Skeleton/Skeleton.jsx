import styles from './Skeleton.module.css'

/** Базовый «костяк» с мягким shimmer. */
export function Skeleton({
  className = '',
  width,
  height,
  radius,
  circle = false,
  style,
  ...rest
}) {
  return (
    <span
      className={[styles.bone, circle ? styles.circle : '', className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        borderRadius: circle ? undefined : radius,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  )
}

/** Сетка карточек каталога. */
export function CatalogProductsSkeleton({ count = 8 }) {
  return (
    <div
      className={styles.catalogGrid}
      role="status"
      aria-busy="true"
      aria-label="Загрузка каталога"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.catalogCard}>
          <Skeleton className={styles.catalogImg} />
          <div className={styles.catalogBody}>
            <Skeleton className={styles.line} width="78%" height={14} />
            <Skeleton className={styles.line} width="92%" height={12} />
            <Skeleton className={styles.line} width="55%" height={12} />
            <Skeleton className={styles.line} width="40%" height={16} style={{ marginTop: 8 }} />
            <Skeleton className={styles.catalogBtn} />
          </div>
        </div>
      ))}
      <span className={styles.srOnly}>Загрузка каталога…</span>
    </div>
  )
}

/** Страница товара. */
export function ProductPageSkeleton() {
  return (
    <div className={styles.productPage} role="status" aria-busy="true" aria-label="Загрузка товара">
      <div className={styles.productContainer}>
        <Skeleton className={styles.breadcrumb} width={220} height={14} />
        <div className={styles.productGrid}>
          <Skeleton className={styles.productPhoto} />
          <div className={styles.productInfo}>
            <Skeleton className={styles.line} width="40%" height={14} />
            <Skeleton className={styles.line} width="90%" height={28} style={{ marginTop: 12 }} />
            <Skeleton className={styles.line} width="100%" height={14} style={{ marginTop: 16 }} />
            <Skeleton className={styles.line} width="85%" height={14} />
            <Skeleton className={styles.line} width="70%" height={14} />
            <div className={styles.specsRow}>
              <Skeleton className={styles.spec} />
              <Skeleton className={styles.spec} />
              <Skeleton className={styles.spec} />
            </div>
            <Skeleton className={styles.line} width="35%" height={32} style={{ marginTop: 20 }} />
            <Skeleton className={styles.productBtn} />
          </div>
        </div>
        <Skeleton className={styles.variants} />
        <div className={styles.related}>
          <Skeleton className={styles.line} width={200} height={20} />
          <div className={styles.relatedRow}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.relatedCard}>
                <Skeleton className={styles.relatedImg} />
                <Skeleton className={styles.line} width="80%" height={12} />
                <Skeleton className={styles.line} width="55%" height={12} />
                <Skeleton className={styles.relatedBtn} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className={styles.srOnly}>Загрузка товара…</span>
    </div>
  )
}

/** Статус заказа. */
export function OrderStatusSkeleton() {
  return (
    <div className={styles.orderCard} role="status" aria-busy="true" aria-label="Загрузка заказа">
      <Skeleton className={styles.line} width="45%" height={16} />
      <Skeleton className={styles.line} width="55%" height={16} />
      <Skeleton className={styles.line} width="35%" height={16} />
      <Skeleton className={styles.line} width="40%" height={20} style={{ marginTop: 8 }} />
      <div className={styles.orderLines}>
        <Skeleton className={styles.line} width="100%" height={14} />
        <Skeleton className={styles.line} width="90%" height={14} />
        <Skeleton className={styles.line} width="80%" height={14} />
      </div>
      <span className={styles.srOnly}>Загрузка заказа…</span>
    </div>
  )
}

/** Список в кабинете (заказы / избранное). */
export function AuthListSkeleton({ rows = 4 }) {
  return (
    <div className={styles.authList} role="status" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.authRow}>
          <Skeleton className={styles.line} width="68%" height={14} />
          <Skeleton className={styles.line} width="22%" height={14} />
        </div>
      ))}
      <span className={styles.srOnly}>Загрузка…</span>
    </div>
  )
}

/** Блок менеджера / короткий профиль. */
export function AuthProfileSkeleton() {
  return (
    <div className={styles.authProfile} role="status" aria-busy="true" aria-label="Загрузка">
      <Skeleton className={styles.line} width="50%" height={16} />
      <Skeleton className={styles.line} width="40%" height={14} />
      <Skeleton className={styles.line} width="60%" height={14} />
      <span className={styles.srOnly}>Загрузка…</span>
    </div>
  )
}

/** Строки корзины при синхронизации. */
export function CartItemsSkeleton({ rows = 3 }) {
  return (
    <div className={styles.cartList} role="status" aria-busy="true" aria-label="Загрузка корзины">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.cartItem}>
          <Skeleton className={styles.cartPhoto} />
          <div className={styles.cartInfo}>
            <Skeleton className={styles.line} width="85%" height={14} />
            <Skeleton className={styles.line} width="45%" height={12} />
            <Skeleton className={styles.line} width="30%" height={14} />
          </div>
        </div>
      ))}
      <span className={styles.srOnly}>Загрузка корзины…</span>
    </div>
  )
}
