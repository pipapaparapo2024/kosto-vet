const CLIENT_ID = import.meta.env.VITE_YANDEX_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_YANDEX_REDIRECT_URI || `${window.location.origin}/auth/callback`

export function getYandexAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    force_confirm: 'no',
  })
  return `https://oauth.yandex.ru/authorize?${params}`
}

export function redirectToYandex() {
  window.location.href = getYandexAuthUrl()
}
