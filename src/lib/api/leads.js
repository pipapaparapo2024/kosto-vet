import { apiRequest } from '../apiClient'

export function createLead({
  name,
  phone,
  email,
  company,
  message,
  productSlug,
  source = 'contact',
  website = '',
  consent = true,
}) {
  return apiRequest('/api/v1/leads', {
    method: 'POST',
    idempotent: true,
    body: {
      name,
      phone,
      email: email || undefined,
      company: company || undefined,
      message: message || undefined,
      product_slug: productSlug || undefined,
      source,
      consent: true,
      website,
    },
  })
}

export function createStockSubscription({
  productSlug,
  name,
  contact,
  website = '',
}) {
  return apiRequest('/api/v1/stock-subscriptions', {
    method: 'POST',
    idempotent: true,
    body: {
      product_slug: productSlug,
      name,
      contact,
      consent: true,
      website,
    },
  })
}
