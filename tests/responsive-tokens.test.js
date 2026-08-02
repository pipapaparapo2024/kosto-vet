import { describe, expect, it } from 'vitest'
import { BP, readCss } from './helpers/css.js'

describe('responsive tokens contract', () => {
  const tokens = readCss('styles/tokens.css')
  const responsiveDoc = readCss('styles/responsive.css')

  it('declares CLAUDE breakpoint variables', () => {
    expect(tokens).toMatch(/--bp-desktop:\s*1440px/)
    expect(tokens).toMatch(/--bp-laptop:\s*1280px/)
    expect(tokens).toMatch(/--bp-tablet:\s*1024px/)
    expect(tokens).toMatch(/--bp-mobile:\s*768px/)
    expect(tokens).toMatch(/--bp-small:\s*390px/)
  })

  it('sets desktop --space-x and content width', () => {
    expect(tokens).toMatch(/--space-x:\s*75px/)
    expect(tokens).toMatch(/--space-content:\s*1320px/)
    expect(tokens).toMatch(/--drawer-width:\s*480px/)
  })

  it('scales --space-x at laptop / tablet / mobile', () => {
    expect(tokens).toMatch(
      new RegExp(`@media\\s*\\(\\s*max-width:\\s*${BP.laptop}px\\s*\\)[\\s\\S]*?--space-x:\\s*48px`),
    )
    expect(tokens).toMatch(
      new RegExp(`@media\\s*\\(\\s*max-width:\\s*${BP.tablet}px\\s*\\)[\\s\\S]*?--space-x:\\s*32px`),
    )
    expect(tokens).toMatch(
      new RegExp(`@media\\s*\\(\\s*max-width:\\s*${BP.mobile}px\\s*\\)[\\s\\S]*?--space-x:\\s*16px`),
    )
  })

  it('exposes fluid heading tokens via clamp', () => {
    expect(tokens).toMatch(/--text-h1:\s*clamp\(/)
    expect(tokens).toMatch(/--text-h2:\s*clamp\(/)
  })

  it('documents the responsive contract', () => {
    expect(responsiveDoc).toMatch(/1280/)
    expect(responsiveDoc).toMatch(/1024/)
    expect(responsiveDoc).toMatch(/768/)
    expect(responsiveDoc).toMatch(/390/)
    expect(responsiveDoc).toMatch(/min\(var\(--drawer-width\),\s*100%\)/)
  })
})
