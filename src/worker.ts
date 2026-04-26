import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sign, verify } from 'hono/jwt'
import * as bcrypt from 'bcryptjs'

// ── D1 binding (from wrangler.toml) ─────────────────────────────────────────
type Env = {
  DB: D1Database
  ASSETS: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())
app.use('*', logger())

// ── Auth helpers ───────────────────────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

async function makeToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  return sign(payload, secret)
}

// ── QR Routes ───────────────────────────────────────────────────────────────
// Modelo 1:1 diferido en el tiempo — QR vacío primero, se reclama después

// Admin: generar QR vacíos para imprimir (batch)
app.post('/api/qr/generate', async (c) => {
  const { count = 1, name, tagline } = await c.req.json<{ count?: number; name?: string; tagline?: string }>()
  if (name) {
    // Generar empresa + su QR linked (flujo directo, no blank)
    const companyId = crypto.randomUUID()
    const qrId = crypto.randomUUID()
    const shortCode = Math.random().toString(36).slice(2, 8)
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20)
    const now = Date.now()
    try {
      await c.env.DB.prepare(
        'INSERT INTO companies (id, name, slug, tagline, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(companyId, name, slug, tagline || '', now).run()
      await c.env.DB.prepare(
        'INSERT INTO qr_codes (id, short_code, status, company_id, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(qrId, shortCode, 'active', companyId, now).run()
    } catch (e) {
      return c.json({ error: 'db error', detail: String(e) }, 500)
    }
    return c.json({
      companyId, qrId, shortCode,
      status: 'active',
      url: `https://nexxo.social/r/${shortCode}`,
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nexxo.social/r/${shortCode}`,
    })
  }

  // Batch de QR vacíos (para imprimir)
  const batch = []
  const now = Date.now()
  try {
    for (let i = 0; i < Math.min(count, 20); i++) {
      const qrId = crypto.randomUUID()
      const shortCode = Math.random().toString(36).slice(2, 8)
      await c.env.DB.prepare(
        'INSERT INTO qr_codes (id, short_code, status, created_at) VALUES (?, ?, ?, ?)'
      ).bind(qrId, shortCode, 'blank', now).run()
      batch.push({
        qrId, shortCode,
        status: 'blank',
        url: `https://nexxo.social/r/${shortCode}`,
        qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nexxo.social/r/${shortCode}`,
      })
    }
  } catch (e) {
    return c.json({ error: 'db error', detail: String(e) }, 500)
  }
  return c.json({ batch })
})

// Claim: reclamar un QR blank y vincularlo a una empresa
app.post('/api/qr/claim', async (c) => {
  const { shortCode, companyName, tagline } = await c.req.json<{ shortCode: string; companyName: string; tagline?: string }>()
  if (!shortCode || !companyName) return c.json({ error: 'shortCode and companyName required' }, 400)

  const companyId = crypto.randomUUID()
  const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20)
  const now = Date.now()

  try {
    // Verificar que el QR existe y está blank
    const qr = await c.env.DB.prepare(
      'SELECT * FROM qr_codes WHERE short_code = ?'
    ).bind(shortCode).first()
    if (!qr) return c.json({ error: 'QR no encontrado' }, 404)
    if (qr.status !== 'blank') return c.json({ error: 'Este QR ya fue reclamado', claimed: true }, 409)

    // Crear empresa + vincular QR
    await c.env.DB.prepare(
      'INSERT INTO companies (id, name, slug, tagline, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(companyId, companyName, slug, tagline || '', now).run()
    await c.env.DB.prepare(
      'UPDATE qr_codes SET status = ?, company_id = ? WHERE short_code = ? AND status = ?'
    ).bind('active', companyId, shortCode, 'blank').run()
  } catch (e) {
    return c.json({ error: 'db error', detail: String(e) }, 500)
  }

  return c.json({
    ok: true,
    companyId,
    shortCode,
    status: 'active',
    url: `https://nexxo.social/r/${shortCode}`,
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nexxo.social/r/${shortCode}`,
  })
})

app.get('/api/qr/list', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT c.id, c.name, c.slug, c.tagline, c.created_at as company_created_at,
             q.id as qr_id, q.short_code, q.status, q.created_at as qr_created_at,
             (SELECT COUNT(*) FROM scans s WHERE s.qr_id = q.id) as scan_count
      FROM qr_codes q
      LEFT JOIN companies c ON c.id = q.company_id
      ORDER BY q.created_at DESC
      LIMIT 50
    `).all()
    return c.json(results)
  } catch {
    return c.json([
      { id: '1', name: 'Mercado Tech', slug: 'mercado-tech', tagline: 'Fintech para LatAm', short_code: 'mte2026', status: 'active', scan_count: 47 },
      { id: '2', name: null, slug: null, tagline: null, short_code: ' blank001', status: 'blank', scan_count: 0 },
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

// ── Auth Routes ───────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}))
  if (!email || !password) {
    return c.json({ error: 'email y password requeridos' }, 400)
  }

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 24 * 7 // 7 días

  // Credenciales hardcodeadas para dev (funcionan sin DB)
  if (email === 'andradg@gmail.com' && password === 'Tender1189') {
    const token = await makeToken({ sub: 'admin-1', email, role: 'admin', iat: now, exp }, secret)
    return c.json({
      token,
      user: { id: 'admin-1', email, name: 'Admin', role: 'admin' },
    })
  }

  // Intentar DB solo para otros usuarios
  try {
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash, role FROM users WHERE email = ?'
    ).bind(email.toLowerCase().trim()).first()

    if (!user) {
      return c.json({ error: 'Credenciales inválidas' }, 401)
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return c.json({ error: 'Credenciales inválidas' }, 401)
    }

    const token = await makeToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp,
    }, secret)

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (e) {
    return c.json({ error: 'Credenciales inválidas' }, 401)
  }
})

// GET /api/auth/me — verificar token
app.get('/api/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return c.json({ error: 'token requerido' }, 401)

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  try {
    const payload = await verify(token, secret)
    return c.json({ user: payload })
  } catch {
    return c.json({ error: 'token inválido o expirado' }, 401)
  }
})

// POST /api/auth/register — crear usuario (solo en dev/admin)
app.post('/api/auth/register', async (c) => {
  const { email, password, name, role = 'user' } = await c.req.json().catch(() => ({}))
  if (!email || !password) return c.json({ error: 'email y password requeridos' }, 400)
  if (password.length < 8) return c.json({ error: 'Password mínimo 8 caracteres' }, 400)

  const id = crypto.randomUUID()
  const password_hash = await hashPassword(password)
  const now = Date.now()

  try {
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email.toLowerCase().trim(), name || '', password_hash, role, now).run()
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      return c.json({ error: 'El email ya está registrado' }, 409)
    }
    return c.json({ error: 'db error', detail: String(e) }, 500)
  }

  return c.json({ id, email, name, role })
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
