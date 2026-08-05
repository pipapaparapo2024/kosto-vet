import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { img } from '../utils/assetUrl'
import styles from './DocumentsPage.module.css'

const DOCS = [
  { id: 'sertifikat-sootvetstviya',     label: 'Сертификат соответствия', group: 'Сертификаты' },
  { id: 'deklaraciya-ee',               label: 'Декларация о соответствии ЕЭС', group: 'Сертификаты' },
  { id: 'svidetelstvo-gosregistracii',  label: 'Свидетельство о гос. регистрации', group: 'Сертификаты' },
  { id: 'protokol-ispytaniy',           label: 'Протокол испытаний', group: 'Технические' },
  { id: 'tehnicheskie-usloviya',        label: 'Технические условия (ТУ)', group: 'Технические' },
  { id: 'instrukciya-primeneniya',      label: 'Инструкция по применению', group: 'Технические' },
  { id: 'sterilizaciya',                label: 'Рекомендации по стерилизации', group: 'Технические' },
  { id: 'kontrol-kachestva',            label: 'Контроль качества продукции', group: 'Технические' },
  { id: 'politika-konfidencialnosti',   label: 'Политика конфиденциальности', group: 'Юридические', to: '/privacy-policy' },
  { id: 'obrabotka-personalnyh-dannyh', label: 'Обработка персональных данных', group: 'Юридические', to: '/personal-data-consent' },
  { id: 'polzovatelskoe-soglashenie',   label: 'Пользовательское соглашение', group: 'Юридические', to: '/user-agreement' },
  { id: 'oferta',                       label: 'Договор-оферта', group: 'Юридические', to: '/offer' },
  { id: 'vozvrat',                      label: 'Порядок возврата', group: 'Юридические' },
  { id: 'licenziya',                    label: 'Лицензия на деятельность', group: 'Юридические' },
]

const GROUPS = ['Сертификаты', 'Технические', 'Юридические']

const DOC_CONTENT = {
  'sertifikat-sootvetstviya': {
    title: 'Сертификат соответствия',
    updated: '15 января 2026',
    body: `Настоящий сертификат подтверждает, что продукция компании Kosto-Vet — ортопедические импланты для ветеринарного применения — соответствует требованиям технических регламентов Евразийского экономического союза.

Сертификат выдан на основании протокола испытаний аккредитованной лаборатории. Все изделия изготовлены из медицинской нержавеющей стали марки 316L или титанового сплава Ti-6Al-4V.

Срок действия: до 31 декабря 2027 года.

Орган по сертификации: ФБУ «Воронежский ЦСМ», аттестат аккредитации № RA.RU.11АЦ24.`,
  },
  default: {
    title: 'Документ',
    updated: '1 января 2026',
    body: `Содержимое документа находится в разработке. Для получения оригинала документа свяжитесь с нами по адресу Kosto-Vet@yandex.ru или по телефону +7 (961) 189-89-33.

Мы предоставляем полный пакет документов по запросу в течение 1 рабочего дня.`,
  },
}

const AGREEMENT_ID = 'polzovatelskoe-soglashenie'

