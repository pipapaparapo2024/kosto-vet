export function cartEtag(version) {
  return `"${Number(version) || 0}"`
}

/** Redirect browser to Robokassa (sandbox) confirmation. */
export function redirectToPayment(payment) {
  if (!payment?.confirmation_url) {
    throw new Error('Нет ссылки на оплату')
  }
  if (payment.confirmation_method === 'redirect_post') {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = payment.confirmation_url
    form.style.display = 'none'
    Object.entries(payment.form_fields || {}).forEach(([name, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    return
  }
  window.location.href = payment.confirmation_url
}

export function formatFieldErrors(fieldErrors) {
  if (!fieldErrors?.length) return null
  return fieldErrors.map(e => e.message || `${e.field}: ${e.code}`).join('. ')
}
