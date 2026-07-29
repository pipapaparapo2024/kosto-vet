import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  { id: 'politika-konfidencialnosti',   label: 'Политика конфиденциальности', group: 'Юридические' },
  { id: 'oferta',                       label: 'Договор-оферта', group: 'Юридические' },
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

export default function DocumentsPage() {
  const [activeDoc, setActiveDoc] = useState(DOCS[0].id)

  const doc = DOCS.find(d => d.id === activeDoc)
  const content = DOC_CONTENT[activeDoc] || { ...DOC_CONTENT.default, title: doc?.label }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Главная</Link><span>›</span>
            <span>Документы</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Документация</h1>
        <p className={styles.pageDesc}>Сертификаты, технические условия и юридические документы компании Kosto-Vet.</p>

        <div className={styles.layout}>
          {/* Left nav */}
          <nav className={styles.nav}>
            {GROUPS.map(group => (
              <div key={group} className={styles.navGroup}>
                <p className={styles.navGroupTitle}>{group}</p>
                {DOCS.filter(d => d.group === group).map(d => (
                  <button
                    key={d.id}
                    className={`${styles.navItem} ${activeDoc === d.id ? styles.navItemActive : ''}`}
                    onClick={() => setActiveDoc(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Document view */}
          <div className={styles.docView}>
            <div className={styles.docHeader}>
              <div>
                <h2 className={styles.docTitle}>{content.title}</h2>
                <p className={styles.docUpdated}>Обновлено: {content.updated}</p>
              </div>
              <button className={styles.downloadBtn}>
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
              <Link to="/contacts" className={styles.docContactBtn}>Связаться с нами →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
