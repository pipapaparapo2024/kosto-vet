import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { BP, expectBreakpoints, readCss } from './helpers/css.js'

const src = join(process.cwd(), 'src')

function readSrc(relativePath) {
  const full = join(src, relativePath)
  expect(existsSync(full), `missing file: ${relativePath}`).toBe(true)
  return readFileSync(full, 'utf8')
}

describe('Skeleton UI', () => {
  it('exports base and page presets', () => {
    const jsx = readSrc('components/ui/Skeleton/Skeleton.jsx')
    expect(jsx).toMatch(/export function Skeleton\b/)
    expect(jsx).toMatch(/export function CatalogProductsSkeleton\b/)
    expect(jsx).toMatch(/export function ProductPageSkeleton\b/)
    expect(jsx).toMatch(/export function OrderStatusSkeleton\b/)
    expect(jsx).toMatch(/export function AuthListSkeleton\b/)
    expect(jsx).toMatch(/export function AuthProfileSkeleton\b/)
    expect(jsx).toMatch(/export function CartItemsSkeleton\b/)
    expect(jsx).toMatch(/aria-busy="true"/)
    expect(jsx).toMatch(/role="status"/)
  })

  it('has shimmer animation and reduced-motion fallback', () => {
    const css = readCss('components/ui/Skeleton/Skeleton.module.css')
    expect(css).toMatch(/@keyframes\s+shimmer/)
    expect(css).toMatch(/animation:\s*shimmer/)
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
    expect(css).toMatch(/\.catalogGrid/)
    expect(css).toMatch(/\.productGrid/)
  })

  it('is responsive across project breakpoints', () => {
    const css = readCss('components/ui/Skeleton/Skeleton.module.css')
    expectBreakpoints(css, [BP.laptop, BP.tablet, BP.mobile, BP.small], 'Skeleton')
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\.catalogGrid[\s\S]*?grid-template-columns:\s*repeat\(2/)
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*390px\s*\)[\s\S]*?\.catalogGrid[\s\S]*?grid-template-columns:\s*1fr/)
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.productGrid[\s\S]*?grid-template-columns:\s*1fr/)
  })

  it('is wired into catalog, product, order, auth and cart', () => {
    expect(readSrc('pages/CatalogPage.jsx')).toMatch(/CatalogProductsSkeleton/)
    expect(readSrc('pages/ProductPage.jsx')).toMatch(/ProductPageSkeleton/)
    expect(readSrc('pages/OrderStatusPage.jsx')).toMatch(/OrderStatusSkeleton/)
    expect(readSrc('components/ui/AuthDrawer/AuthDrawer.jsx')).toMatch(/AuthListSkeleton/)
    expect(readSrc('components/ui/AuthDrawer/AuthDrawer.jsx')).toMatch(/AuthProfileSkeleton/)
    expect(readSrc('components/ui/CartDrawer/CartDrawer.jsx')).toMatch(/CartItemsSkeleton/)
  })

  it('does not leave plain loading text as the only catalog/product state', () => {
    const catalog = readSrc('pages/CatalogPage.jsx')
    const product = readSrc('pages/ProductPage.jsx')
    expect(catalog).not.toMatch(/loading && <div className=\{styles\.empty\}>Загрузка каталога/)
    expect(product).not.toMatch(/Загрузка товара…/)
  })
})
