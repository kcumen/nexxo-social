import { useState, useEffect } from 'react'
import {
  QrCode,
  Buildings,
  ChartLineUp,
  DeviceMobile,
  Cube,
  ArrowLeft,
  Plus,
  SquaresFour,
  Heart,
  Users,
} from '@phosphor-icons/react'
import { Primary, Secondary, Accent } from './components/Buttons'
import SwipeDeck from './views/SwipeDeck'

const API_BASE = '/api'

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

const API = {
  async generateQR(companyName) {
    return request('POST', '/qr/generate', { name: companyName })
  },
  async generateBatchQRs(count) {
    return request('POST', '/qr/generate', { count })
  },
  async getStats() {
    return request('GET', '/stats')
  },
  async getQRs() {
    return request('GET', '/qr/list')
  },
  async deleteQRs(ids) {
    return request('POST', '/qr/delete', { ids })
  },
  async getQR(shortCode) {
    return request('GET', `/qr/${shortCode}`)
  },
  async claimQR(shortCode, companyName, tagline) {
    return request('POST', '/qr/claim', { shortCode, companyName, tagline })
  },
  async getCompany(slug) {
    return request('GET', `/company/${slug}`)
  },
  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login falló' }))
      throw new Error(err.error || 'Login falló')
    }
    const data = await res.json()
    // Guardar token en localStorage
    localStorage.setItem('nexxo_token', data.token)
    localStorage.setItem('nexxo_user', JSON.stringify(data.user))
    return data.user
  },
  logout() {
    localStorage.removeItem('nexxo_token')
    localStorage.removeItem('nexxo_user')
  },
  getCurrentUser() {
    try {
      const u = localStorage.getItem('nexxo_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  },
  getToken() {
    return localStorage.getItem('nexxo_token') || ''
  },
}

// ── Navigation ───────────────────────────────────────────────────────────────
function Nav({ onDashboard, onSwipe, onAdmin }) {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b-3 border-black bg-bg">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-primary border-3 border-black shadow-neu-sm w-10 h-10 flex items-center justify-center font-heading font-black text-lg">
          N
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">nexxo<span className="text-secondary">.social</span></span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 md:gap-8">
        <a href="#como" className="nav-link hidden sm:block">Cómo funciona</a>
        <a href="#generar" className="nav-link hidden sm:block">Generar QR</a>
        <Secondary
          size="sm"
          onClick={onDashboard}
          className="hidden md:flex items-center gap-2"
        >
          <Users size={16} weight="bold" />
          Dashboard
        </Secondary>
        <Primary
          size="sm"
          onClick={onSwipe}
          className="flex items-center gap-2"
        >
          <SquaresFour size={16} weight="bold" />
          Explorar
        </Primary>
        <Secondary
          size="sm"
          onClick={onAdmin}
          className="flex items-center gap-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
        >
          <DeviceMobile size={16} weight="bold" />
          Admin
        </Secondary>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="px-6 md:px-12 pt-16 pb-12 md:pt-24 md:pb-20">
      <div className="max-w-5xl mx-auto">

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="tag tag-blue">En construcción</span>
          <span className="font-mono text-xs text-muted">Q2 2026</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8">
          Conecta empresas<br />
          <span className="text-secondary">con un QR.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Códigos QR vinculados a perfiles corporativos. Imprimelos, compartilos, escanealos.
          Networking sin fricción entre el mundo físico y digital.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Primary href="#generar" size="lg">
            Generar mi QR →
          </Primary>
          <Secondary href="#como" size="lg">
            Saber más
          </Secondary>
        </div>

        {/* Decorative element */}
        <div className="mt-16 flex items-center gap-4">
          <div className="w-16 h-16 border-3 border-black shadow-neu-md bg-primary" />
          <div className="w-10 h-10 border-3 border-black shadow-neu-sm bg-secondary" />
          <div className="w-6 h-6 border-3 border-black shadow-neu-sm bg-accent" />
          <p className="text-sm text-muted font-mono ml-2">↑ Así de simple es nexxo</p>
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      Icon: QrCode,
      title: 'QR personalizable',
      desc: 'Genera códigos únicos para cada canal, evento o ubicación física.',
      color: 'primary',
    },
    {
      Icon: Buildings,
      title: 'Perfil corporativo',
      desc: 'Empresa autenticada con LinkedIn, Google o Instagram. Sin magia negra.',
      color: 'secondary',
    },
    {
      Icon: ChartLineUp,
      title: 'Analytics',
      desc: 'Sabé cuántos escanean cada QR, cuándo y desde dónde.',
      color: 'primary',
    },
    {
      Icon: DeviceMobile,
      title: 'Sin app',
      desc: 'El escaneador solo abre el navegador. No necesita instalar nada.',
      color: 'secondary',
    },
  ]

  const colorMap = {
    primary: 'bg-primary',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
  }

  return (
    <section id="como" className="px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-14">
          <span className="tag mb-4">Paso a paso</span>
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight">
            Cómo funciona
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card flex items-start gap-5">
              <div className={`feature-icon ${colorMap[f.color]} flex-shrink-0`}>
                <f.Icon size={28} weight="bold" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Big statement */}
        <div className="mt-16 p-8 md:p-12 border-3 border-black bg-surface shadow-neu-lg">
          <p className="font-heading font-extrabold text-2xl md:text-4xl leading-tight">
            Networking que funciona<br />
            <span className="text-secondary">en el mundo real.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ── QR Generator ───────────────────────────────────────────────────────────────
function QRGenerator() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const qr = await API.generateQR(name)
      setResult(qr)
    } catch (err) {
      setError('No se pudo generar el QR. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="generar" className="px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-lg mx-auto">

        {/* Section header */}
        <div className="mb-10 text-center">
          <span className="tag tag-red mb-4">Empezá hoy</span>
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight mb-3">
            Generar QR
          </h2>
          <p className="text-muted text-sm">
            Escribí el nombre de tu empresa y generá un código único.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre de la empresa..."
            className="input-neubrut flex-1"
          />
          <Accent type="submit" disabled={loading} className="whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Generando...' : 'Generar'}
          </Accent>
        </form>

        {/* Error */}
        {error && (
          <p className="text-accent text-sm font-semibold mb-4">{error}</p>
        )}

        {/* Result */}
        {result && (
          <div className="qr-card text-center reveal">
            <img
              src={result.qr}
              alt="QR generado"
              className="w-48 h-48 mx-auto mb-6 border-3 border-black"
            />
            <p className="text-xs text-muted mb-3 font-mono uppercase tracking-wide">
              Tu QR está listo para imprimir o compartir
            </p>
            <p className="font-mono text-sm text-muted break-all bg-bg p-3 border-3 border-black">
              {result.url}
            </p>
            <button
              onClick={() => { setResult(null); setName('') }}
              className="mt-6 text-sm font-heading font-semibold text-muted hover:text-text transition flex items-center gap-1"
            >
              <ArrowLeft size={14} weight="bold" />
              Generar otro
            </button>
          </div>
        )}

        {/* Social proof */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted mb-3">Ya confían en nosotros</p>
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-8 h-8 border-3 border-black bg-surface shadow-neu-sm flex items-center justify-center text-xs font-heading font-bold text-muted"
              >
                {['A', 'B', 'C', 'D'][i - 1]}
              </div>
            ))}
            <span className="text-sm text-muted ml-1">+ empresas</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 md:px-12 py-8 border-t-3 border-black">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-sm">
            N
          </div>
          <span className="font-heading font-bold">nexxo.social</span>
        </div>
        <p className="text-sm text-muted font-mono">
          Networking cuántico · 2026
        </p>
      </div>
    </footer>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onBack, onSwipe }) {
  const [stats, setStats] = useState({ qrs: 0, scans: 0 })
  const [qrs, setQrs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.getStats().catch(() => ({ qrs: 0, scans: 0 })),
      API.getQRs().catch(() => []),
    ]).then(([s, q]) => {
      setStats(s)
      setQrs(q || [])
      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: 'QRs activos', value: stats.qrs, Icon: SquaresFour, color: 'primary' },
    { label: 'Escaneos totales', value: stats.scans, Icon: Cube, color: 'secondary' },
    { label: 'Perfiles guardados', value: Math.floor(stats.scans * 0.4), Icon: Heart, color: 'accent' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Dashboard Header */}
      <div className="border-b-3 border-black px-6 md:px-12 py-4 flex items-center gap-6 bg-surface">
        <Secondary size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={16} weight="bold" />
          Volver
        </Secondary>
        <div className="flex items-center gap-3">
          <div className="bg-secondary border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-white text-sm">
            N
          </div>
          <span className="font-heading font-bold text-lg">nexxo.social</span>
        </div>
        <span className="tag tag-blue ml-auto">Dashboard</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">

        {/* Title */}
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight mb-2">
              Tu Dashboard
            </h1>
            <p className="text-muted">Gestión de códigos QR y estadísticas</p>
          </div>
          <Primary onClick={onSwipe} className="flex items-center gap-2 mt-auto">
            <SquaresFour size={18} weight="bold" />
            Explorar empresas
          </Primary>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-center mb-3">
                <s.Icon size={40} weight="bold" />
              </div>
              <div className="stat-number mb-2">{loading ? '—' : s.value}</div>
              <div className="text-sm text-muted font-heading font-semibold uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* QR list */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-2xl">Tus códigos QR</h2>
            <Primary href="#generar" size="sm" className="flex items-center gap-2">
              <Plus size={16} weight="bold" />
              Nuevo QR
            </Primary>
          </div>

          {loading ? (
            <div className="card text-center py-12 text-muted font-heading font-semibold">
              Cargando...
            </div>
          ) : qrs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted mb-4">No tenés códigos QR todavía.</p>
              <Primary href="#generar" size="sm">
                Generá tu primer QR →
              </Primary>
            </div>
          ) : (
            <div className="space-y-3">
              {qrs.map(qr => (
                <div key={qr.id || qr.shortCode} className="qr-row">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent(qr.url || `https://nexxo.social/r/${qr.shortCode}`)}`}
                      alt="QR"
                      className="w-14 h-14 border-3 border-black flex-shrink-0"
                    />
                    <div>
                      <div className="font-heading font-bold text-base">{qr.name}</div>
                      <div className="font-mono text-xs text-muted">
                        nexxo.social/r/{qr.shortCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-heading font-extrabold text-2xl">{qr.scans || 0}</div>
                    <div className="text-xs text-muted uppercase tracking-wide">escaneos</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onBack }) {
const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const user = await API.login(email, password)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Credenciales inválidas')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Minimal header */}
      <div className="border-b-3 border-black px-6 py-4 bg-surface">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <div className="bg-primary border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-sm">N</div>
          <span className="font-heading font-bold text-lg">nexxo.social</span>
          <span className="tag tag-blue ml-auto">Admin</span>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-secondary border-3 border-black shadow-neu-sm mx-auto mb-6 flex items-center justify-center">
              <DeviceMobile size={32} weight="bold" color="#fff" />
            </div>
            <h1 className="font-heading font-extrabold text-3xl mb-2">Panel Admin</h1>
            <p className="text-muted text-sm">Ingresá tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-neubrut w-full"
                required
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-neubrut w-full"
                required
              />
            </div>

            {error && (
              <p className="text-accent text-sm font-semibold bg-accent/10 border-3 border-accent p-3">
                {error}
              </p>
            )}

            <Accent
              type="submit"
              disabled={loading || !email || !password}
              size="lg"
              className="w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </Accent>
          </form>

          <div className="mt-8 text-center">
            <Secondary size="sm" onClick={onBack} className="inline-flex items-center gap-1">
              <ArrowLeft size={14} weight="bold" />
              Volver al inicio
            </Secondary>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user, onBack }) {
  const [stats, setStats] = useState({ qrs: 0, scans: 0 })
  const [qrs, setQrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [batchCount, setBatchCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const [selected, setSelected] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = () => {
    Promise.all([
      API.getStats().catch(() => ({ qrs: 0, scans: 0 })),
      API.getQRs().catch(() => []),
    ]).then(([s, q]) => {
      setStats(s)
      setQrs(q || [])
      setSelected([])
      setLoading(false)
    })
  }

  useEffect(() => { loadData() }, [])

  const handleBatchGenerate = async (e) => {
    e.preventDefault()
    if (batchCount < 1 || batchCount > 50) return
    setGenerating(true)
    setGenerated(null)
    try {
      const res = await API.generateBatchQRs(batchCount)
      setGenerated(res.batch)
      loadData()
    } catch {
      alert('Error generando QR batch')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteSelected = async () => {
    setDeleting(true)
    try {
      const res = await API.deleteQRs(selected)
      setSelected([])
      setConfirmDelete(false)
      loadData()
    } catch {
      alert('Error eliminando QRs')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const activeQRs = qrs.filter(q => q.status === 'active')
  const blankQRs = qrs.filter(q => q.status === 'blank')

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Admin Header */}
      <div className="border-b-3 border-black px-6 md:px-12 py-4 flex items-center gap-4 bg-surface flex-wrap">
        <Secondary size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={16} weight="bold" />
          Volver
        </Secondary>
        <div className="flex items-center gap-3">
          <div className="bg-secondary border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-white text-sm">N</div>
          <span className="font-heading font-bold text-lg">nexxo.social</span>
        </div>
        <span className="tag tag-blue">Admin</span>
        <span className="ml-auto text-sm font-mono text-muted">{user?.email}</span>
        <Secondary
          size="sm"
          onClick={() => { API.logout(); onBack() }}
          className="text-accent border-accent hover:bg-accent hover:text-white"
        >
          Cerrar sesión
        </Secondary>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-12 py-12">

        {/* Title */}
        <div className="mb-10">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight mb-2">
            Panel de Administración
          </h1>
          <p className="text-muted">Gestión centralizada de códigos QR y estadísticas</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'QRs activos', value: activeQRs.length, color: '#FACC15' },
            { label: 'QRs en blanco', value: blankQRs.length, color: '#FFFFFF' },
            { label: 'Escaneos totales', value: stats.scans, color: '#3B82F6' },
            { label: 'Empresas', value: activeQRs.length, color: '#EF4444' },
          ].map(s => (
            <div key={s.label} className="card text-center" style={{ borderTop: `6px solid ${s.color}` }}>
              <div className="font-heading font-extrabold text-3xl mb-1">{loading ? '—' : s.value}</div>
              <div className="text-xs text-muted uppercase tracking-wide font-heading font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Batch QR Generator */}
          <div>
            <div className="card mb-6">
              <h2 className="font-heading font-bold text-2xl mb-1">Generar QRs en blanco</h2>
              <p className="text-muted text-sm mb-6">Creá códigos QR vacíos para imprimir y distribuir en eventos.</p>

              <form onSubmit={handleBatchGenerate} className="flex gap-3 mb-4">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={batchCount}
                  onChange={e => setBatchCount(Number(e.target.value))}
                  className="input-neubrut w-24 text-center"
                />
                <Primary type="submit" disabled={generating} className="flex-1 justify-center disabled:opacity-50">
                  {generating ? 'Generando...' : `Generar ${batchCount} QR${batchCount > 1 ? 's' : ''}`}
                </Primary>
              </form>

              {generated && (
                <div className="bg-bg border-3 border-black p-4">
                  <p className="font-heading font-bold text-sm mb-3">QRs generados:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {generated.slice(0, 10).map(qr => (
                      <img
                        key={qr.qrId}
                        src={qr.qr}
                        alt={qr.shortCode}
                        title={qr.shortCode}
                        className="w-full aspect-square border-2 border-black"
                      />
                    ))}
                  </div>
                  {generated.length > 10 && (
                    <p className="text-xs text-muted mt-2 font-mono">+{generated.length - 10} más en la lista</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="card">
              <h2 className="font-heading font-bold text-xl mb-4">Resumen</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b-2 border-black/10">
                  <span className="text-sm text-muted">Total QRs</span>
                  <span className="font-heading font-bold">{qrs.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-black/10">
                  <span className="text-sm text-muted">Reclamados</span>
                  <span className="font-heading font-bold text-secondary">{activeQRs.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b-2 border-black/10">
                  <span className="text-sm text-muted">Pendientes</span>
                  <span className="font-heading font-bold">{blankQRs.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted">Total escaneos</span>
                  <span className="font-heading font-bold text-accent">{stats.scans}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR List */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="font-heading font-bold text-2xl">Todos los QRs</h2>
                  {selected.length > 0 && (
                    <Accent size="sm" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1">
                      <X size={12} weight="bold" />
                      Eliminar {selected.length}
                    </Accent>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {selected.length > 0 && (
                    <span className="text-xs font-mono text-muted">{selected.length} seleccionado{selected.length > 1 ? 's' : ''}</span>
                  )}
                  <Secondary size="sm" onClick={loadData} className="flex items-center gap-1">
                    <ArrowLeft size={14} weight="bold" className="rotate-180" />
                    Refrescar
                  </Secondary>
                </div>
              </div>

              {loading ? (
                <p className="text-muted text-center py-8 font-heading font-semibold">Cargando...</p>
              ) : qrs.length === 0 ? (
                <p className="text-muted text-center py-8 font-heading font-semibold">No hay QRs generados.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {qrs.map(qr => (
                    <div key={qr.qr_id || qr.id} className={`flex items-center gap-3 p-3 border-3 border-black bg-bg ${qr.status === 'blank' ? 'cursor-pointer' : 'opacity-60'}`} onClick={() => qr.status === 'blank' && toggleSelect(qr.qr_id || qr.id)}>
                      {qr.status === 'blank' && (
                        <div
                          className={`w-6 h-6 border-3 border-black flex-shrink-0 flex items-center justify-center transition-colors ${selected.includes(qr.qr_id || qr.id) ? 'bg-accent' : 'bg-surface'}`}
                          style={{ minWidth: 20, minHeight: 20 }}
                        >
                          {selected.includes(qr.qr_id || qr.id) && (
                            <X size={12} weight="bold" color="#fff" />
                          )}
                        </div>
                      )}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=${encodeURIComponent(`https://nexxo.social/r/${qr.short_code}`)}`}
                        alt={qr.short_code}
                        className="w-12 h-12 border-2 border-black flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-sm truncate">
                          {qr.name || <span className="text-muted italic">Sin reclamar</span>}
                        </div>
                        <div className="font-mono text-xs text-muted truncate">
                          nexxo.social/r/{qr.short_code}
                        </div>
                        <div className="font-mono text-xs mt-1">
                          <span className={`font-bold ${qr.status === 'active' ? 'text-secondary' : 'text-muted'}`}>
                            {qr.status === 'active' ? '● Activo' : '○ Blanco'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-heading font-extrabold text-xl">{qr.scan_count || 0}</div>
                        <div className="text-xs text-muted">scans</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function ClaimPage({ shortCode, onBack }) {
  const [companyName, setCompanyName] = useState('')
  const [tagline, setTagline] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleClaim = async (e) => {
    e.preventDefault()
    if (!companyName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await API.claimQR(shortCode, companyName, tagline)
      if (res.error) throw new Error(res.error)
      setResult(res)
    } catch (err) {
      setError(err.message || 'No se pudo registrar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="border-b-3 border-black px-6 py-4 bg-surface">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="bg-accent border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-white text-sm">N</div>
            <span className="font-heading font-bold text-lg text-white">nexxo.social</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full text-center reveal">
            <div className="bg-surface border-3 border-black shadow-neu-lg p-10 mb-8">
              <div className="w-16 h-16 bg-accent border-3 border-black shadow-neu-sm mx-auto mb-6 flex items-center justify-center">
                <QrCode size={32} weight="bold" color="#fff" />
              </div>
              <h1 className="font-heading font-extrabold text-3xl mb-3">¡QR vinculado!</h1>
              <p className="text-muted text-sm leading-relaxed mb-6">
                <span className="font-heading font-bold text-text">{companyName}</span> ya tiene su QR activo en nexxo.social
              </p>
              <img
                src={result.qr}
                alt="Tu QR"
                className="w-40 h-40 mx-auto border-3 border-black mb-6"
              />
              <p className="font-mono text-xs text-muted break-all bg-bg p-3 border-3 border-black">
                {result.url}
              </p>
            </div>
            <Primary href={result.url} size="lg" className="w-full justify-center">
              Ver mi perfil →
            </Primary>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Minimal header */}
      <div className="border-b-3 border-black px-6 py-4 bg-surface">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary border-3 border-black shadow-neu-sm w-8 h-8 flex items-center justify-center font-heading font-black text-sm">N</div>
            <span className="font-heading font-bold text-lg">nexxo.social</span>
          </div>
          <Secondary size="sm" onClick={onBack} className="flex items-center gap-1">
            <ArrowLeft size={14} weight="bold" />
            Volver
          </Secondary>
        </div>
      </div>

      {/* Claim form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* QR preview */}
          <div className="text-center mb-10">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://nexxo.social/r/${shortCode}`}
              alt="QR"
              className="w-28 h-28 mx-auto border-3 border-black shadow-neu-md mb-4"
            />
            <span className="tag tag-red mb-3">QR vacío</span>
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl tracking-tight leading-tight">
              Este QR no tiene empresa asignada
            </h1>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              Registrá tu empresa y reclamá este código para vos.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ej: Mercado Tech"
                className="input-neubrut w-full"
                required
              />
            </div>
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Tagline <span className="text-muted font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="Ej: Fintech para LatAm"
                className="input-neubrut w-full"
              />
            </div>

            {error && (
              <p className="text-accent text-sm font-semibold bg-accent/10 border-3 border-accent p-3">
                {error}
              </p>
            )}

            <Accent
              type="submit"
              disabled={loading || !companyName.trim()}
              size="lg"
              className="w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Vinculando...' : 'Reclamar este QR →'}
            </Accent>
          </form>

          <p className="text-center text-xs text-muted mt-6 font-mono">
            Al reclamar, este QR queda vinculado a tu empresa y no puede ser reutilizado.
          </p>
        </div>
      </div>

      {/* Confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-surface border-3 border-black shadow-neu-lg p-8 max-w-sm w-full">
            <h3 className="font-heading font-extrabold text-2xl mb-3">¿Eliminar {selected.length} QR{selected.length > 1 ? 's' : ''}?</h3>
            <p className="text-muted text-sm mb-8 leading-relaxed">
              Los códigos QR seleccionados serán eliminados <strong>definitivamente</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Secondary onClick={() => setConfirmDelete(false)} className="flex-1 justify-center">
                Cancelar
              </Secondary>
              <Accent onClick={handleDeleteSelected} disabled={deleting} className="flex-1 justify-center disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Accent>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Detect claim mode: ?claim=shortCode de la URL
  const params = new URLSearchParams(window.location.search)
  const claimCode = params.get('claim')
  const [view, setView] = useState(claimCode ? 'claim' : 'landing') // landing | dashboard | swipe | claim | login | admin
  const [user, setUser] = useState(() => API.getCurrentUser())

  // Si hay usuario guardado, ir directo a admin
  useEffect(() => {
    if (user && user.role === 'admin' && view === 'landing') {
      setView('admin')
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      {view === 'landing' && (
        <>
          <Nav onDashboard={() => setView('dashboard')} onSwipe={() => setView('swipe')} onAdmin={() => setView('login')} />
          <Hero />
          <Features />
          <QRGenerator />
          <Footer />
        </>
      )}
      {view === 'dashboard' && (
        <Dashboard onBack={() => setView('landing')} onSwipe={() => setView('swipe')} />
      )}
      {view === 'swipe' && (
        <SwipeDeck onBack={() => setView('landing')} />
      )}
      {view === 'claim' && (
        <ClaimPage shortCode={claimCode} onBack={() => setView('landing')} />
      )}
      {view === 'login' && (
        <LoginPage onLogin={(u) => { setUser(u); setView('admin') }} onBack={() => setView('landing')} />
      )}
      {view === 'admin' && user && (
        <AdminDashboard user={user} onBack={() => { API.logout(); setUser(null); setView('landing') }} />
      )}
    </div>
  )
}
