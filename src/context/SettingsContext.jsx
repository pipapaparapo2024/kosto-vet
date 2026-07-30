import { createContext, useContext, useEffect, useState } from 'react'
import { getPublicSettings } from '../lib/api/settings'

const SettingsContext = createContext(null)

const FALLBACK = {
  fixed_delivery_price: { amount: 0, currency: 'RUB' },
  stock_reservation_ttl_seconds: 300,
  manager: {
    id: null,
    name: 'Менеджер KOSTO-VET',
    phone: '+7 (961) 189-89-33',
    email: 'Kosto-Vet@yandex.ru',
    messenger_url: null,
    scope: 'global',
  },
  emergency_phone: '+7 (961) 189-89-33',
  emergency_surcharge_percent: 10,
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getPublicSettings()
        if (!cancelled && data) setSettings({ ...FALLBACK, ...data })
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
