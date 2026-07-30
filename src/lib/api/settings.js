import { apiRequest } from '../apiClient'

export function getPublicSettings() {
  return apiRequest('/api/v1/settings/public')
}
