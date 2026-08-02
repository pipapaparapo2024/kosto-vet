import { describe, expect, it } from 'vitest'
import { BP, FORBIDDEN_BPS, expectBreakpoints, mediaMaxWidths, readCss } from './helpers/css.js'

/** Pages/components that must have tablet+mobile media (plan stages 2–6). */
const COVERAGE = [
  {
    file: 'pages/HomePage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustInclude: ['.catalogLayout', '.catalogGrid', '.catalogCat'],
    mustNotInclude: ['.catalogInner', '.catalogCards', '.catalogTop', '.catalogCatWrap'],
  },
  {
    file: 'pages/NotFoundPage.module.css',
    required: [BP.tablet, BP.mobile],
    mustMatch: [/font-size:\s*clamp\(96px/, /\.cat\s*\{[\s\S]*max-width:\s*100%/],
  },
  {
    file: 'pages/CatalogPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustMatch: [
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.filters[\s\S]*?width:\s*100%/,
      /@media\s*\(\s*max-width:\s*390px\s*\)[\s\S]*?\.grid[\s\S]*?grid-template-columns:\s*1fr/,
    ],
  },
  {
    file: 'components/layout/Header/Header.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile],
    mustMatch: [
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.nav\s*\{\s*display:\s*none/,
      /\.iconBtn[\s\S]*?width:\s*44px/,
      /\.iconBtn[\s\S]*?height:\s*44px/,
    ],
  },
  {
    file: 'components/layout/Footer/Footer.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile],
    mustMatch: [/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\.catImg\s*\{\s*display:\s*none/],
  },
  {
    file: 'pages/ProductPage.module.css',
    required: [BP.tablet, BP.mobile, BP.small],
    mustMatch: [/font-size:\s*clamp\(/],
  },
  {
    file: 'pages/CheckoutPage.module.css',
    required: [BP.tablet, BP.mobile, BP.small],
  },
  {
    file: 'pages/OrderStatusPage.module.css',
    required: [BP.mobile, BP.small],
  },
  {
    file: 'pages/DocumentsPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustMatch: [
      /\.containerWide[\s\S]*?padding:\s*0\s*130px/,
      /@media\s*\(\s*max-width:\s*1280px\s*\)[\s\S]*?\.containerWide[\s\S]*?var\(--space-x\)/,
    ],
  },
  {
    file: 'pages/BlogArticlePage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile],
    mustMatch: [/@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.article\s*\{\s*order:\s*1/],
  },
  {
    file: 'pages/AboutPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustMatch: [/@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.whyList[\s\S]*?flex-direction:\s*column/],
  },
  {
    file: 'pages/DeliveryPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustMatch: [/@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.step[\s\S]*?height:\s*auto/],
  },
  {
    file: 'pages/ContactsPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
    mustMatch: [
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.mapPlaceholder[\s\S]*?width:\s*100%/,
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.mapInfo[\s\S]*?width:\s*100%/,
      /@media\s*\(\s*max-width:\s*1024px\s*\)[\s\S]*?\.faqList[\s\S]*?grid-template-columns:\s*1fr/,
    ],
  },
  {
    file: 'pages/BlogPage.module.css',
    required: [BP.laptop, BP.tablet, BP.mobile, BP.small],
  },
]

describe('responsive CSS coverage (plan stages 2–6)', () => {
  for (const entry of COVERAGE) {
    describe(entry.file, () => {
      const css = readCss(entry.file)

      it(`has required breakpoints: ${entry.required.join(', ')}`, () => {
        expectBreakpoints(css, entry.required, entry.file)
      })

      if (entry.mustInclude) {
        it('uses live class selectors', () => {
          for (const sel of entry.mustInclude) {
            expect(css.includes(sel), `${entry.file} should contain ${sel}`).toBe(true)
          }
        })
      }

      if (entry.mustNotInclude) {
        it('does not reference dead catalog selectors in media rules', () => {
          const mediaBlocks = css.match(/@media[^{]+\{[\s\S]*?\n\}/g) || []
          const mediaText = mediaBlocks.join('\n')
          for (const sel of entry.mustNotInclude) {
            expect(mediaText.includes(sel), `dead selector ${sel} in media of ${entry.file}`).toBe(false)
          }
        })
      }

      if (entry.mustMatch) {
        it('matches critical layout rules', () => {
          for (const re of entry.mustMatch) {
            expect(css, `${entry.file} failed ${re}`).toMatch(re)
          }
        })
      }
    })
  }
})

describe('forbidden ad-hoc breakpoints', () => {
  const files = COVERAGE.map(e => e.file).concat([
    'styles/tokens.css',
    'components/ui/AuthDrawer/AuthDrawer.module.css',
    'components/ui/CartDrawer/CartDrawer.module.css',
    'pages/OrderDrawer.module.css',
  ])

  for (const file of files) {
    it(`${file} avoids ${FORBIDDEN_BPS.join('/')}`, () => {
      const found = mediaMaxWidths(readCss(file))
      for (const bp of FORBIDDEN_BPS) {
        expect(found.has(bp), `${file} still uses max-width: ${bp}px`).toBe(false)
      }
    })
  }
})
