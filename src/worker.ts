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

    // Actualizar nombre del usuario si está logueado y no tiene nombre
    const authHeader = c.req.header('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (token) {
      const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
      try {
        const payload = await verify(token, secret)
        if (payload.sub) {
          await c.env.DB.prepare('UPDATE users SET name = ? WHERE id = ? AND name IS NULL').bind(companyName, payload.sub).run()
        }
      } catch {}
    }
  } catch (e) {
    return c.json({ error: 'db error', detail: String(e) }, 500)
  }

  return c.json({
    ok: true,
    companyId,
    shortCode,
    status: 'active',
    url: `https://nexxo.social/r/${shortCode}`,
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

app.post('/api/qr/delete', async (c) => {
  const { ids } = await c.req.json().catch(() => ({}))
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: 'ids requerido' }, 400)
  }
  try {
    // Solo eliminar QRs en status 'blank' (no reclamados)
    const placeholders = ids.map(() => '?').join(',')
    const { meta } = await c.env.DB.prepare(
      `DELETE FROM qr_codes WHERE id IN (${placeholders}) AND status = 'blank'`
    ).bind(...ids).run()
    return c.json({ deleted: meta.changes, requested: ids.length })
  } catch (e) {
    return c.json({ error: 'db error', detail: String(e) }, 500)
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
app.post('/api/scan/:shortCode', async (c) => {
  const { shortCode } = c.req.param()
  const { userId } = await c.req.json().catch(() => ({}))

  try {
    // Buscar QR por short_code para obtener el UUID real
    const qr = await c.env.DB.prepare(
      'SELECT id FROM qr_codes WHERE short_code = ?'
    ).bind(shortCode).first()

    if (!qr) return c.json({ error: 'QR no encontrado' }, 404)

    await c.env.DB.prepare(
      'INSERT INTO scans (id, qr_id, user_id, scanned_at) VALUES (?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), qr.id, userId || null, Date.now()).run()

    const { count } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM scans WHERE qr_id = ?'
    ).bind(qr.id).first()

    return c.json({ ok: true, scanCount: count })
  } catch (e) {
    return c.json({ error: 'db error', detail: String(e) }, 500)
  }
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

// ── OTP Auth Routes ──────────────────────────────────────────────────────────

// POST /api/auth/otp/send
app.post('/api/auth/otp/send', async (c) => {
  const { email } = await c.req.json<{ email: string }>()
  if (!email) return c.json({ error: 'Email requerido' }, 400)

  const normalizedEmail = email.toLowerCase().trim()
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString() // 6 dígitos
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutos

  try {
    // Buscar o crear usuario
    let user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first()
    
    if (!user) {
      const id = crypto.randomUUID()
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, role, created_at, otp_code, otp_expires, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, normalizedEmail, 'user', Date.now(), otpCode, expires, 'OTP_MANAGED').run()
    } else {
      await c.env.DB.prepare(
        'UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?'
      ).bind(otpCode, expires, normalizedEmail).run()
    }

    // Para testing: el admin siempre es premium
    if (normalizedEmail === 'andardg@gmail.com') {
      await c.env.DB.prepare('UPDATE users SET is_premium = 1 WHERE email = ?').bind(normalizedEmail).run()
    }

    // Aquí se enviaría el correo real. Por ahora lo simulamos.
    console.log(`[OTP DEBUG] Code for ${normalizedEmail}: ${otpCode}`)
    
    return c.json({ ok: true, message: 'Código enviado' })
  } catch (e) {
    return c.json({ error: 'Error al enviar código', detail: String(e) }, 500)
  }
})

// POST /api/auth/otp/verify
app.post('/api/auth/otp/verify', async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>()
  if (!email || !code) return c.json({ error: 'Email y código requeridos' }, 400)

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  const normalizedEmail = email.toLowerCase().trim()

  // Bypass para admin en dev
  if (normalizedEmail === 'andardg@gmail.com' && code === '011890') {
     const user = await c.env.DB.prepare('SELECT id, role FROM users WHERE email = ?').bind(normalizedEmail).first<{ id: string; role: string }>()
     if (user) {
       const token = await makeToken({ sub: user.id, email: normalizedEmail, role: user.role, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 60*60*24*7 }, secret)
       return c.json({ token, user: { id: user.id, email: normalizedEmail, name: 'Admin', role: user.role, is_premium: true } })
     }
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, role, otp_code, otp_expires, is_premium FROM users WHERE email = ?'
    ).bind(normalizedEmail).first<{ id: string; email: string; name: string; role: string; otp_code: string; otp_expires: number; is_premium: number }>()

    if (!user || user.otp_code !== code || Date.now() > user.otp_expires) {
      return c.json({ error: 'Código inválido o expirado' }, 401)
    }

    // Limpiar OTP tras éxito
    await c.env.DB.prepare('UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = ?').bind(user.id).run()

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 60 * 60 * 24 * 7
    const token = await makeToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: now,
      exp,
    }, secret)

    return c.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, is_premium: Boolean(user.is_premium) }
    })
  } catch (e) {
    return c.json({ error: 'Error de verificación' }, 500)
  }
})

// ── Swipe & Social Routes ───────────────────────────────────────────────────

// GET /api/user/stats — obtener conteo de swipes
app.get('/api/user/stats', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return c.json({ error: 'No autorizado' }, 401)

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  try {
    const payload = await verify(token, secret)
    const userId = payload.sub as string
    
    const { count } = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM saved_profiles WHERE user_id = ?'
    ).bind(userId).first<{ count: number }>()

    const user = await c.env.DB.prepare('SELECT is_premium FROM users WHERE id = ?').bind(userId).first<{ is_premium: number }>()

    return c.json({ 
      swipes: count, 
      is_premium: Boolean(user?.is_premium),
      limit: 10 
    })
  } catch {
    return c.json({ error: 'Token inválido' }, 401)
  }
})

// POST /api/swipe/save — guardar perfil (con límite)
app.post('/api/swipe/save', async (c) => {
  const authHeader = c.req.header('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return c.json({ error: 'No autorizado' }, 401)

  const { companyId } = await c.req.json<{ companyId: string }>()
  if (!companyId) return c.json({ error: 'companyId requerido' }, 400)

  const secret = c.env.JWT_SECRET || 'dev-secret-change-in-production'
  try {
    const payload = await verify(token, secret)
    const userId = payload.sub as string

    // 1. Verificar premium y límites
    const user = await c.env.DB.prepare('SELECT is_premium FROM users WHERE id = ?').bind(userId).first<{ is_premium: number }>()
    
    if (!user?.is_premium) {
      const { count } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM saved_profiles WHERE user_id = ?'
      ).bind(userId).first<{ count: number }>()

      if (count >= 10) {
        return c.json({ error: 'limit_reached', message: 'Has alcanzado el límite de 10 swipes. Mejora a PRO para swipes ilimitados.' }, 403)
      }
    }

    // 2. Guardar perfil
    await c.env.DB.prepare(
      'INSERT OR IGNORE INTO saved_profiles (user_id, company_id, saved_at) VALUES (?, ?, ?)'
    ).bind(userId, companyId, Date.now()).run()

    return c.json({ ok: true })
  } catch (e) {
    return c.json({ error: 'Error al guardar perfil', detail: String(e) }, 500)
  }
})

// ── Legacy Auth Routes (To be deprecated) ────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  // Ahora redirigimos internamente o fallamos para forzar OTP
  return c.json({ error: 'Usa OTP para ingresar' }, 401)
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
