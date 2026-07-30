import { apiRequest } from '../apiClient'

function toQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    q.set(key, String(value))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function listCategories() {
  return apiRequest('/api/v1/catalog/categories')
}

export function getCategory(slug) {
  return apiRequest(`/api/v1/catalog/categories/${encodeURIComponent(slug)}`)
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
  return apiRequest(`/api/v1/catalog/products${toQuery({
    category,
    include_descendants: includeDescendants,
    q,
    in_stock: inStock,
    stock_state: stockState,
    sort,
    page,
    limit,
  })}`)
}

export function getProduct(slug) {
  return apiRequest(`/api/v1/catalog/products/${encodeURIComponent(slug)}`)
}

export function getSearchSuggestions(q) {
  return apiRequest(`/api/v1/catalog/search-suggestions${toQuery({ q })}`)
}
