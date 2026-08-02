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

export function stockLabel(stock, { withQuantity = true } = {}) {
  if (!stock) return 'Наличие неизвестно'

  const qty = stock.quantity
  const withQty = (base) => {
    if (withQuantity && qty != null && Number(qty) > 0) return `${base} ${Number(qty)} шт.`
    return base
  }

  if (stock.label && /[А-Яа-яЁё]/.test(stock.label)) {
    const label = stock.label.trim()
    if (/в наличии/i.test(label) && !/\d+\s*шт/i.test(label)) return withQty(label)
    return label
  }

  switch (stock.state) {
    case 'available': return withQty('В наличии')
    case 'low': return withQty('Мало на складе')
    case 'out': return 'Нет в наличии'
    default: return 'Наличие уточняется'
  }
}

/** Строка характеристик для карточки: «6 мм · 4 отв. · сталь». */
export function productSpecsLine(product) {
  if (!product) return ''
  if (product.specs_line) return product.specs_line

  const specs = product.specs_preview || product.specs || []
  if (!Array.isArray(specs) || !specs.length) return ''

  const find = (...names) => specs.find(s => names.some(n => String(s.name || '').toLowerCase().includes(n)))
  const width = find('ширин')
  const length = find('длин')
  const holes = find('отверст')
  const material = find('материал')

  const parts = []
  const mmSpec = width || length
  if (mmSpec?.value != null && mmSpec.value !== '') {
    const unit = mmSpec.unit || 'мм'
    parts.push(`${mmSpec.value}${unit ? ` ${unit}` : ''}`)
  }
  if (holes?.value != null && holes.value !== '') {
    parts.push(`${holes.value} отв.`)
  }
  if (material?.value) {
    const raw = String(material.value).toLowerCase()
    const short = raw.includes('титан') ? 'титан' : raw.includes('сталь') ? 'сталь' : raw.split(/\s+/).pop()
    parts.push(short)
  }
  return parts.join(' · ')
}

/** Pick best image URL from ProductImage / variants. */
export function productImageUrl(image, kind = 'card') {
  if (!image) return null
  const variant = image.variants?.find(v => v.kind === kind && v.format === 'webp')
    || image.variants?.find(v => v.kind === kind)
    || image.variants?.[0]
  return variant?.url || image.url || null
}
