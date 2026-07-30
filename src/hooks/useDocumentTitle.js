import { useEffect } from 'react'

const SITE = 'KOSTO-VET'

export function useDocumentTitle(title, description) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — ${SITE}` : SITE

    let meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content') || ''
    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = prev
      if (meta && description) meta.setAttribute('content', prevDesc)
    }
  }, [title, description])
}
