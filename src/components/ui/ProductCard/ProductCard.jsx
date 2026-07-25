import styles from './ProductCard.module.css'
import Button from '../Button/Button'

export default function ProductCard({ product, onOrder }) {
  const { name, price, image, inStock, category } = product

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={image || '/placeholder.webp'}
          alt={name}
          className={styles.image}
          loading="lazy"
          decoding="async"
        />
        {!inStock && <span className={styles.badge}>Под заказ</span>}
      </div>
      <div className={styles.body}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.footer}>
          <span className={styles.price}>
            {price ? `${price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
          </span>
          <Button onClick={() => onOrder?.(product)}>Заказать</Button>
        </div>
      </div>
    </article>
  )
}
