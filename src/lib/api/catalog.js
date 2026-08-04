import { apiRequest } from '../apiClient'
import {
  localCategories,
  localCategoryDetail,
  localGetProduct,
  localListProducts,
  localSearchSuggestions,
} from '../localCatalog'

function toQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    q.set(key, String(value))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

async function withLocalFallback(apiCall, localResult, { preferLocalIfEmpty = false } = {}) {
  try {
    const data = await apiCall()
    if (data == null) return typeof localResult === 'function' ? localResult() : localResult
    if (preferLocalIfEmpty && Array.isArray(data.items) && data.items.length === 0) {
      return typeof localResult === 'function' ? localResult() : localResult
    }
    if (preferLocalIfEmpty && typeof data.total === 'number' && data.total === 0 && Array.isArray(data.items)) {
      return typeof localResult === 'function' ? localResult() : localResult
    }
    return data
  } catch {
    return typeof localResult === 'function' ? localResult() : localResult
  }
}

export function listCategories() {
  return withLocalFallback(
    () => apiRequest('/api/v1/catalog/categories'),
    () => ({ items: localCategories() }),
    { preferLocalIfEmpty: true },
  )
}

export function getCategory(slug) {
  return withLocalFallback(
    () => apiRequest(`/api/v1/catalog/categories/${encodeURIComponent(slug)}`),
    () => {
      const detail = localCategoryDetail(slug)
      if (!detail) throw new Error('Категория не найдена')
      return detail
    },
  )
}

export function listProducts({
  category,
  includeDescendants = true,
  q,
  inStock,
  stockState,
  sort = 'popular',
  page = 1,
  limit = 24,
} = {}) {
  return withLocalFallback(
    () => apiRequest(`/api/v1/catalog/products${toQuery({
      category,
      include_descendants: includeDescendants,
      q,
      in_stock: inStock,
      stock_state: stockState,
      sort,
      page,
      limit,
    })}`),
    () => localListProducts({ category, q, inStock, stockState, sort, page, limit }),
  )
}

export function getProduct(slug) {
  return withLocalFallback(
    () => apiRequest(`/api/v1/catalog/products/${encodeURIComponent(slug)}`),
    () => {
      const product = localGetProduct(slug)
      if (!product) throw new Error('Товар не найден')
      return product
    },
  )
}

export function getSearchSuggestions(q) {
  return withLocalFallback(
    () => apiRequest(`/api/v1/catalog/search-suggestions${toQuery({ q })}`),
    () => localSearchSuggestions(q),
    { preferLocalIfEmpty: true },
  ).then((data) => {
    const items = (data?.items || [])
      .map((item) => ({
        ...item,
        label: item.label || item.title || item.name || '',
        url: item.url || (item.slug
          ? (item.type === 'category' ? `/catalog/${item.slug}` : `/catalog/${item.category_slug || item.category || 'plastiny'}/${item.slug}`)
          : '/catalog'),
      }))
      .filter((item) => item.label)
    if (items.length === 0) return localSearchSuggestions(q)
    return { ...data, items }
  })
}
