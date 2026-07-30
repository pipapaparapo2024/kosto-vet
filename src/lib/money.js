/** Format OpenAPI Money { amount: kopecks, currency } for UI. */
export function formatMoney(money, { empty = 'Цена по запросу' } = {}) {
  if (!money || money.amount == null) return empty
  const rubles = money.amount / 100
  return `${rubles.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`
}

export function moneyToNumber(money) {
  if (!money || money.amount == null) return null
  return money.amount / 100
}

export function isInStock(stock) {
  if (!stock) return false
  return stock.state === 'available' || stock.state === 'low'
}

export function stockLabel(stock) {
  if (!stock) return 'Наличие неизвестно'
  if (stock.label) return stock.label
  switch (stock.state) {
    case 'available': return 'В наличии'
    case 'low': return 'Мало на складе'
    case 'out': return 'Нет в наличии'
    default: return 'Наличие уточняется'
  }
}

/** Pick best image URL from ProductImage / variants. */
export function productImageUrl(image, kind = 'card') {
  if (!image) return null
  const variant = image.variants?.find(v => v.kind === kind && v.format === 'webp')
    || image.variants?.find(v => v.kind === kind)
    || image.variants?.[0]
  return variant?.url || image.url || null
}
