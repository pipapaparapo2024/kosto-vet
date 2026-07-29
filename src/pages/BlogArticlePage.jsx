import { Link, useParams } from 'react-router-dom'
import { PRODUCTS, minPrice } from '../data/catalog'
import { img } from '../utils/assetUrl'
import styles from './BlogArticlePage.module.css'

const ARTICLES = [
  {
    slug: 'kak-vybrat-plastinu',
    tag: 'Остеосинтез',
    title: 'Как выбрать пластину для остеосинтеза у собак и кошек',
    desc: 'Правильный выбор пластины — залог стабильной фиксации и быстрого восстановления пациента. Разбираем основные критерии и типы пластин.',
    date: '17 июля 2026',
    read: '7 мин. чтения',
    toc: [
      'Основные типы пластин',
      'Критерии выбора',
      'Материалы',
      'Размер и форма',
      'Частые ошибки',
      'Заключение',
    ],
  },
  {
    slug: 'vinty-dlya-osteosinteza',
    tag: 'Импланты',
    title: 'Винты для остеосинтеза: основные правила подбора',
    desc: 'Диаметр, длина, тип резьбы и интерфейс — что важно учитывать при выборе винтов.',
    date: '26 июня 2026',
    read: '5 мин. чтения',
    toc: ['Типы резьбы', 'Диаметр', 'Длина', 'Материал', 'Заключение'],
  },
  {
    slug: 'klinicheskiy-sluchay',
    tag: 'Клинические случаи',
    title: 'Клинический случай: сложный перелом большеберцовой кости у собаки',
    desc: 'Подробный разбор лечения и остеосинтеза с использованием L-образной пластины.',
    date: '31 августа 2026',
    read: '3 мин. чтения',
    toc: ['Анамнез', 'Диагностика', 'Оперативное вмешательство', 'Результат'],
  },
  {
    slug: 'instrumenty-osnovy',
    tag: 'Инструменты',
    title: 'Базовый набор инструментов для остеосинтеза',
    desc: 'Что должно быть в операционной — свёрла, развёртки, ключи и отвёртки для пластин.',
    date: '14 августа 2026',
    read: '4 мин. чтения',
    toc: ['Свёрла', 'Развёртки', 'Ключи', 'Отвёртки'],
  },
  {
    slug: 'reabilitaciya',
    tag: 'Уход и реабилитация',
    title: 'Послеоперационная реабилитация после остеосинтеза',
    desc: 'Контроль нагрузки, физиотерапия, повторные снимки — схема восстановления.',
    date: '5 сентября 2026',
    read: '6 мин. чтения',
    toc: ['Первые 48 часов', 'Контроль нагрузки', 'Физиотерапия', 'Снимки'],
  },
  {
    slug: 'kostnyy-metall',
    tag: 'Остеосинтез',
    title: 'Когда нужно удалять металлоконструкции после сращения',
    desc: 'Показания, сроки и техника удаления пластин и винтов.',
    date: '20 сентября 2026',
    read: '5 мин. чтения',
    toc: ['Показания', 'Сроки', 'Техника удаления', 'Послеоперационный период'],
  },
  {
    slug: 'vinty-2',
    tag: 'Импланты',
    title: 'Кортикальные vs губчатые винты: в чём разница',
    desc: 'Объясняем разницу в конструкции, показаниях и технике введения.',
    date: '3 октября 2026',
    read: '4 мин. чтения',
    toc: ['Кортикальные', 'Губчатые', 'Применение', 'Ошибки'],
  },
  {
    slug: 'sluchay-2',
    tag: 'Клинические случаи',
    title: 'Перелом бедра у кошки: разбор сложного случая',
    desc: 'Применение угловых пластин и техника интраоперационного позиционирования.',
    date: '15 октября 2026',
    read: '3 мин. чтения',
    toc: ['Описание случая', 'Диагностика', 'Операция', 'Результат'],
  },
  {
    slug: 'shovny',
    tag: 'Инструменты',
    title: 'Шовный материал для мягких тканей: виды и выбор',
    desc: 'Рассасывающийся и нерассасывающийся шовный материал — где и когда применять.',
    date: '28 октября 2026',
    read: '5 мин. чтения',
    toc: ['Рассасывающийся', 'Нерассасывающийся', 'Критерии выбора'],
  },
]

