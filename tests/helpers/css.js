import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(process.cwd(), 'src')

export function readCss(relativePath) {
  const full = join(root, relativePath)
  expect(existsSync(full), `missing file: ${relativePath}`).toBe(true)
  return readFileSync(full, 'utf8')
}

export function mediaMaxWidths(css) {
  const widths = new Set()
  for (const match of css.matchAll(/@media\s*\(\s*max-width:\s*(\d+)px\s*\)/g)) {
    widths.add(Number(match[1]))
  }
  return widths
}

export function expectBreakpoints(css, required, label) {
  const found = mediaMaxWidths(css)
  for (const bp of required) {
    expect(found.has(bp), `${label} missing @media (max-width: ${bp}px)`).toBe(true)
  }
}

/** CLAUDE.md / tokens contract */
export const BP = {
  laptop: 1280,
  tablet: 1024,
  mobile: 768,
  small: 390,
}

export const FORBIDDEN_BPS = [900, 1100, 1200, 540, 480]
