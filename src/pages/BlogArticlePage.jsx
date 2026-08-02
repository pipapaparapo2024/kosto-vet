import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, Clock, FileText, ArrowRight } from 'lucide-react'
import { listProducts } from '../lib/api/catalog'
import { formatMoney, productImageUrl, isInStock, stockLabel } from '../lib/money'
import { getArticleBySlug, getRelatedArticles, ARTICLES } from '../data/blogArticles'
import { img } from '../utils/assetUrl'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './BlogArticlePage.module.css'

export default function BlogArticlePage() {
  const { slug } = useParams()
  const article = getArticleBySlug(slug) || ARTICLES[0]
  const otherArticles = getRelatedArticles(article.slug, 3)
  const [featuredProduct, setFeaturedProduct] = useState(null)

  useDocumentTitle(article.title, article.desc)

  useEffect(() => {
    listProducts({ sort: 'popular', limit: 1 })
      .then(res => setFeaturedProduct(res.items?.[0] || null))
      .catch(() => setFeaturedProduct(null))
  }, [])

  const inStock = featuredProduct ? isInStock(featuredProduct.stock) : false
  const productImg = featuredProduct
    ? productImageUrl(featuredProduct.image, 'thumb')
    : null

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link to="/">Главная</Link><span>›</span>
          <Link to="/blog">Блог</Link><span>›</span>
          <span>{article.title}</span>
        </nav>

        <div className={styles.articleHeader}>
          <div className={styles.articleHeaderLeft}>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <p className={styles.articleDesc}>{article.desc}</p>
            <div className={styles.articleMeta}>
              <span className={styles.metaItem}>
                <Calendar size={17} strokeWidth={1.6} aria-hidden="true" />
                {article.date}
              </span>
              <span className={styles.metaItem}>
                <Clock size={17} strokeWidth={1.6} aria-hidden="true" />
                {article.read}
              </span>
              <span className={styles.metaItem}>
                <FileText size={17} strokeWidth={1.6} aria-hidden="true" />
                {article.tag}
              </span>
            </div>
          </div>
          <div className={styles.articleCover}>
            {article.coverImage ? (
              <img src={img(article.coverImage)} alt="" />
            ) : (
              'Обложка статьи'
            )}
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.toc}>
              <p className={styles.tocTitle}>Содержание</p>
              <ol className={styles.tocList}>
                {article.toc.map((item, i) => (
                  <li key={item} className={styles.tocItem}>
                    <span className={styles.tocNum}>{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <article className={styles.article}>
            {article.sections.map((section, i) => (
              <div key={section.title}>
                <h2 className={styles.chapterTitle}>{i + 1}. {section.title}</h2>
                {section.paragraphs.map((para, pi) => (
                  <p key={pi} className={styles.para}>{para}</p>
                ))}
              </div>
            ))}
          </article>

          <aside className={styles.widgetCol}>
            <div className={styles.productWidget}>
              <p className={styles.widgetTitle}>Нужен этот имплант?</p>
              <p className={styles.widgetDesc}>Проверьте наличие или получите помощь в подборе</p>

              {featuredProduct && (
                <div className={styles.widgetProduct}>
                  <div className={styles.widgetPhoto}>
                    {productImg ? (
                      <img
                        src={productImg}
                        alt={featuredProduct.name}
                        onError={e => { e.currentTarget.style.opacity = '0.3' }}
                      />
                    ) : (
                      <span>Фото пластины</span>
                    )}
                  </div>
                  <div className={styles.widgetProductInfo}>
                    <p className={styles.widgetProductName}>
                      {featuredProduct.subtitle || featuredProduct.name}
                    </p>
                    {featuredProduct.article && (
                      <p className={styles.widgetSku}>Арт. {featuredProduct.article}</p>
                    )}
                    <p className={styles.widgetStock}>
                      <span className={inStock ? styles.dot : styles.dotGrey} />
                      {stockLabel(featuredProduct.stock)}
                    </p>
                    <p className={styles.widgetPrice}>{formatMoney(featuredProduct.price)}</p>
                  </div>
                </div>
              )}

              <div className={styles.widgetActions}>
                <Link
                  to={featuredProduct
                    ? `/catalog/${featuredProduct.category_slug}/${featuredProduct.slug}`
                    : '/catalog'}
                  className={styles.widgetBtn}
                >
                  Проверить наличие
                </Link>
                <Link to="/contacts" className={styles.widgetBtnSecondary}>
                  Получить подбор
                </Link>
              </div>
            </div>

            <div className={styles.otherArticles}>
              <p className={styles.otherTitle}>Другие статьи</p>
              {otherArticles.map(a => (
                <Link key={a.slug} to={`/blog/${a.slug}`} className={styles.otherCard}>
                  <div className={styles.otherPhoto}>
                    {a.coverImage ? (
                      <img src={img(a.coverImage)} alt="" />
                    ) : (
                      'Обложка'
                    )}
                  </div>
                  <div className={styles.otherBody}>
                    <p className={styles.otherCardTitle}>{a.title}</p>
                    <span className={styles.otherReadLink}>
                      Читать <ArrowRight size={14} strokeWidth={1.8} />
                    </span>
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
