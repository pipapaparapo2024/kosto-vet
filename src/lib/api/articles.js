import { apiRequest } from '../apiClient'

export function listArticles() {
  return apiRequest('/api/v1/articles')
}

export function getArticle(slug) {
  return apiRequest(`/api/v1/articles/${encodeURIComponent(slug)}`)
}

export function normalizeApiArticle(a) {
  if (!a || typeof a !== 'object') return null
  return {
    slug: a.slug || '',
    title: a.title || '',
    desc: a.excerpt || a.lead || a.description || '',
    tag: a.tags?.[0] || a.category || a.tag || 'Статья',
    date: a.published_at
      ? new Date(a.published_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      : (a.date || ''),
    read: a.reading_time ? `${a.reading_time} мин` : (a.read_time || a.read || '5 мин'),
    coverImage: a.cover_url || a.cover_image || a.cover || null,
    toc: Array.isArray(a.toc) ? a.toc : [],
    sections: Array.isArray(a.sections) ? a.sections : [],
    author: a.author || null,
  }
}