const AGREEMENT = {
  title: 'Пользовательское соглашение',
  updated: 'Редакция от 01 мая 2024 г.',
  pdfVersion: 'Версия от 01.05.2024',
  intro: 'Настоящее пользовательское соглашение (далее — «Соглашение») регулирует отношения между интернет-магазином Kosto-Vet (далее — «Сайт», «Мы», «Наш») и пользователем (далее — «Вы», «Пользователь») при использовании Сайта и оформлении заказов.',
  sections: [
    {
      id: 'obshchie-polozheniya', num: 1, title: 'Общие положения',
      paragraphs: [
        '1.1. Используя Сайт, Вы подтверждаете, что ознакомлены с настоящим Соглашением и соглашаетесь с его условиями в полном объеме. Если Вы не согласны с условиями Соглашения, пожалуйста, не используйте Сайт.',
        '1.2. Мы оставляем за собой право вносить изменения в Соглашение. Актуальная версия всегда размещена на данной странице.',
      ],
    },
    {
      id: 'terminy-i-opredeleniya', num: 2, title: 'Термины и определения',
      paragraphs: [
        '2.1. Сайт — интернет-сайт, расположенный по адресу kosto-vet.ru, а также его поддомены.',
        '2.2. Товар — продукция, представленная на Сайте.',
        '2.3. Заказ — оформленный Пользователем запрос на покупку Товара.',
        '2.4. Покупатель — физическое или юридическое лицо, оформившее Заказ.',
      ],
    },
    {
      id: 'predmet-soglasheniya', num: 3, title: 'Предмет соглашения',
      paragraphs: [
        '3.1. Настоящее Соглашение определяет условия использования Сайта, а также порядок приобретения Товаров через интернет-магазин.',
        '3.2. Оформляя Заказ на Сайте, Вы подтверждаете, что ознакомлены с характеристиками Товара, условиями оплаты и доставки.',
      ],
    },
    {
      id: 'prava-i-obyazannosti-storon', num: 4, title: 'Права и обязанности сторон',
      blocks: [
        {
          subtitle: '4.1. Пользователь обязуется:',
          items: [
            'Предоставлять достоверные данные при оформлении Заказа.',
            'Использовать Сайт исключительно в законных целях.',
            'Не нарушать работоспособность Сайта и не предпринимать действий, направленных на его некорректное использование.',
          ],
        },
        {
          subtitle: '4.2. Магазин обязуется:',
          items: [
            'Предоставлять актуальную информацию о Товаре.',
            'Обрабатывать Заказы в установленные сроки.',
            'Обеспечивать конфиденциальность персональных данных Пользователя.',
          ],
        },
      ],
    },
    {
      id: 'oformlenie-zakaza', num: 5, title: 'Оформление заказа',
      paragraphs: [
        '5.1. Заказ оформляется через форму на Сайте или иным способом, доступным на Сайте.',
        '5.2. После оформления Заказа с Вами свяжется наш менеджер для подтверждения и уточнения деталей.',
        '5.3. Магазин оставляет за собой право отменить Заказ в случае недоступности Товара.',
      ],
    },
    {
      id: 'oplata-i-ceny', num: 6, title: 'Оплата и цены',
      paragraphs: [
        '6.1. Цены на Товары указаны в рублях Российской Федерации.',
        '6.2. Оплата производится способами, указанными на Сайте.',
        '6.3. Мы оставляем за собой право изменять цены без предварительного уведомления. Актуальная цена отображается на странице Товара.',
      ],
    },
    {
      id: 'dostavka-i-peredacha-tovara', num: 7, title: 'Доставка и передача товара',
      paragraphs: [
        '7.1. Доставка осуществляется способами, указанными на Сайте.',
        '7.2. Сроки доставки зависят от региона и выбранного способа доставки.',
        '7.3. Риск случайной гибели или повреждения Товара переходит к Покупателю с момента передачи Товара курьеру или в пункте выдачи.',
      ],
    },
    {
      id: 'vozvrat-i-obmen-tovara', num: 8, title: 'Возврат и обмен товара', pending: true,
      paragraphs: ['Текст раздела уточняется и будет добавлен после согласования с юристом.'],
    },
    {
      id: 'otvetstvennost-storon', num: 9, title: 'Ответственность сторон', pending: true,
      paragraphs: ['Текст раздела уточняется и будет добавлен после согласования с юристом.'],
    },
    {
      id: 'intellektualnaya-sobstvennost', num: 10, title: 'Интеллектуальная собственность', pending: true,
      paragraphs: ['Текст раздела уточняется и будет добавлен после согласования с юристом.'],
    },
    {
      id: 'personalnye-dannye', num: 11, title: 'Персональные данные', pending: true,
      paragraphs: ['Текст раздела уточняется и будет добавлен после согласования с юристом.'],
    },
    {
      id: 'zaklyuchitelnye-polozheniya', num: 12, title: 'Заключительные положения', pending: true,
      paragraphs: ['Текст раздела уточняется и будет добавлен после согласования с юристом.'],
    },
  ],
}

