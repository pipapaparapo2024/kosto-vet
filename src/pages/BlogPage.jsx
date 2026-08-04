import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { img } from '../utils/assetUrl'
import { ARTICLES, BLOG_TAGS } from '../data/blogArticles'
import styles from './BlogPage.module.css'

const PER_PAGE = 9

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('Все статьи')
  const [page, setPage] = useState(1)

  const filtered = activeTag === 'Все статьи' ? ARTICLES : ARTICLES.filter(a => a.tag === activeTag)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const scrollTop = () => {
    window.scrollTo(0, 0)
  }

  const goToPage = (next) => {
    setPage(next)
    scrollTop()
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <span>Блог</span>
          </nav>
          <h1 className={styles.heroTitle}>Полезные материалы для ветеринарных хирургов</h1>
          <p className={styles.heroDesc}>Практические статьи, обзоры и рекомендации по остеосинтезу, имплантам и работе ветеринарных клиник.</p>
        </div>
        <img src={img('images/blog-hero.png')} alt="" className={styles.heroImg} aria-hidden="true" />
      </div>

      <div className={styles.container}>
        <div className={styles.tags}>
          {BLOG_TAGS.map(t => (
            <button
              key={t}
              className={`${styles.tag} ${activeTag === t ? styles.tagActive : ''}`}
              onClick={() => { setActiveTag(t); setPage(1); scrollTop() }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {visible.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <div className={styles.pageNums}>
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className={styles.pageBtn}
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            aria-label="Следующая страница"
          >
            <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ArticleCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`} className={styles.card}>
      <div className={styles.cardPhoto}>
        {article.coverImage ? (
          <img src={img(article.coverImage)} alt="" loading="lazy" />
        ) : null}
        <span className={styles.cardTag}>{article.tag}</span>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{article.title}</p>
        <p className={styles.cardDesc}>{article.desc}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}>
            <Calendar size={14} strokeWidth={1.6} aria-hidden="true" />
            {article.date}
          </span>
          <span className={styles.cardMetaItem}>
            <Clock size={14} strokeWidth={1.6} aria-hidden="true" />
            {article.read}
          </span>
        </div>
      </div>
    </Link>
  )
}
