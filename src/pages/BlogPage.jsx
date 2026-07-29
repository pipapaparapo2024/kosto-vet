import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { img } from '../utils/assetUrl'
import styles from './BlogPage.module.css'

const TAGS = ['Все статьи', 'Остеосинтез', 'Импланты', 'Инструменты', 'Клинические случаи', 'Уход и реабилитация']

const ARTICLES = [
  { slug: 'kak-vybrat-plastinu',    tag: 'Остеосинтез',        title: 'Как выбрать пластину для остеосинтеза у собак и кошек',       desc: 'Разбираем основные типы пластин, материалы, формы и критерии выбора для разных случаев.',              date: '17 июля 2026',      read: '7 мин. чтения' },
  { slug: 'vinty-dlya-osteosinteza', tag: 'Импланты',           title: 'Винты для остеосинтеза: основные правила подбора',             desc: 'Диаметр, длина, тип резьбы и материал — что важно учитывать при выборе винтов.',                      date: '28 июня 2026',      read: '10 мин. чтения' },
  { slug: 'klinicheskiy-sluchay',    tag: 'Клинические случаи', title: 'Клинический случай: сложный перелом большеберцовой кости',     desc: 'Подробный разбор операции с использованием Т-образной блокирующей пластины.',                          date: '01 августа 2026',   read: '3 мин. чтения' },
  { slug: 'instrumenty-osnovy',      tag: 'Инструменты',        title: 'Базовый набор инструментов для остеосинтеза',                  desc: 'Что должно быть в операционной — свёрла, развёртки, ключи и отвёртки для пластин.',                   date: '14 августа 2026',   read: '4 мин. чтения' },
  { slug: 'reabilitaciya',           tag: 'Уход и реабилитация', title: 'Послеоперационная реабилитация после остеосинтеза',           desc: 'Контроль нагрузки, физиотерапия, повторные снимки — схема восстановления.',                            date: '5 сентября 2026',   read: '6 мин. чтения' },
  { slug: 'kostnyy-metall',          tag: 'Остеосинтез',        title: 'Когда нужно удалять металлоконструкции после сращения',        desc: 'Показания, сроки и техника удаления пластин и винтов после успешного остеосинтеза.',                   date: '20 сентября 2026',  read: '5 мин. чтения' },
  { slug: 'vinty-2',                 tag: 'Импланты',           title: 'Кортикальные vs губчатые винты: в чём разница',               desc: 'Объясняем разницу в конструкции, показаниях и технике введения.',                                     date: '3 октября 2026',    read: '4 мин. чтения' },
  { slug: 'sluchay-2',              tag: 'Клинические случаи', title: 'Перелом бедра у кошки: разбор сложного случая',               desc: 'Применение угловых пластин и техника интраоперационного позиционирования.',                            date: '15 октября 2026',   read: '3 мин. чтения' },
  { slug: 'shovny',                  tag: 'Инструменты',        title: 'Шовный материал для мягких тканей: виды и выбор',             desc: 'Рассасывающийся и нерассасывающийся шовный материал — где и когда применять.',                         date: '28 октября 2026',   read: '5 мин. чтения' },
]

const PER_PAGE = 9

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('Все статьи')
  const [page, setPage] = useState(1)

  const filtered = activeTag === 'Все статьи' ? ARTICLES : ARTICLES.filter(a => a.tag === activeTag)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className={styles.page}>
      {/* Hero — breadcrumb внутри, чтобы картинка выровнялась по верху */}
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
        {/* Теги */}
        <div className={styles.tags}>
          {TAGS.map(t => (
            <button
              key={t}
              className={`${styles.tag} ${activeTag === t ? styles.tagActive : ''}`}
              onClick={() => { setActiveTag(t); setPage(1) }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Сетка статей */}
        <div className={styles.grid}>
          {visible.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* Пагинация */}
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
            <ChevronRight size={16} strokeWidth={2} />
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
        <span className={styles.cardTag}>{article.tag}</span>
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{article.title}</h2>
        <p className={styles.cardDesc}>{article.desc}</p>
        <div className={styles.cardMeta}>
          <span className={styles.cardMetaItem}><Calendar size={14} strokeWidth={1.8} />{article.date}</span>
          <span className={styles.cardMetaItem}><Clock size={14} strokeWidth={1.8} />{article.read}</span>
        </div>
      </div>
    </Link>
  )
}