export default function DocumentsPage() {
  const { doc: docParam } = useParams()
  const isAgreement = docParam === AGREEMENT_ID
  const [expanded, setExpanded] = useState(false)

  const [activeDoc, setActiveDoc] = useState(() => {
    if (docParam && DOCS.some(d => d.id === docParam && !d.to)) return docParam
    return DOCS.find(d => !d.to)?.id || DOCS[0].id
  })

  if (isAgreement) {
    const visibleSections = expanded ? AGREEMENT.sections : AGREEMENT.sections.slice(0, 7)

    return (
      <div className={styles.page}>
        <div className={styles.containerWide}>
          <nav className={styles.breadcrumbTop}>
            <Link to="/">Главная</Link><span>›</span>
            <Link to="/documents">Документы</Link><span>›</span>
            <span>{AGREEMENT.title}</span>
          </nav>

          <div className={styles.agreementLayout}>
            <aside className={styles.toc}>
              <p className={styles.tocTitle}>Содержание</p>
              <nav className={styles.tocList}>
                {AGREEMENT.sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className={styles.tocItem}>{s.num}. {s.title}</a>
                ))}
              </nav>
              <a
                className={styles.pdfBtn}
                href={img('documents/polzovatelskoe-soglashenie.pdf')}
                download="Kosto-Vet — Пользовательское соглашение.pdf"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>
                  <span className={styles.pdfBtnTitle}>Скачать PDF</span>
                  <span className={styles.pdfBtnSub}>{AGREEMENT.pdfVersion}</span>
                </span>
              </a>
            </aside>

            <article className={styles.agreementBody}>
              <h1 className={styles.agreementTitle}>{AGREEMENT.title}</h1>
              <p className={styles.agreementUpdated}>{AGREEMENT.updated}</p>
              <p className={styles.agreementIntro}>{AGREEMENT.intro}</p>

              {visibleSections.map(s => (
                <section key={s.id} id={s.id} className={styles.section}>
                  <h2 className={styles.sectionTitle}>{s.num}. {s.title}</h2>
                  {s.paragraphs?.map((p, i) => <p key={i} className={styles.sectionP}>{p}</p>)}
                  {s.blocks?.map((b, i) => (
                    <div key={i} className={styles.sectionBlock}>
                      <p className={styles.sectionSubtitle}>{b.subtitle}</p>
                      <ul className={styles.sectionList}>
                        {b.items.map((it, j) => <li key={j}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </section>
              ))}

              {!expanded && (
                <button type="button" className={styles.readMoreBtn} onClick={() => setExpanded(true)}>
                  Читать далее <ChevronDown size={18} strokeWidth={2} />
                </button>
              )}
            </article>
          </div>
        </div>
      </div>
    )
  }

  const doc = DOCS.find(d => d.id === activeDoc)
  const content = DOC_CONTENT[activeDoc] || { ...DOC_CONTENT.default, title: doc?.label }

  return (
    <div className={styles.page}>
      <div className={styles.containerWide}>
        <nav className={styles.breadcrumbTop}>
          <Link to="/">Главная</Link><span>›</span>
          <span>Документы</span>
        </nav>

        <h1 className={styles.pageTitle}>Документация</h1>
        <p className={styles.pageDesc}>Сертификаты, технические условия и юридические документы компании Kosto-Vet.</p>

        <div className={styles.layout}>
          <nav className={styles.nav}>
            {GROUPS.map(group => (
              <div key={group} className={styles.navGroup}>
                <p className={styles.navGroupTitle}>{group}</p>
                {DOCS.filter(d => d.group === group).map(d => (
                  d.to ? (
                    <Link
                      key={d.id}
                      to={d.to}
                      className={styles.navItem}
                    >
                      {d.label}
                    </Link>
                  ) : (
                    <button
                      key={d.id}
                      type="button"
                      className={`${styles.navItem} ${activeDoc === d.id ? styles.navItemActive : ''}`}
                      onClick={() => setActiveDoc(d.id)}
                    >
                      {d.label}
                    </button>
                  )
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.docView}>
            <div className={styles.docHeader}>
              <div>
                <h2 className={styles.docTitle}>{content.title}</h2>
                <p className={styles.docUpdated}>Обновлено: {content.updated}</p>
              </div>
              <button type="button" className={styles.downloadBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Скачать PDF
              </button>
            </div>

            <div className={styles.docPreview}>
              <div className={styles.docPreviewInner}>
                <div className={styles.docPreviewHeader}>
                  <div className={styles.docPreviewLogo}>KOSTO-VET</div>
                  <p className={styles.docPreviewSubtitle}>Официальный документ</p>
                </div>
                <h3 className={styles.docPreviewTitle}>{content.title}</h3>
                {content.body.split('\n\n').map((para, i) => (
                  <p key={i} className={styles.docPreviewBody}>{para}</p>
                ))}
              </div>
            </div>

            <div className={styles.docActions}>
              <p className={styles.docActionsNote}>
                Нужен оригинал или нотариально заверенная копия?
              </p>
              <Link to="/contacts" className={styles.docContactBtn}>
                Связаться с нами
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
