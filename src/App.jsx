import { useState, useEffect } from 'react'

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
  async getStats() {
    return request('GET', '/stats')
  },
  async getQRs() {
    return request('GET', '/qr/list')
  },
  async getCompany(slug) {
    return request('GET', `/company/${slug}`)
  },
}

// ── Navigation ───────────────────────────────────────────────────────────────
function Nav({ onDashboard }) {
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
        <button
          onClick={onDashboard}
          className="btn-secondary text-sm py-2 px-5"
        >
          Dashboard →
        </button>
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
          <a href="#generar" className="btn-primary text-lg py-4 px-8">
            Generar mi QR →
          </a>
          <a href="#como" className="btn-secondary text-lg py-4 px-8">
            Saber más
          </a>
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
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ),
      title: 'QR personalizable',
      desc: 'Genera códigos únicos para cada canal, evento o ubicación física.',
      color: 'primary',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
        </svg>
      ),
      title: 'Perfil corporativo',
      desc: 'Empresa autenticada con LinkedIn, Google o Instagram. Sin magia negra.',
      color: 'secondary',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M3 3v18h18M7 16l4-4 4 4 6-6"/>
        </svg>
      ),
      title: 'Analytics',
      desc: 'Sabé cuántos escanean cada QR, cuándo y desde dónde.',
      color: 'primary',
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      ),
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
          {features.map((f, i) => (
            <div key={f.title} className="card flex items-start gap-5">
              <div className={`feature-icon ${colorMap[f.color]} flex-shrink-0`}>
                {f.icon}
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
          <button
            type="submit"
            disabled={loading}
            className="btn-accent whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando...' : 'Generar'}
          </button>
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
              className="mt-6 text-sm font-heading font-semibold text-muted hover:text-text transition"
            >
              ← Generar otro
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
function Dashboard({ onBack }) {
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
    { label: 'QRs activos', value: stats.qrs, icon: '▦', color: 'primary' },
    { label: 'Escaneos totales', value: stats.scans, icon: '◉', color: 'secondary' },
    { label: 'Perfiles guardados', value: Math.floor(stats.scans * 0.4), icon: '♥', color: 'accent' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Dashboard Header */}
      <div className="border-b-3 border-black px-6 md:px-12 py-4 flex items-center gap-6 bg-surface">
        <button
          onClick={onBack}
          className="btn-secondary text-sm py-2 px-4"
        >
          ← Volver
        </button>
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
        <div className="mb-10">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight mb-2">
            Tu Dashboard
          </h1>
          <p className="text-muted">Gestión de códigos QR y estadísticas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
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
            <a href="#generar" className="btn-primary text-sm py-2 px-4">
              + Nuevo QR
            </a>
          </div>

          {loading ? (
            <div className="card text-center py-12 text-muted font-heading font-semibold">
              Cargando...
            </div>
          ) : qrs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted mb-4">No tenés códigos QR todavía.</p>
              <a href="#generar" className="btn-primary text-sm">
                Generá tu primer QR →
              </a>
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

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing')

  return (
    <div className="min-h-screen bg-bg">
      {view === 'landing' && (
        <>
          <Nav onDashboard={() => setView('dashboard')} />
          <Hero />
          <Features />
          <QRGenerator />
          <Footer />
        </>
      )}
      {view === 'dashboard' && (
        <Dashboard onBack={() => setView('landing')} />
      )}
    </div>
  )
}
