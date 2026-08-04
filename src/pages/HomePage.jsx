import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Truck, Package, ArrowRight } from 'lucide-react'
import { listCategories } from '../lib/api/catalog'
import { img } from '../utils/assetUrl'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './HomePage.module.css'

const FALLBACK_CATEGORIES = [
  { slug: 'plastiny', title: 'Пластины', description: 'Для фиксации переломов длинных и плоских костей', subtree_product_count: null },
  { slug: 'vinty', title: 'Винты', description: 'Для остеосинтеза и фиксации пластин', subtree_product_count: null },
  { slug: 'instrumenty', title: 'Инструменты', description: 'Специализированные инструменты для операций', subtree_product_count: null },
  { slug: 'shvovny', title: 'Шовный материал', description: 'Для мягкотканых и кожных швов', subtree_product_count: null },
  { slug: 'nabory', title: 'Наборы', description: 'Готовые наборы для остеосинтеза', subtree_product_count: null },
]

export default function HomePage() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  useDocumentTitle('Импланты для остеосинтеза', 'Ветеринарные импланты со склада в Воронеже. Доставка за 2–4 часа.')

  useEffect(() => {
    listCategories()
      .then(res => {
        if (!res.items?.length) return
        const bySlug = Object.fromEntries(FALLBACK_CATEGORIES.map(c => [c.slug, c]))
        setCategories(
          res.items.map(c => ({
            ...c,
            description: c.description || bySlug[c.slug]?.description || '',
          })),
        )
      })
      .catch(() => {})
  }, [])

  const featured = categories[0]
  const rest = categories.slice(1, 5)

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>ИМПЛАНТЫ для остеосинтеза — со склада в Воронеже за 2 часа</h1>
            <p className={styles.heroDesc}>
              По Воронежу — доставка за 2–4 часа.<br/>
              В другие города ЦЧР — на следующий день при заявке до 14:00.<br/>
              Работаем в выходные и праздники.
            </p>
            <Link to="/catalog" className={styles.heroBtn}>
              Проверить наличие <ArrowRight size={20} strokeWidth={1.8} />
            </Link>
          </div>
          <div className={styles.heroRight}>
            <img src={img('images/cat-hero.png')} alt="Кот" className={styles.heroCat} />
          </div>
        </div>

        <div className={styles.benefits}>
          <div className={styles.benefitsInner}>
            <div className={styles.benefit}>
              <Clock size={58} strokeWidth={1.2} />
              <div>
                <p className={styles.benefitTitle}>2–4 часа</p>
                <p className={styles.benefitDesc}>Доставка по Воронежу</p>
              </div>
            </div>
            <div className={styles.sep} />
            <div className={styles.benefit}>
              <Truck size={58} strokeWidth={1.2} />
              <div>
                <p className={styles.benefitTitle}>Следующий день</p>
                <p className={styles.benefitDesc}>Доставка в другие города ЦЧР</p>
              </div>
            </div>
            <div className={styles.sep} />
            <div className={styles.benefit}>
              <Package size={58} strokeWidth={1.2} />
              <div>
                <p className={styles.benefitTitle}>Остаток в реальном времени</p>
                <p className={styles.benefitDesc}>Вы видите, что товар точно есть, до оформления заказа.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalog}>
        <div className={styles.catalogLayout}>
          <div className={styles.catalogLeft}>
            <img src={img('images/cat-catalog.png')} alt="" className={styles.catalogCat} aria-hidden="true" />
            {featured && (
              <Link to={`/catalog/${featured.slug}`} className={`${styles.categoryCard} ${styles.cardPlastiny}`}>
                <div>
                  <p className={styles.categoryName}>{featured.title}</p>
                  <p className={styles.categoryDesc}>{featured.description}</p>
                  {featured.subtree_product_count != null && (
                    <p className={styles.categoryCount}>{featured.subtree_product_count} товаров</p>
                  )}
                </div>
                <div className={styles.categoryArrow}><ArrowRight size={20} /></div>
              </Link>
            )}
          </div>

          <div className={styles.catalogRight}>
            <div className={styles.catalogTitleWrap}>
              <h2 className={styles.catalogTitle}>Каталог продукции</h2>
              <p className={styles.catalogSub}>Всё необходимое для остеосинтеза животных</p>
            </div>
            <div className={styles.catalogGrid}>
              {rest.map(cat => (
                <Link key={cat.slug} to={`/catalog/${cat.slug}`} className={`${styles.categoryCard} ${styles.cardSmall}`}>
                  <div>
                    <p className={styles.categoryName}>{cat.title}</p>
                    <p className={styles.categoryDesc}>{cat.description}</p>
                    {cat.subtree_product_count != null && (
                      <p className={styles.categoryCount}>{cat.subtree_product_count} товаров</p>
                    )}
                  </div>
                  <div className={styles.categoryArrow}><ArrowRight size={20} /></div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.stockBanner}>
          <span className={styles.stockIcon} aria-hidden="true">
            <Package size={36} strokeWidth={1.5} />
          </span>
          <p><strong>Остаток в реальном времени</strong> — Вы видите, что товар точно есть, до оформления заказа</p>
          <Link to="/about" className={styles.stockLink}>
            Как это работает?
            <ArrowRight size={20} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>Когда счет идет на часы — нужный имплант уже должен быть на складе</h2>
            <p className={styles.ctaDesc}>Проверьте наличие прямо сейчас и получите доставку в кратчайшие сроки.</p>
            <Link to="/catalog" className={styles.ctaBtn}>
              Проверить наличие <ArrowRight size={20} />
            </Link>
          </div>
          <div className={styles.ctaRight}>
            <img src={img('images/cat-cta.png')} alt="" className={styles.ctaCat} aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
