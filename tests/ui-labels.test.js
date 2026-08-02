import { describe, expect, it } from 'vitest'
import {
  categoryTitle,
  categoryTitleFromProduct,
  orderStatusLabel,
  paymentStatusLabel,
  stockStateLabel,
  suggestionTypeLabel,
  cartConflictLabel,
  STOCK_STATE_OPTIONS,
} from '../src/lib/labels.js'
import { stockLabel } from '../src/lib/money.js'

describe('UI Russian labels', () => {
  it('maps stock filter options without English parentheses', () => {
    const labels = STOCK_STATE_OPTIONS.map(o => o.label).join(' ')
    expect(labels).not.toMatch(/available|low|out\b/i)
    expect(stockStateLabel('available')).toBe('Много')
    expect(stockStateLabel('low')).toBe('Мало')
    expect(stockStateLabel('out')).toBe('Нет в наличии')
  })

  it('never shows raw category slug as title for known categories', () => {
    expect(categoryTitle('plastiny')).toBe('Пластины')
    expect(categoryTitle({ slug: 'vinty' })).toBe('Винты')
    expect(categoryTitle({ title: 'Пластины', slug: 'plastiny' })).toBe('Пластины')
    expect(categoryTitleFromProduct({ category_slug: 'plastiny' })).toBe('Пластины')
  })

  it('maps order and payment statuses to Russian', () => {
    expect(orderStatusLabel('awaiting_payment')).toBe('Ожидает оплаты')
    expect(paymentStatusLabel('succeeded')).toBe('Оплачено')
    expect(suggestionTypeLabel('product')).toBe('Товар')
    expect(suggestionTypeLabel('category')).toBe('Категория')
  })

  it('ignores English stock.label from API', () => {
    expect(stockLabel({ state: 'available', label: 'available' })).toBe('В наличии')
    expect(stockLabel({ state: 'low', label: 'Мало на складе' })).toBe('Мало на складе')
  })

  it('localizes cart conflict codes', () => {
    expect(cartConflictLabel('stock_changed')).toBe('Наличие изменилось')
    expect(cartConflictLabel('Цена изменилась')).toBe('Цена изменилась')
  })
})
