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

// ── Components ───────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🛒</span>
        <span className="font-bold text-xl">nexxo<span className="gradient-text">.social</span></span>
      </div>
      <div className="flex gap-6 text-sm text-muted">
        <a href="#como" className="hover:text-white transition">Cómo funciona</a>
        <a href="#generar" className="hover:text-white transition">Generar QR</a>
        <button className="btn-primary px-5 py-2 rounded-full text-sm font-medium text-white transition">
          Dashboard →
        </button>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="text-center px-4 pt-24 pb-20">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted mb-8">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        En construcción · Q2 2026
      </div>
      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Conecta empresas<br />
        <span className="gradient-text">con un QR</span>
      </h1>
      <p className="text-muted text-lg max-w-xl mx-auto mb-10">
        Códigos QR vinculados a perfiles corporativos. Imprimelos, compartilos, escanealos.
        Networking sin fricción entre el mundo físico y digital.
      </p>
      <div className="flex gap-4 justify-center">
        <a href="#generar" className="btn-primary px-8 py-3 rounded-full font-semibold text-white transition glow">
          Generar mi QR →
        </a>
        <a href="#como" className="px-8 py-3 rounded-full border border-border text-sm hover:border-white/30 transition">
          Saber más
        </a>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: '📱', title: 'QR personalizable', desc: 'Genera códigos únicos para cada canal, evento o ubicación física.' },
    { icon: '🏢', title: 'Perfil corporativo', desc: 'Empresa autenticada con LinkedIn, Google o Instagram. Sin magia negra.' },
    { icon: '📊', title: 'Analytics', desc: 'Sabé cuántos escanean cada QR, cuándo y desde dónde.' },
    { icon: '🔗', title: 'Sin app', desc: 'El escaneador solo abre el navegador. No necesita instalar nada.' },
  ]
  return (
    <section id="como" className="max-w-5xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-14">Cómo funciona</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {features.map(f => (
          <div key={f.title} className="card p-6 hover:border-white/20 transition">
            <span className="text-3xl mb-4 block">{f.icon}</span>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function QRGenerator() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const qr = await API.generateQR(name)
    setResult(qr)
    setLoading(false)
  }

  return (
    <section id="generar" className="max-w-lg mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Generar QR</h2>
        <p className="text-muted text-sm">Escribí el nombre de tu empresa y generá un código único.</p>
      </div>
      <form onSubmit={handleGenerate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de la empresa..."
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition"
        >
          {loading ? '...' : 'Generar'}
        </button>
      </form>

      {result && (
        <div className="card p-8 text-center glow">
          <img src={result.qr} alt="QR" className="w-48 h-48 mx-auto mb-6 rounded-2xl" />
          <p className="text-xs text-muted mb-2">Tu QR está listo para imprimir o compartir</p>
          <p className="font-mono text-sm text-accent break-all">{result.url}</p>
          <button
            onClick={() => { setResult(null); setName('') }}
            className="mt-6 text-sm text-muted hover:text-white transition"
          >
            ← Generar otro
          </button>
        </div>
      )}
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border px-8 py-8 text-center text-sm text-muted">
      <p>nexxo.social · Networking cuántico · 2026</p>
    </footer>
  )
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('landing') // landing | dashboard

  return (
    <div className="min-h-screen bg-bg">
      {view === 'landing' && (
        <>
          <Nav />
          <Hero />
          <Features />
          <QRGenerator />
          <Footer />
        </>
      )}
      {view === 'dashboard' && <Dashboard onBack={() => setView('landing')} />}
    </div>
  )
}

function Dashboard({ onBack }) {
  const [stats, setStats] = useState({ qrs: 0, scans: 0 })
  const [qrs, setQrs] = useState([])

  useEffect(() => {
    API.getStats().then(setStats).catch(() => {})
    API.getQRs ? API.getQRs().then(setQrs).catch(() => {}) : setQrs([])
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-muted hover:text-white transition">← Volver</button>
        <span className="text-xl">🛒 nexxo.social</span>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted mb-10">Gestión de códigos QR y estadísticas</p>
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
          { label: 'QRs activos', value: stats.qrs, icon: '📱' },
          { label: 'Escaneos totales', value: stats.scans, icon: '👁️' },
          { label: 'Perfiles guardados', value: Math.floor(stats.scans * 0.4), icon: '❤️' },
          ].map(m => (
            <div key={m.label} className="card p-6 text-center">
              <span className="text-3xl">{m.icon}</span>
              <div className="text-3xl font-bold mt-3">{m.value}</div>
              <div className="text-muted text-sm mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Tus códigos QR</h2>
        <div className="space-y-3">
          {qrs.length === 0 && (
            <p className="text-muted text-sm">No tienes códigos QR todavía. Generá uno desde la home.</p>
          )}
          {qrs.map(qr => (
            <div key={qr.id || qr.shortCode} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https://nexxo.social/r/${qr.shortCode}`}
                  alt="QR"
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <div className="font-medium">{qr.name}</div>
                  <div className="text-xs text-muted">nexxo.social/r/{qr.shortCode}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{qr.scans || 0}</div>
                <div className="text-xs text-muted">escaneos</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
