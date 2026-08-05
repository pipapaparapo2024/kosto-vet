const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

let _csrfToken = null

export function setCsrfToken(token) {
  _csrfToken = token || null
}

export function clearCsrfToken() {
  _csrfToken = null
}

export class ApiError extends Error {
  constructor({ code, message, request_id, retryable, field_errors, status, meta }) {
    super(message || 'Запрос не выполнен')
    this.name = 'ApiError'
    this.code = code
    this.requestId = request_id
    this.retryable = retryable
    this.fieldErrors = field_errors || []
    this.status = status
    this.meta = meta
  }
}

export function genIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`.padEnd(16, '0')
}

export function apiUrl(path) {
  if (!path.startsWith('/')) path = `/${path}`
  return `${API_BASE_URL}${path}`
}

/**
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: unknown,
 *   headers?: Record<string, string>,
 *   idempotent?: boolean,
 *   idempotencyKey?: string,
 *   ifMatch?: string,
 * }} [options]
 */
export async function apiRequest(path, {
  method = 'GET',
  body,
  headers = {},
  idempotent = false,
  idempotencyKey,
  ifMatch,
} = {}) {
  const finalHeaders = { ...headers }
  let payload

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  if (idempotent || idempotencyKey) {
    finalHeaders['Idempotency-Key'] = idempotencyKey || genIdempotencyKey()
  }
  if (ifMatch) {
    finalHeaders['If-Match'] = ifMatch
  }
  if (method !== 'GET' && _csrfToken) {
    finalHeaders['X-CSRF-Token'] = _csrfToken
  }

  let res
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: finalHeaders,
      body: payload,
      credentials: 'include',
    })
  } catch {
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.',
      retryable: true,
      status: 0,
    })
  }

  if (res.status === 204) return null

  const contentType = res.headers.get('content-type') || ''
  let data = null
  if (contentType.includes('application/json')) {
    try {
      data = await res.json()
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const errorDetail = data?.error || {}
    throw new ApiError({
      code: errorDetail.code || (res.status === 503 ? 'FEATURE_DISABLED' : 'UNKNOWN_ERROR'),
      message: errorDetail.message || 'Что-то пошло не так. Попробуйте позже.',
      request_id: errorDetail.request_id,
      retryable: errorDetail.retryable ?? (res.status >= 500 || res.status === 429),
      field_errors: errorDetail.field_errors,
      status: res.status,
      meta: errorDetail.meta,
    })
  }

  return data
}