const LOREM = `Остеосинтез у мелких животных требует точного подбора имплантов с учётом анатомии, массы тела, типа перелома и доступных методов фиксации. При выборе пластины хирург должен оценить нагрузку на кость, зону перелома и особенности репозиции.

Пластины из медицинской стали и сплавов титана обеспечивают надёжную биосовместимость и механическую стабильность. Сплав титана предпочтителен у пациентов с аллергическими реакциями или при длительном ношении.

Форма пластины — один из ключевых параметров. Прямые пластины применяют при диафизарных переломах длинных костей, Т-образные — в зонах мыщелков и суставных поверхностей, L-образные — при некоторых переломах предплечья и голени.

Толщина и ширина имплантата должны соответствовать диаметру кости. Слишком массивная пластина вызывает стресс-шилдинг, слишком тонкая — риск поломки при ранней нагрузке.

Кол-во и размер отверстий определяют количество фиксирующих винтов. Общее правило — не менее трёх кортикальных слоёв с каждой стороны от линии перелома. Для коротких фрагментов допустимо минимум два хорошо затянутых кортикальных винта.`

export default function BlogArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug) || ARTICLES[0]
  const otherArticles = ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3)

  // Featured product for sidebar
  const featuredProduct = PRODUCTS.find(p => p.category === 'plastiny') || PRODUCTS[0]
  const featuredPrice = minPrice(featuredProduct)

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <Link to="/blog">Блог</Link><span>›</span>
            <span>{article.title}</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        {/* Article header */}
        <div className={styles.articleHeader}>
          <div className={styles.articleHeaderLeft}>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <p className={styles.articleDesc}>{article.desc}</p>
            <div className={styles.articleMeta}>
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.read}</span>
              <span>·</span>
              <span className={styles.articleTag}>{article.tag}</span>
            </div>
          </div>
          <div className={styles.articleCover}>Обложка статьи</div>
        </div>

        {/* Content layout */}
        <div className={styles.layout}>
          {/* Left sidebar: TOC */}
          <aside className={styles.sidebar}>
            <div className={styles.toc}>
              <p className={styles.tocTitle}>Содержание</p>
              <ol className={styles.tocList}>
                {article.toc.map((item, i) => (
                  <li key={i} className={styles.tocItem}>
                    <span className={styles.tocNum}>{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <button className={styles.pdfBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Скачать PDF
                <span className={styles.pdfVersion}>Версия от {article.date}</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <article className={styles.article}>
            <h2 className={styles.chapterTitle}>1. {article.toc[0]}</h2>
            {LOREM.split('\n\n').map((para, i) => (
              <p key={i} className={styles.para}>{para}</p>
            ))}
            {article.toc.slice(1).map((chapter, i) => (
              <div key={i}>
                <h2 className={styles.chapterTitle}>{i + 2}. {chapter}</h2>
                <p className={styles.para}>{LOREM.split('\n\n')[i % 5]}</p>
              </div>
            ))}
          </article>

          {/* Right sidebar: product widget + other articles */}
          <aside className={styles.widgetCol}>
            {/* Product widget */}
            {featuredProduct && (
              <div className={styles.productWidget}>
                <p className={styles.widgetTitle}>Нужен этот имплант?</p>
                <p className={styles.widgetDesc}>Проверьте наличие или получите помощь в подборе</p>
                <div className={styles.widgetProduct}>
                  <div className={styles.widgetPhoto}>
                    <img src={img(featuredProduct.image)} alt={featuredProduct.shortName} onError={e => { e.currentTarget.style.opacity = '0.3' }} />
                  </div>
                  <div>
                    <p className={styles.widgetProductName}>{featuredProduct.shortName || featuredProduct.name}</p>
                    <p className={styles.widgetSku}>Арт. {featuredProduct.variants?.[0]?.sku}</p>
                    <p className={styles.widgetStock}>● В наличии</p>
                    {featuredPrice && <p className={styles.widgetPrice}>{featuredPrice.toLocaleString('ru')} ₽</p>}
                  </div>
                </div>
                <Link to={`/catalog/${featuredProduct.category}/${featuredProduct.slug}`} className={styles.widgetBtn}>
                  Проверить наличие
                </Link>
                <Link to="/contacts" className={styles.widgetBtnSecondary}>
                  Получить подбор
                </Link>
              </div>
            )}

            {/* Other articles */}
            <div className={styles.otherArticles}>
              <p className={styles.otherTitle}>Другие статьи</p>
              {otherArticles.map(a => (
                <Link key={a.slug} to={`/blog/${a.slug}`} className={styles.otherCard}>
                  <div className={styles.otherPhoto}>Обложка статьи</div>
                  <div className={styles.otherBody}>
                    <p className={styles.otherCardTitle}>{a.title}</p>
                    <span className={styles.otherReadLink}>Читать →</span>
                  </div>
                </Link>
              ))}
              <Link to="/blog" className={styles.allArticlesBtn}>Все статьи</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
