import { apiRequest } from '../apiClient'

export function registerCustomer(payload) {
  return apiRequest('/api/v1/customer/auth/register', {
    method: 'POST',
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || null,
      customer_type: payload.customerType || 'individual',
      company_name: payload.companyName || undefined,
      inn: payload.inn || undefined,
      consent: true,
      website: payload.website || '',
    },
  })
}

export function loginCustomer({ email, password }) {
  return apiRequest('/api/v1/customer/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function refreshCustomerSession() {
  return apiRequest('/api/v1/customer/auth/refresh', { method: 'POST' })
}

export function logoutCustomer() {
  return apiRequest('/api/v1/customer/auth/logout', { method: 'POST' })
}

export function getCustomerMe() {
  return apiRequest('/api/v1/account/me')
}

export function updateCustomerMe(payload) {
  return apiRequest('/api/v1/account/me', {
    method: 'PATCH',
    body: payload,
  })
}

export function getCustomerManager() {
  return apiRequest('/api/v1/account/manager')
}
