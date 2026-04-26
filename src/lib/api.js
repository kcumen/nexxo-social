// API local de Cloudflare Workers (emulado con wrangler dev)
// Si no hay backend, usa mocks

const BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  // QR
  generateQR(companyName) {
    return request('POST', '/qr/generate', { name: companyName })
  },

  getQRs() {
    return request('GET', '/qr/list')
  },

  // Companies
  getCompany(slug) {
    return request('GET', `/company/${slug}`)
  },

  createCompany(data) {
    return request('POST', '/company', data)
  },

  // Scans
  registerScan(qrId) {
    return request('POST', `/scan/${qrId}`)
  },

  // Auth
  oauthUrl(provider) {
    return request('GET', `/auth/url?provider=${provider}`)
  },
}
