import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BP, readCss } from './helpers/css.js'

/**
 * Automated checks for plan Stage 7 QA checklist.
 * Visual pixel QA remains manual; these assert structural readiness.
 */
describe('QA checklist — structural readiness', () => {
  it('Home hides decorative cats and stacks catalog at tablet', () => {
    const css = readCss('pages/HomePage.module.css')
    expect(css).toMatch(
      new RegExp(
        `@media\\s*\\(\\s*max-width:\\s*${BP.tablet}px\\s*\\)[\\s\\S]*?\\.heroRight[\\s\\S]*?display:\\s*none`,
      ),
    )
    expect(css).toMatch(
      new RegExp(
        `@media\\s*\\(\\s*max-width:\\s*${BP.tablet}px\\s*\\)[\\s\\S]*?\\.ctaRight[\\s\\S]*?display:\\s*none`,
      ),
    )
    expect(css).toMatch(
      new RegExp(
        `@media\\s*\\(\\s*max-width:\\s*${BP.tablet}px\\s*\\)[\\s\\S]*?\\.catalogLayout[\\s\\S]*?grid-template-columns:\\s*1fr`,
      ),
    )
    expect(css).toMatch(
      new RegExp(
        `@media\\s*\\(\\s*max-width:\\s*${BP.tablet}px\\s*\\)[\\s\\S]*?\\.catalogCat[\\s\\S]*?display:\\s*none`,
      ),
    )
  })

  it('Catalog filters go full-width above grid at tablet', () => {
    const css = readCss('pages/CatalogPage.module.css')
    expect(css).toMatch(
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.layout[\s\S]*?grid-template-columns:\s*1fr/,
    )
    expect(css).toMatch(
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.filters[\s\S]*?width:\s*100%/,
    )
  })

  it('Product stacks main grid at tablet', () => {
    const css = readCss('pages/ProductPage.module.css')
    expect(css).toMatch(
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.grid[\s\S]*?grid-template-columns:\s*1fr/,
    )
  })

  it('Checkout and order status have mobile media', () => {
    expect(readCss('pages/CheckoutPage.module.css')).toMatch(/max-width:\s*768px/)
    expect(readCss('pages/OrderStatusPage.module.css')).toMatch(/max-width:\s*768px/)
  })

  it('Documents agreement TOC collapses at tablet', () => {
    const css = readCss('pages/DocumentsPage.module.css')
    expect(css).toMatch(
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.agreementLayout[\s\S]*?grid-template-columns:\s*1fr/,
    )
  })

  it('Header burger nav and full-width menu on mobile', () => {
    const css = readCss('components/layout/Header/Header.module.css')
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.nav\s*\{\s*display:\s*none/)
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\.menuPanel[\s\S]*?width:\s*100%/)
  })

  it('404 numeral uses clamp and hides cat on mobile', () => {
    const css = readCss('pages/NotFoundPage.module.css')
    expect(css).toMatch(/\.code[\s\S]*?font-size:\s*clamp\(/)
    expect(css).toMatch(/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\.right[\s\S]*?display:\s*none/)
  })

  it('main.jsx loads responsive contract stylesheet', () => {
    const main = readFileSync(join(process.cwd(), 'src/main.jsx'), 'utf8')
    expect(main).toMatch(/import\s+['"]\.\/styles\/tokens\.css['"]/)
    expect(main).toMatch(/import\s+['"]\.\/styles\/responsive\.css['"]/)
  })
})
