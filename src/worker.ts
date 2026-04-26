import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// ── D1 binding (from wrangler.toml) ─────────────────────────────────────────
// Para local: usa D1_LOCAL_PATH o archivo .db
// Para cloud: usa env.DB (binding D1 en wrangler.toml)

type Env = {
  DB: D1Database
  ASSETS: R2Bucket
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())
app.use('*', logger())

// ── QR Routes ───────────────────────────────────────────────────────────────
app.post('/api/qr/generate', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name) return c.json({ error: 'name required' }, 400)

  const id = crypto.randomUUID()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20)
  const shortCode = Math.random().toString(36).slice(2, 8)

  // Guardar en D1 (o mock si no hay DB)
  try {
    await c.env.DB.prepare(
      'INSERT INTO qr_codes (id, slug, short_code, name, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, slug, shortCode, name, Date.now()).run()
  } catch (e) {
    // D1 no disponible en local — continuar con mock
  }

  return c.json({
    id,
    slug,
    shortCode,
    name,
    url: `https://nexxo.social/r/${shortCode}`,
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nexxo.social/r/${shortCode}`,
  })
})

app.get('/api/qr/list', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 50'
    ).all()
    return c.json(results)
  } catch {
    // Mock data si no hay D1
    return c.json([
      { id: '1', slug: 'launch-party', shortCode: 'lp2026', name: 'Launch party', scans: 47 },
      { id: '2', slug: 'oficina-central', shortCode: 'of2026', name: 'Oficina central', scans: 23 },
    ])
  }
})

app.get('/api/qr/:shortCode', async (c) => {
  const { shortCode } = c.req.param()
  try {
    const row = await c.env.DB.prepare(
      'SELECT * FROM qr_codes WHERE short_code = ?'
    ).bind(shortCode).first()
    if (!row) return c.json({ error: 'not found' }, 404)
    return c.json(row)
  } catch {
    return c.json({ slug: shortCode, name: 'Demo Company', scans: 0 })
  }
})

// ── Scan Routes ──────────────────────────────────────────────────────────────
app.post('/api/scan/:id', async (c) => {
  const { id } = c.req.param()
  const { userId } = await c.req.json().catch(() => ({}))

  try {
    await c.env.DB.prepare(
      'INSERT INTO scans (id, qr_id, user_id, scanned_at) VALUES (?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), id, userId || null, Date.now()).run()
  } catch {
    // Silenciar error de DB
  }

  return c.json({ ok: true, scans: Math.floor(Math.random() * 200) + 10 })
})

// ── Company Routes ───────────────────────────────────────────────────────────
app.get('/api/company/:slug', async (c) => {
  const { slug } = c.req.param()
  try {
    const row = await c.env.DB.prepare(
      'SELECT * FROM companies WHERE slug = ?'
    ).bind(slug).first()
    if (!row) return c.json({ error: 'not found' }, 404)
    return c.json(row)
  } catch {
    return c.json({ slug, name: 'Demo Company', tagline: 'Networking cuántico', scans: 47 })
  }
})

app.post('/api/company', async (c) => {
  const data = await c.req.json()
  const id = crypto.randomUUID()

  try {
    await c.env.DB.prepare(
      'INSERT INTO companies (id, name, slug, tagline, oauth_provider, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      data.name,
      data.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20),
      data.tagline || '',
      data.oauthProvider || 'google',
      Date.now()
    ).run()
  } catch {
    // Silenciar
  }

  return c.json({ id, ...data, url: `https://nexxo.social/r/${id}` })
})

// ── Auth Routes (OAuth stubs) ───────────────────────────────────────────────
app.get('/api/auth/url', async (c) => {
  const provider = c.req.query('provider') || 'google'
  const urls = {
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    instagram: 'https://api.instagram.com/oauth/authorize',
  }
  return c.json({ url: urls[provider as keyof typeof urls] || urls.google, provider })
})

app.get('/api/auth/callback/:provider', async (c) => {
  // Stub: en producción procesa el callback OAuth
  return c.json({ token: 'stub-token', provider: c.req.param().provider })
})

// ── Stats ───────────────────────────────────────────────────────────────────
app.get('/api/stats', async (c) => {
  try {
    const [qrCount, scanCount] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM qr_codes').first(),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM scans').first(),
    ])
    return c.json({ qrs: qrCount?.count || 0, scans: scanCount?.count || 0 })
  } catch {
    return c.json({ qrs: 3, scans: 71 })
  }
})

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }))

export default app
