/** User-facing Russian labels for API enums and slugs. */

export const STOCK_STATE_OPTIONS = [
  { value: '', label: 'Любой статус' },
  { value: 'available', label: 'Много' },
  { value: 'low', label: 'Мало' },
  { value: 'out', label: 'Нет в наличии' },
  { value: 'unknown', label: 'Неизвестно' },
]

export function stockStateLabel(state) {
  if (!state) return 'Любой статус'
  return STOCK_STATE_OPTIONS.find(o => o.value === state)?.label || 'Наличие уточняется'
}

const ORDER_STATUS = {
  new: 'Новый',
  awaiting_stock_confirmation: 'Ожидает подтверждения наличия',
  awaiting_payment: 'Ожидает оплаты',
  paid: 'Оплачен',
  assembling: 'Сборка',
  ready_for_dispatch: 'Готов к отправке',
  shipped: 'Отправлен',
  completed: 'Завершён',
  canceled: 'Отменён',
  cancelled: 'Отменён',
}

const PAYMENT_STATUS = {
  not_required: 'Не требуется',
  created: 'Создана',
  pending: 'В обработке',
  succeeded: 'Оплачено',
  canceled: 'Отменена',
  cancelled: 'Отменена',
  expired: 'Истекла',
  failed: 'Ошибка оплаты',
}

export function orderStatusLabel(status) {
  if (!status) return 'Не указан'
  return ORDER_STATUS[status] || status
}

export function paymentStatusLabel(status) {
  if (!status) return 'Не указан'
  return PAYMENT_STATUS[status] || status
}

const SUGGESTION_TYPE = {
  product: 'Товар',
  category: 'Категория',
  article: 'Статья',
}

export function suggestionTypeLabel(type) {
  if (!type) return ''
  return SUGGESTION_TYPE[type] || 'Результат'
}

/** Known category slug → Russian title fallback when API omits title. */
const CATEGORY_TITLES = {
  plastiny: 'Пластины',
  vinty: 'Винты',
  instrumenty: 'Инструменты',
  shvovny: 'Шовный материал',
  nabory: 'Наборы',
  parnye: 'Парные',
  't-obraznye': 'Т-образные',
  'l-obraznye': 'L-образные',
  rekonstruktivnye: 'Реконструктивные',
  bedrennaya: 'Для бедренной кости',
  taz: 'Для таза',
  'all-plastiny': 'Все пластины',
}

/**
 * Resolve a display title for a category.
 * Never returns a raw Latin slug when a RU title is available.
 */
export function categoryTitle(categoryOrSlug, fallback = 'Категория') {
  if (!categoryOrSlug) return fallback
  if (typeof categoryOrSlug === 'string') {
    return CATEGORY_TITLES[categoryOrSlug] || fallback
  }
  return (
    categoryOrSlug.title
    || categoryOrSlug.name
    || CATEGORY_TITLES[categoryOrSlug.slug]
    || fallback
  )
}

/** Prefer last human segment of category_path, then slug map. */
export function categoryTitleFromProduct(product) {
  if (!product) return 'Категория'
  const path = product.category_path
  if (Array.isArray(path) && path.length) {
    const last = path[path.length - 1]
    if (typeof last === 'string' && /[А-Яа-яЁё]/.test(last)) return last
    if (last?.title || last?.name) return last.title || last.name
    if (last?.slug) return categoryTitle(last.slug)
  }
  return categoryTitle(product.category_slug)
}

const CYRILLIC = /[А-Яа-яЁё]/

/** Prefer API stock.label only when it looks Russian; else map by state. */
export function isRussianLabel(text) {
  return typeof text === 'string' && CYRILLIC.test(text)
}

/** Hide raw English conflict codes from cart UI. */
export function cartConflictLabel(conflict) {
  if (!conflict) return null
  if (isRussianLabel(conflict)) return conflict
  const map = {
    stock_changed: 'Наличие изменилось',
    price_changed: 'Цена изменилась',
    unavailable: 'Товар недоступен',
    quantity_unavailable: 'Недостаточно на складе',
  }
  return map[conflict] || 'Проверьте позицию в корзине'
}
