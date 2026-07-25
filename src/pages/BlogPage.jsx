import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './BlogPage.module.css'

const TAGS = ['Все статьи', 'Остеосинтез', 'Импланты', 'Инструменты', 'Клинические случаи', 'Уход и реабилитация']

const ARTICLES = [
  { slug: 'kak-vybrat-plastinu', tag: 'Остеосинтез', title: 'Как выбрать пластину для остеосинтеза у собак и кошек', desc: 'Разбираем основные типы пластин, материалы, формы и критерии выбора для разных случаев.', date: '17 июля 2025', read: '7 мин. чтения' },
  { slug: 'vinty-dlya-osteosinteza', tag: 'Импланты', title: 'Винты для остеосинтеза: основные правила подбора', desc: 'Диаметр, длина, тип резьбы — как подобрать нужный вариант. Разбираем параметры с примерами из практики.', date: '26 июня 2025', read: '5 мин. чтения' },
  { slug: 'klinicheskiy-sluchay', tag: 'Клинические случаи', title: 'Клинический случай: сложный перелом большеберцовой кости у собаки', desc: 'Подробный разбор операции с использованием Т-образной блокирующей пластины.', date: '31 августа 2025', read: '3 мин. чтения' },
  { slug: 'instrumenty-osnovy', tag: 'Инструменты', title: 'Базовый набор инструментов для остеосинтеза', desc: 'Что должно быть в операционной — свёрла, развёртки, ключи и отвёртки для пластин.', date: '14 августа 2025', read: '4 мин. чтения' },
  { slug: 'reabilitaciya', tag: 'Уход и реабилитация', title: 'Послеоперационная реабилитация после остеосинтеза', desc: 'Контроль нагрузки, физиотерапия, повторные снимки — схема восстановления.', date: '5 сентября 2025', read: '6 мин. чтения' },
  { slug: 'kostnyy-metall', tag: 'Остеосинтез', title: 'Когда нужно удалять металлоконструкции после сращения', desc: 'Показания, сроки и техника удаления пластин и винтов после успешного остеосинтеза.', date: '20 сентября 2025', read: '5 мин. чтения' },
  { slug: 'vinty-2', tag: 'Импланты', title: 'Кортикальные vs губчатые винты: в чём разница', desc: 'Объясняем разницу в конструкции, показаниях и технике введения.', date: '3 октября 2025', read: '4 мин. чтения' },
  { slug: 'sluchay-2', tag: 'Клинические случаи', title: 'Перелом бедра у кошки: разбор сложного случая', desc: 'Применение угловых пластин и техника интраоперационного позиционирования.', date: '15 октября 2025', read: '3 мин. чтения' },
  { slug: 'shovny', tag: 'Инструменты', title: 'Шовный материал для мягких тканей: виды и выбор', desc: 'Рассасывающийся и нерассасывающийся шовный материал — где и когда применять.', date: '28 октября 2025', read: '5 мин. чтения' },
]

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('Все статьи')

  const filtered = activeTag === 'Все статьи'
    ? ARTICLES
    : ARTICLES.filter(a => a.tag === activeTag)

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>/</span>
            <span>Блог</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Полезные материалы<br/>для ветеринарных хирургов</h1>
            <p className={styles.desc}>Практические статьи, обзоры и рекомендации по остеосинтезу, имплантам и работе ветеринарных клиник.</p>
          </div>
          <div className={styles.headerPhoto}>ГРАФИКА</div>
        </div>

        {/* Теги */}
        <div className={styles.tags}>
          {TAGS.map(t => (
            <button
              key={t}
              className={`${styles.tag} ${activeTag === t ? styles.tagActive : ''}`}
              onClick={() => setActiveTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Сетка статей */}
        <div className={styles.grid}>
          {filtered.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        {/* Пагинация */}
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled>‹</button>
          {[1, 2, 3, '...', 9].map((p, i) => (
            <button key={i} className={`${styles.pageBtn} ${p === 1 ? styles.pageBtnActive : ''}`} disabled={p === '...'}>
              {p}
            </button>
          ))}
          <button className={styles.pageBtn}>›</button>
        </div>
      </div>
    </div>
  )
}

function ArticleCard({ article }) {
  return (
    <Link to={`/blog/${article.slug}`} className={styles.card}>
      <div className={styles.cardPhoto}>Обложка статьи</div>
      <div className={styles.cardBody}>
        <span className={styles.cardTag}>{article.tag}</span>
        <h2 className={styles.cardTitle}>{article.title}</h2>
        <p className={styles.cardDesc}>{article.desc}</p>
        <div className={styles.cardMeta}>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.read}</span>
        </div>
      </div>
    </Link>
  )
}
