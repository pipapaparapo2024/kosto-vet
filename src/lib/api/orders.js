import { apiRequest } from '../apiClient'

const ORDER_TOKEN_KEY = 'kv_order_access'

export function saveOrderAccess(publicId, token) {
  try {
    const map = JSON.parse(sessionStorage.getItem(ORDER_TOKEN_KEY) || '{}')
    map[publicId] = token
    sessionStorage.setItem(ORDER_TOKEN_KEY, JSON.stringify(map))
  } catch { /* ignore */ }
}

export function getOrderAccess(publicId) {
  try {
    const map = JSON.parse(sessionStorage.getItem(ORDER_TOKEN_KEY) || '{}')
    return map[publicId] || null
  } catch {
    return null
  }
}

export function createQuoteOrder(payload) {
  return apiRequest('/api/v1/orders/quote', {
    method: 'POST',
    idempotent: true,
    body: payload,
  })
}

export function createCheckoutOrder(payload) {
  return apiRequest('/api/v1/orders/checkout', {
    method: 'POST',
    idempotent: true,
    body: payload,
  })
}

export function getPublicOrder(publicId, accessToken) {
  return apiRequest(`/api/v1/orders/${encodeURIComponent(publicId)}`, {
    headers: { 'X-Order-Access-Token': accessToken },
  })
}

export function createOrderPaymentAttempt(publicId, accessToken, paymentMethod) {
  return apiRequest(`/api/v1/orders/${encodeURIComponent(publicId)}/payment-attempts`, {
    method: 'POST',
    idempotent: true,
    headers: { 'X-Order-Access-Token': accessToken },
    body: { payment_method: paymentMethod },
  })
}
