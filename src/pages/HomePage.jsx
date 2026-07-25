import { Link } from 'react-router-dom'
import { Clock, Truck, Package, ArrowRight } from 'lucide-react'
import styles from './HomePage.module.css'

const CATEGORIES = [
  { slug: 'plastiny',  name: 'Пластины',        desc: 'Для фиксации переломов длинных и плоских костей', count: 127 },
  { slug: 'vinty',     name: 'Винты',            desc: 'Для остеосинтеза и фиксации пластин',             count: 82  },
  { slug: 'instrumenty', name: 'Инструменты',   desc: 'Специализированные инструменты для операций',      count: 31  },
  { slug: 'shvovny',  name: 'Шовный материал',   desc: 'Для мягкотканых и кожных швов',                  count: 58  },
  { slug: 'nabory',   name: 'Наборы',             desc: 'Готовые наборы для остеосинтеза',                count: 16  },
]

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CatalogSection />
      <CtaSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            ИМПЛАНТЫ для остеосинтеза — со склада в Воронеже за 2 часа
          </h1>
          <p className={styles.heroDesc}>
            По Воронежу — доставка за 2–4 часа.<br />
            В другие города ЦЧР — на следующий день при заявке до 14:00.<br />
            Работаем в выходные и праздники.
          </p>
          <Link to="/catalog" className={styles.heroBtn}>
            Проверить наличие <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
        <div className={styles.heroRight}>
          <img
            src="/images/cat-hero.png"
            alt="Кот KOSTO VET с имплантами"
            className={styles.heroCat}
          />
        </div>
      </div>

      <div className={styles.benefits}>
        <div className={styles.benefit}>
          <Clock size={24} strokeWidth={1.5} className={styles.benefitIcon} />
          <div>
            <p className={styles.benefitTitle}>2–4 часа</p>
            <p className={styles.benefitDesc}>Доставка по Воронежу</p>
          </div>
        </div>
        <div className={styles.sep} />
        <div className={styles.benefit}>
          <Truck size={24} strokeWidth={1.5} className={styles.benefitIcon} />
          <div>
            <p className={styles.benefitTitle}>Следующий день</p>
            <p className={styles.benefitDesc}>Доставка в другие города ЦЧР</p>
          </div>
        </div>
        <div className={styles.sep} />
        <div className={styles.benefit}>
          <Package size={24} strokeWidth={1.5} className={styles.benefitIcon} />
          <div>
            <p className={styles.benefitTitle}>Остаток в реальном времени</p>
            <p className={styles.benefitDesc}>Вы видите, что товар точно есть, до оформления заказа.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CatalogSection() {
  return (
    <section className={styles.catalog}>
      <div className={styles.catalogInner}>
        <div className={styles.catalogLeft}>
          <img
            src="/images/cat-catalog.png"
            alt=""
            className={styles.catalogCat}
            aria-hidden="true"
          />
        </div>
        <div className={styles.catalogRight}>
          <h2 className={styles.catalogTitle}>Каталог продукции</h2>
          <p className={styles.catalogSub}>Всё необходимое для остеосинтеза животных</p>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} to={`/catalog/${cat.slug}`} className={styles.categoryCard}>
                <div>
                  <p className={styles.categoryName}>{cat.name}</p>
                  <p className={styles.categoryDesc}>{cat.desc}</p>
                  <p className={styles.categoryCount}>{cat.count} товара</p>
                </div>
                <div className={styles.categoryArrow}>
                  <ArrowRight size={18} strokeWidth={2} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.stockBanner}>
        <Package size={20} strokeWidth={1.5} className={styles.stockIcon} />
        <p>
          <strong>Остаток в реальном времени</strong> — Вы видите, что товар точно есть, до оформления заказа
        </p>
        <Link to="/about" className={styles.stockLink}>Как это работает? →</Link>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <div className={styles.ctaLeft}>
          <h2 className={styles.ctaTitle}>
            Когда счёт идёт на часы — нужный имплант уже должен быть на складе
          </h2>
          <p className={styles.ctaDesc}>
            Проверьте наличие прямо сейчас и получите доставку в кратчайшие сроки.
          </p>
          <Link to="/catalog" className={styles.heroBtn}>
            Проверить наличие <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
        <div className={styles.ctaRight}>
          <img
            src="/images/cat-cta.png"
            alt=""
            className={styles.ctaCat}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
