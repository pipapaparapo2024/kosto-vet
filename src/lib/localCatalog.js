import { CATEGORIES, PRODUCTS } from '../data/catalog'
import { img } from '../utils/assetUrl'

function money(rubles) {
  if (rubles == null || Number.isNaN(Number(rubles))) return { amount: null, currency: 'RUB' }
  return { amount: Math.round(Number(rubles) * 100), currency: 'RUB' }
}

function stock(inStock) {
  return inStock
    ? { state: 'available', quantity: 10, label: 'В наличии' }
    : { state: 'out', quantity: 0, label: 'Нет в наличии' }
}

function parseDimensions(dim) {
  if (!dim) return { length: null, width: null }
  const [length, width] = String(dim).split('/')
  return {
    length: length?.replace(/[^\d,.]/g, '').trim() || null,
    width: width?.replace(/[^\d,.]/g, '').trim() || null,
  }
}

function buildSpecs(product) {
  const v = product.variants?.[0]
  const { length, width } = parseDimensions(v?.dimensions)
  return [
    { name: 'Длина', value: length || '58', unit: 'мм' },
    { name: 'Кол-во отверстий', value: String(v?.holes ?? 6), unit: '' },
    { name: 'Ширина', value: width || '10', unit: 'мм' },
    { name: 'Толщина', value: v?.thickness || '2,5', unit: 'мм' },
    { name: 'Материал', value: product.material || 'Сплав титана', unit: '' },
  ]
}

function toImage(product) {
  if (!product.image) return null
  const url = product.image.startsWith('http') || product.image.startsWith('/')
    ? product.image
    : img(product.image)
  return {
    url,
    alt: product.name,
    variants: [
      { kind: 'card', format: 'png', url, width: 400, height: 400 },
      { kind: 'detail', format: 'png', url, width: 800, height: 800 },
    ],
  }
}

function countByCategory(slug) {
  return PRODUCTS.filter(p => p.category === slug).length
}

function matchesQuery(product, q) {
  if (!q) return true
  const hay = [
    product.name,
    product.shortName,
    product.description,
    product.category,
    ...(product.variants || []).map(v => v.sku),
  ].filter(Boolean).join(' ').toLowerCase()
  return hay.includes(q.toLowerCase())
}

function toSummary(product) {
  const image = toImage(product)
  const article = product.variants?.[0]?.sku || product.slug
  return {
    id: product.id,
    slug: product.slug,
    category_slug: product.category,
    category_path: product.category,
    name: product.name,
    subtitle: product.shortName || '',
    article,
    price: money(product.price ?? product.variants?.[0]?.price),
    image,
    stock: stock(product.inStock !== false),
    specs_preview: product.material
      ? [{ name: 'Материал', value: product.material }]
      : [],
  }
}

function toDetail(product) {
  const summary = toSummary(product)
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)
    .map(toSummary)
  const accessories = PRODUCTS
    .filter(p => {
      if (product.category === 'plastiny') return p.category === 'vinty' || p.category === 'instrumenty'
      return p.category !== product.category
    })
    .slice(0, 4)
    .map(toSummary)

  return {
    ...summary,
    description: product.description || '',
    specs: buildSpecs(product),
    images: summary.image ? [summary.image] : [],
    related,
    accessories,
    seo: { title: product.name, description: product.description || '' },
    variants: product.variants || [],
    material: product.material || 'Сплав титана',
  }
}

function sortProducts(list, sort) {
  const arr = [...list]
  switch (sort) {
    case 'price_asc':
      return arr.sort((a, b) => (a.price?.amount ?? 1e12) - (b.price?.amount ?? 1e12))
    case 'price_desc':
      return arr.sort((a, b) => (b.price?.amount ?? -1) - (a.price?.amount ?? -1))
    case 'name_asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    case 'stock_desc':
      return arr.sort((a, b) => Number(b.stock?.state === 'available') - Number(a.stock?.state === 'available'))
    default:
      return arr
  }
}

/** Top-level category cards for /catalog (design row with “Фото товара”). */
export function localCategories() {
  return CATEGORIES.map(c => {
    const count = countByCategory(c.slug)
    return {
      id: `local-cat-${c.slug}`,
      parent_id: null,
      parent_slug: null,
      slug: c.slug,
      path: c.slug,
      title: c.name,
      description: '',
      depth: 0,
      is_leaf: true,
      direct_product_count: count,
      subtree_product_count: count,
      children: [],
      seo: { title: c.name, description: '' },
    }
  })
}

export function localCategoryDetail(slug) {
  const cat = localCategories().find(c => c.slug === slug)
  if (!cat) return null
  return { ...cat, ancestors: [], children: [] }
}

export function localListProducts({
  category,
  q,
  inStock,
  stockState,
  sort = 'popular',
  page = 1,
  limit = 24,
} = {}) {
  let source = PRODUCTS
  if (category) source = source.filter(p => p.category === category)
  if (q) source = source.filter(p => matchesQuery(p, q.trim()))

  let items = source.map(toSummary)

  if (inStock) {
    items = items.filter(p => p.stock?.state === 'available' || p.stock?.state === 'low')
  }
  if (stockState) {
    items = items.filter(p => p.stock?.state === stockState)
  }

  items = sortProducts(items, sort)
  const total = items.length
  const start = Math.max(0, (page - 1) * limit)
  return {
    items: items.slice(start, start + limit),
    page,
    limit,
    total,
  }
}

export function localGetProduct(slug) {
  const product = PRODUCTS.find(p => p.slug === slug || p.id === slug)
  if (!product) return null
  return toDetail(product)
}

export function localSearchSuggestions(q) {
  if (!q || q.trim().length < 2) return { items: [] }
  const needle = q.trim()
  const products = PRODUCTS.filter(p => matchesQuery(p, needle)).slice(0, 6).map(p => ({
    type: 'product',
    title: p.name,
    url: `/catalog/${p.category}/${p.slug}`,
    slug: p.slug,
  }))
  const categories = CATEGORIES
    .filter(c => c.name.toLowerCase().includes(needle.toLowerCase()))
    .map(c => ({
      type: 'category',
      title: c.name,
      url: `/catalog/${c.slug}`,
      slug: c.slug,
    }))
  return { items: [...categories, ...products].slice(0, 8) }
}
