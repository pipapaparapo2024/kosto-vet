import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  getCustomerCart,
  upsertCartItem,
  updateCartItem,
  deleteCartItem,
  mergeCustomerCart,
} from '../lib/api/account'
import { cartEtag } from '../lib/payment'
import { ApiError } from '../lib/apiClient'
import { formatMoney, productImageUrl } from '../lib/money'

const CartContext = createContext(null)
const GUEST_KEY = 'kv_guest_cart'

function readGuest() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const { isAuth, loading: authLoading } = useAuth()
  const [serverCart, setServerCart] = useState(null)
  const [guestItems, setGuestItems] = useState(() => readGuest())
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const mergedRef = useRef(false)

  const refreshServerCart = useCallback(async () => {
    const cart = await getCustomerCart()
    setServerCart(cart)
    return cart
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setServerCart(null)
      mergedRef.current = false
      return
    }

    let cancelled = false
    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        let cart = await getCustomerCart()
        if (cancelled) return

        const guest = readGuest()
        if (guest.length && !mergedRef.current) {
          mergedRef.current = true
          cart = await mergeCustomerCart(
            guest.map(g => ({ product_id: g.product_id, quantity: g.quantity })),
            cartEtag(cart.version),
          )
          writeGuest([])
          setGuestItems([])
        }
        if (!cancelled) setServerCart(cart)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()

    return () => { cancelled = true }
  }, [isAuth, authLoading])

  const withConflictRetry = useCallback(async (action) => {
    try {
      return await action(serverCart)
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const fresh = await refreshServerCart()
        return action(fresh)
      }
      throw e
    }
  }, [serverCart, refreshServerCart])

  const addItem = useCallback(async (product, quantity = 1) => {
    setError(null)
    const qty = Math.max(1, Math.min(999, quantity))

    if (!isAuth) {
      setGuestItems(prev => {
        const next = [...prev]
        const idx = next.findIndex(i => i.product_id === product.id)
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            quantity: Math.min(999, next[idx].quantity + qty),
            product: snapshotProduct(product),
          }
        } else {
          next.push({
            product_id: product.id,
            quantity: qty,
            product: snapshotProduct(product),
          })
        }
        writeGuest(next)
        return next
      })
      setOpen(true)
      return
    }

    setBusy(true)
    try {
      const cart = await withConflictRetry((current) => {
        const existing = current?.items?.find(i => i.product?.id === product.id)
        const nextQty = Math.min(999, (existing?.quantity || 0) + qty)
        return upsertCartItem(
          { product_id: product.id, quantity: nextQty },
          cartEtag(current?.version ?? 0),
        )
      })
      setServerCart(cart)
      setOpen(true)
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setBusy(false)
    }
  }, [isAuth, withConflictRetry])

  const setQuantity = useCallback(async (itemIdOrProductId, quantity) => {
    const qty = Math.max(1, Math.min(999, quantity))
    setError(null)

    if (!isAuth) {
      setGuestItems(prev => {
        const next = prev.map(i =>
          i.product_id === itemIdOrProductId ? { ...i, quantity: qty } : i,
        )
        writeGuest(next)
        return next
      })
      return
    }

    setBusy(true)
    try {
      const cart = await withConflictRetry((current) =>
        updateCartItem(itemIdOrProductId, { quantity: qty }, cartEtag(current.version)),
      )
      setServerCart(cart)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [isAuth, withConflictRetry])

  const removeItem = useCallback(async (itemIdOrProductId) => {
    setError(null)
    if (!isAuth) {
      setGuestItems(prev => {
        const next = prev.filter(i => i.product_id !== itemIdOrProductId)
        writeGuest(next)
        return next
      })
      return
    }

    setBusy(true)
    try {
      const cart = await withConflictRetry((current) =>
        deleteCartItem(itemIdOrProductId, cartEtag(current.version)),
      )
      setServerCart(cart)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }, [isAuth, withConflictRetry])

  const clearGuest = useCallback(() => {
    writeGuest([])
    setGuestItems([])
  }, [])

  const view = useMemo(() => {
    if (isAuth && serverCart) {
      return {
        mode: 'server',
        items: serverCart.items || [],
        subtotal: serverCart.subtotal,
        delivery: serverCart.delivery,
        total: serverCart.total,
        hasConflicts: !!serverCart.has_conflicts,
        version: serverCart.version,
        count: (serverCart.items || []).reduce((s, i) => s + i.quantity, 0),
      }
    }

    const items = guestItems.map(g => ({
      id: g.product_id,
      product: g.product,
      quantity: g.quantity,
      unit_price: g.product?.price || null,
      line_total: g.product?.price
        ? { amount: (g.product.price.amount || 0) * g.quantity, currency: g.product.price.currency || 'RUB' }
        : null,
      stock: g.product?.stock || null,
      conflict: null,
      _guest: true,
    }))

    const subtotalAmount = items.reduce((s, i) => s + (i.line_total?.amount || 0), 0)

    return {
      mode: 'guest',
      items,
      subtotal: { amount: subtotalAmount, currency: 'RUB' },
      delivery: null,
      total: { amount: subtotalAmount, currency: 'RUB' },
      hasConflicts: false,
      version: 0,
      count: items.reduce((s, i) => s + i.quantity, 0),
    }
  }, [isAuth, serverCart, guestItems])

  const checkoutItems = useMemo(
    () => view.items.map(i => ({
      product_id: i.product?.id || i.id,
      quantity: i.quantity,
    })),
    [view.items],
  )

  return (
    <CartContext.Provider
      value={{
        ...view,
        open,
        setOpen,
        busy,
        error,
        setError,
        addItem,
        setQuantity,
        removeItem,
        refreshServerCart,
        clearGuest,
        checkoutItems,
        formatMoney,
        productImageUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

function snapshotProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    category_slug: product.category_slug,
    name: product.name,
    subtitle: product.subtitle,
    article: product.article,
    price: product.price,
    image: product.image,
    stock: product.stock,
  }
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
