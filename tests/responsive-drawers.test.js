import { describe, expect, it } from 'vitest'
import { readCss } from './helpers/css.js'

const DRAWERS = [
  'components/ui/CartDrawer/CartDrawer.module.css',
  'components/ui/AuthDrawer/AuthDrawer.module.css',
  'pages/OrderDrawer.module.css',
]

describe('drawer width pattern', () => {
  for (const file of DRAWERS) {
    it(`${file} uses min(var(--drawer-width), 100%)`, () => {
      const css = readCss(file)
      expect(css).toMatch(/width:\s*min\(\s*var\(--drawer-width\)\s*,\s*100%\s*\)/)
    })
  }
})
