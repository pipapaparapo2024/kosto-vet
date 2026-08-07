import { apiRequest } from '../apiClient'

export function listCustomerOrders({ page = 1, limit = 20 } = {}) {
  return apiRequest(`/api/v1/account/orders?page=${page}&limit=${limit}`)
}

export function getCustomerOrder(publicId) {
  return apiRequest(`/api/v1/account/orders/${encodeURIComponent(publicId)}`)
}

export function getCustomerCart() {
  return apiRequest('/api/v1/account/cart')
}

export function upsertCartItem(body, ifMatch) {
  return apiRequest('/api/v1/account/cart/items', {
    method: 'PUT',
    body,
    ifMatch,
  })
}

export function updateCartItem(id, body, ifMatch) {
  return apiRequest(`/api/v1/account/cart/items/${id}`, {
    method: 'PATCH',
    body,
    ifMatch,
  })
}

export function deleteCartItem(id, ifMatch) {
  return apiRequest(`/api/v1/account/cart/items/${id}`, {
    method: 'DELETE',
    ifMatch,
  })
}

export function mergeCustomerCart(items, ifMatch) {
  return apiRequest('/api/v1/account/cart/merge', {
    method: 'POST',
    idempotent: true,
    ifMatch,
    body: { items },
  })
}

export function listDeliveryAddresses() {
  return apiRequest('/api/v1/account/delivery-addresses')
}

export function createDeliveryAddress(payload) {
  return apiRequest('/api/v1/account/delivery-addresses', {
    method: 'POST',
    body: payload,
  })
}

export function deleteDeliveryAddress(id, ifMatch) {
  return apiRequest(`/api/v1/account/delivery-addresses/${id}`, {
    method: 'DELETE',
    ifMatch,
  })
}

export function listFavorites() {
  return apiRequest('/api/v1/account/favorites')
}

export function addFavorite(productId) {
  return apiRequest('/api/v1/account/favorites', {
    method: 'POST',
    body: { product_id: productId },
  })
}

export function removeFavorite(productId) {
  return apiRequest(`/api/v1/account/favorites/${productId}`, {
    method: 'DELETE',
  })
}
