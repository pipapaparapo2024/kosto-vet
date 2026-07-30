/**
 * Smoke-test against local/prod FastAPI (OpenAPI v1).
 * Usage:
 *   node scripts/smoke-api.mjs
 *   node scripts/smoke-api.mjs https://api.kosto-vet.ru
 */

const BASE = (process.argv[2] || 'http://localhost:8000').replace(/\/$/, '')

async function check(name, path, { method = 'GET', expect = [200], body, headers = {} } = {}) {
  const url = `${BASE}${path}`
  const init = { method, headers: { ...headers }, redirect: 'manual' }
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  try {
    const res = await fetch(url, init)
    const ok = expect.includes(res.status)
    const mark = ok ? 'OK ' : 'FAIL'
    console.log(`${mark}  ${res.status}  ${name}  ${path}`)
    if (!ok) {
      const text = await res.text().catch(() => '')
      if (text) console.log(`      ${text.slice(0, 200)}`)
    }
    return { ok, status: res.status, res }
  } catch (e) {
    console.log(`FAIL  ---  ${name}  ${path}`)
    console.log(`      ${e.message}`)
    return { ok: false, error: e }
  }
}

async function main() {
  console.log(`Smoke API: ${BASE}\n`)

  const results = []
  results.push(await check('liveness', '/health/live'))
  results.push(await check('readiness', '/health/ready', { expect: [200, 503] }))
  results.push(await check('public settings', '/api/v1/settings/public'))
  results.push(await check('categories', '/api/v1/catalog/categories'))
  results.push(await check('products', '/api/v1/catalog/products?limit=1'))
  results.push(await check('search suggestions', '/api/v1/catalog/search-suggestions?q=пл', { expect: [200, 400] }))
  results.push(await check('me (anon)', '/api/v1/account/me', { expect: [401] }))
  results.push(await check('lead validation', '/api/v1/leads', {
    method: 'POST',
    expect: [400, 422, 429],
    headers: { 'Idempotency-Key': `smoke-${Date.now()}` },
    body: { name: 'a', phone: '1', consent: true, website: '' },
  }))

  const failed = results.filter(r => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  process.exit(failed ? 1 : 0)
}

main()
