import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  Navigate
} from 'react-router-dom'
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
  X,
  Crown,
} from '@phosphor-icons/react'
import { Primary, Secondary, Accent } from './components/Buttons'
import SwipeDeck from './views/SwipeDeck'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'

function CustomQRCode({ value, size = 128, logoUrl = '/nexxo-logo.png', noPadding = false, noShadow = false }) {
  return (
    <div className={`bg-white border-2 border-black inline-block ${noPadding ? 'p-1' : 'p-2'} ${noShadow ? '' : 'shadow-neu-xs'}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        imageSettings={logoUrl ? {
          src: logoUrl,
          x: undefined,
          y: undefined,
          height: size * 0.22,
          width: size * 0.22,
          excavate: true,
        } : undefined}
      />
    </div>
  )
}

const API_BASE = '/api'
const TAILSCALE_IP = '100.89.246.51'
const getRedirectUrl = (shortCode) => {
  // En desarrollo, usamos la IP de Tailscale para que otros dispositivos puedan entrar
  const port = window.location.port ? `:${window.location.port}` : ''
  return `http://${TAILSCALE_IP}${port}/r/${shortCode}`
}

async function request(method, path, body) {
  const token = localStorage.getItem('nexxo_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const API = {
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
  async sendOTP(email) {
    return request('POST', '/auth/otp/send', { email })
  },
  async verifyOTP(email, code) {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verificación falló' }))
      throw new Error(err.error || 'Código inválido')
    }
    const data = await res.json()
    localStorage.setItem('nexxo_token', data.token)
    localStorage.setItem('nexxo_user', JSON.stringify(data.user))
    return data.user
  },
  async saveSwipe(companyId) {
    return request('POST', '/swipe/save', { companyId })
  },
  async getUserStats() {
    return request('GET', '/user/stats')
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
// ── Navigation ───────────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`bg-surface border-3 border-black shadow-neu flex items-center justify-between px-6 py-2 transition-all ${scrolled ? 'shadow-neu-sm' : ''}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary border-2 border-black shadow-neu-xs w-8 h-8 flex items-center justify-center font-heading font-black text-sm group-hover:-rotate-6 transition-transform">
              N
            </div>
            <span className="font-heading font-bold text-lg tracking-tight hidden sm:block">nexxo.social</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/swipe" className="font-heading font-bold text-sm hover:text-primary transition-colors flex items-center gap-2">
              <SquaresFour size={18} weight="bold" />
              Swipe Deck
            </Link>
            <a href="#como" className="font-heading font-bold text-sm hover:text-secondary transition-colors">Cómo funciona</a>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="font-heading font-bold text-sm hidden sm:block hover:underline"
                >
                  {user.name}
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full border-2 border-black bg-accent flex items-center justify-center font-heading font-bold shadow-neu-xs overflow-hidden">
                    {user.name[0]}
                  </div>
                  <button 
                    onClick={() => { API.logout(); onLogout(); navigate('/login'); }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                    title="Cerrar sesión"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="font-heading font-bold text-sm px-4 py-2 hover:bg-bg transition-colors">Entrar</Link>
                <Primary size="sm" onClick={() => navigate('/login')} className="hidden sm:flex">
                  Empezar
                </Primary>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function MobileNav({ user }) {
  const navigate = useNavigate()
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="bg-black border-2 border-white/20 rounded-2xl shadow-2xl p-2 flex items-center justify-around backdrop-blur-lg">
        <button onClick={() => navigate('/')} className="p-3 text-white/60 hover:text-white transition-colors">
          <Cube size={24} weight="bold" />
        </button>
        <button onClick={() => navigate('/swipe')} className="p-4 bg-primary border-2 border-black rounded-xl -translate-y-4 shadow-xl">
          <Heart size={24} weight="bold" className="text-black" />
        </button>
        <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')} className="p-3 text-white/60 hover:text-white transition-colors">
          <Users size={24} weight="bold" />
        </button>
      </div>
    </div>
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

// ── Landing Page Component ────────────────────────────────────────────────────
function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <QRGenerator />
      <Footer />
    </>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ qrs: 0, scans: 0 })
  const [qrs, setQrs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.getStats().catch(() => ({ qrs: 0, scans: 0 })),
      API.getQRs().catch(() => []),
    ]).then(([s, q]) => {
      // Filter QRs to only show those belonging to this user/company
      // In a real app, the API would handle this, but here we simulate it
      setStats(s)
      setQrs(q || [])
      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: 'Alcance Digital', value: stats.scans, Icon: ChartLineUp, color: 'bg-primary', description: 'Escaneos totales de tu perfil' },
    { label: 'Conexiones', value: Math.floor(stats.scans * 0.4), Icon: Heart, color: 'bg-accent', description: 'Empresas que te guardaron' },
    { label: 'Visibilidad', value: 'Alta', Icon: DeviceMobile, color: 'bg-secondary', description: 'Estado en el Swipe Deck' },
  ]

  return (
    <div className="min-h-screen bg-bg pb-12">
      <div className="max-w-5xl mx-auto px-6 mt-12">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="tag tag-blue">Empresa Verificada</span>
            {user?.is_premium && (
              <span className="bg-[#FFD700] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Crown size={12} weight="fill" /> Nexxo Pro
              </span>
            )}
            <span className="text-muted font-mono text-xs">ID: {user?.id?.slice(0,8)}</span>
          </div>
          <h1 className="font-heading font-black text-5xl md:text-6xl mb-4 leading-tight">
            Hola, <span className="text-primary">{user?.name || 'Empresa'}</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl leading-relaxed">
            Tu ecosistema de networking digital está activo. Monitorea tu impacto y gestiona tu identidad física.
          </p>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main Stats Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map((s, idx) => (
                <motion.div 
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-surface border-3 border-black p-5 shadow-neu-sm hover:shadow-neu transition-all cursor-default"
                >
                  <div className={`${s.color} border-2 border-black w-10 h-10 flex items-center justify-center mb-4`}>
                    <s.Icon size={20} weight="bold" />
                  </div>
                  <div className="text-3xl font-heading font-black mb-1">{loading ? '...' : s.value}</div>
                  <div className="text-xs font-heading font-bold uppercase text-muted mb-2">{s.label}</div>
                  <p className="text-[10px] text-muted font-medium">{s.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Networking Activity Mockup */}
            <div className="card">
              <h3 className="font-heading font-bold text-xl mb-6">Actividad de Networking</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3 border-2 border-black/5 rounded-lg">
                    <div className="w-10 h-10 bg-bg border-2 border-black flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">Nuevo escaneo detectado</p>
                      <p className="text-xs text-muted">Desde un dispositivo móvil • Hace {i * 2} horas</p>
                    </div>
                    <div className="text-xs font-mono font-bold text-secondary">+1 Scan</div>
                  </div>
                ))}
                <button className="w-full py-3 text-xs font-heading font-bold border-2 border-black hover:bg-black hover:text-white transition-colors uppercase tracking-widest">
                  Ver historial completo
                </button>
              </div>
            </div>
          </div>

          {/* Identity Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface border-3 border-black p-6 shadow-neu relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2">
                <Cube size={40} className="text-black/5 rotate-12 group-hover:rotate-45 transition-transform" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-4">Tu Identidad QR</h3>
              
              {loading ? (
                <div className="h-48 bg-bg/50 animate-pulse border-2 border-black/10" />
              ) : qrs.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CustomQRCode 
                      value={getRedirectUrl(qrs[0].shortCode)} 
                      size={180} 
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[10px] font-bold text-muted uppercase mb-1">Link de tu perfil</p>
                    <p className="text-xs font-bold truncate">nexxo.social/r/{qrs[0].shortCode}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-bg border-2 border-black mx-auto mb-4 flex items-center justify-center opacity-30">
                    <QrCode size={32} />
                  </div>
                  <p className="text-xs text-muted mb-4 px-4">No tienes un código físico vinculado a tu cuenta profesional.</p>
                  <Primary onClick={() => navigate('/swipe')} className="w-full justify-center">
                    Vincular Código
                  </Primary>
                </div>
              )}
            </div>

            <div className="bg-accent border-3 border-black p-6 shadow-neu-sm">
              <h4 className="font-heading font-bold text-lg mb-2">Completar Perfil</h4>
              <p className="text-xs mb-4">Aumenta tu visibilidad completando todos los datos de tu empresa.</p>
              <div className="w-full bg-white/30 h-2 border border-black mb-4">
                <div className="bg-black h-full w-[65%]" />
              </div>
              <Secondary size="sm" className="w-full justify-center bg-white">
                Editar Información
              </Secondary>
            </div>

            {/* Premium CTA */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-black text-white border-3 border-black p-6 shadow-neu-sm relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown size={120} weight="fill" color="#FFD700" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-[#FFD700] p-1 rounded">
                    <Crown size={16} weight="bold" className="text-black" />
                  </div>
                  <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#FFD700]">Nexxo Pro</span>
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Desbloquea el nivel Pro</h3>
                <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
                  Obtén analíticas avanzadas, personalización de colores y posición destacada en el Swipe Deck.
                </p>
                <button className="w-full py-2 bg-[#FFD700] text-black font-heading font-bold text-xs uppercase shadow-[4px_4px_0_rgba(255,215,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Mejorar ahora →
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Explore Footer */}
        <div className="bg-surface border-3 border-black p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-neu">
          <div>
            <h2 className="font-heading font-bold text-2xl mb-2">¿Listo para conectar?</h2>
            <p className="text-muted text-sm max-w-md">Descubre otras empresas en el Swipe Deck y guarda tus perfiles favoritos para colaboraciones futuras.</p>
          </div>
          <Primary onClick={() => navigate('/swipe')} size="lg" className="flex items-center gap-2 whitespace-nowrap">
            <Heart size={20} weight="bold" />
            Abrir Swipe Deck
          </Primary>
        </div>

      </div>
    </div>
  )
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1) // 1: Email, 2: Code
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      await API.sendOTP(email)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Error al enviar el código')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setError(null)
    try {
      const user = await API.verifyOTP(email, code)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex items-center justify-center px-6 overflow-hidden">
      {/* Login form */}
      <div className="max-w-sm w-full py-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-secondary border-3 border-black shadow-neu-sm mx-auto mb-6 flex items-center justify-center">
            <DeviceMobile size={32} weight="bold" color="#fff" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl mb-2">Iniciar Sesión</h1>
          <p className="text-muted text-sm">
            {step === 1 
              ? 'Ingresá tu email para recibir un código' 
              : `Ingresá el código enviado a ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-neubrut w-full"
                placeholder="email@ejemplo.com"
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
              disabled={loading || !email}
              size="lg"
              className="w-full justify-center disabled:opacity-50 mt-2"
            >
              {loading ? 'Enviando...' : 'Recibir código →'}
            </Accent>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block font-heading font-bold text-sm mb-2 uppercase tracking-wide">
                Código de Verificación
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="input-neubrut w-full text-center text-2xl tracking-[1em] font-black"
                placeholder="000000"
                maxLength={6}
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
              disabled={loading || code.length < 4}
              size="lg"
              className="w-full justify-center disabled:opacity-50 mt-2"
            >
              {loading ? 'Verificando...' : 'Ingresar →'}
            </Accent>
            
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-xs font-heading font-bold text-muted hover:text-black mt-4"
            >
              ← Volver a ingresar email
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Secondary size="sm" onClick={() => navigate('/')} className="inline-flex items-center gap-1">
            <ArrowLeft size={14} weight="bold" />
            Volver al inicio
          </Secondary>
        </div>
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Title */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl tracking-tight mb-2">
              Panel de Administración
            </h1>
            <p className="text-muted">Gestión centralizada de códigos QR y estadísticas</p>
          </div>
          <Secondary
            size="sm"
            onClick={() => { API.logout(); onLogout() }}
            className="text-accent border-accent hover:bg-accent hover:text-white"
          >
            Cerrar sesión
          </Secondary>
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
                      <CustomQRCode 
                        key={qr.qrId}
                        value={getRedirectUrl(qr.shortCode)} 
                        size={64} 
                        noPadding
                        noShadow
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
              <div className="mb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-2xl">Todos los QRs</h2>
                  <Secondary size="sm" onClick={loadData} className="flex items-center gap-1">
                    <ArrowLeft size={14} weight="bold" className="rotate-180" />
                    Refrescar
                  </Secondary>
                </div>

                <AnimatePresence>
                  {selected.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between bg-accent/10 border-2 border-accent p-2 px-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-accent w-2 h-2 rounded-full animate-pulse" />
                        <span className="text-xs font-heading font-bold text-accent uppercase tracking-wider">
                          {selected.length} seleccionado{selected.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <Accent size="sm" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 h-8">
                        <X size={14} weight="bold" />
                        Eliminar seleccionados
                      </Accent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {loading ? (
                <p className="text-muted text-center py-8 font-heading font-semibold">Cargando...</p>
              ) : qrs.length === 0 ? (
                <p className="text-muted text-center py-8 font-heading font-semibold">No hay QRs generados.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {qrs.map(qr => (
                    <div
                      key={qr.qr_id || qr.id}
                      className={`flex items-center gap-3 p-3 border-3 border-black bg-bg ${qr.status === 'blank' ? 'cursor-pointer' : 'opacity-60'}`}
                      onClick={() => {
                        if (qr.status !== 'blank') return
                        const id = qr.qr_id || qr.id
                        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
                      }}
                    >
                      {qr.status === 'blank' && (
                        <button
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onClick={e => {
                            e.stopPropagation()
                            const id = qr.qr_id || qr.id
                            setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
                          }}
                          style={{
                            width: 20,
                            height: 20,
                            border: '3px solid #000',
                            borderRadius: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s',
                            backgroundColor: selected.includes(qr.qr_id || qr.id) ? '#EF4444' : '#F5F5F5',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0,
                          }}
                        >
                          {selected.includes(qr.qr_id || qr.id) && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      )}
                      <CustomQRCode 
                        value={getRedirectUrl(qr.short_code)} 
                        size={36} 
                        noPadding 
                        noShadow
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

function ClaimPage({ onUpdateUser }) {
  const navigate = useNavigate()
  const { code: shortCode } = useParams()
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    tagline: ''
  })
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState(1) // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleStartClaim = async (e) => {
    e.preventDefault()
    if (!formData.companyName.trim() || !formData.email) return
    setLoading(true)
    setError(null)
    try {
      await API.sendOTP(formData.email)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Error al enviar el código de verificación.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndClaim = async (e) => {
    e.preventDefault()
    if (!otpCode) return
    setLoading(true)
    setError(null)
    try {
      // 1. Verificar el código y obtener sesión
      const user = await API.verifyOTP(formData.email, otpCode)
      
      // 2. Vincular el QR a la empresa
      const res = await API.claimQR(shortCode, formData.companyName, formData.tagline)
      if (res.error) throw new Error(res.error)
      
      // 3. Actualizar estado local del usuario con el nuevo nombre
      const updatedUser = { ...user, name: formData.companyName }
      localStorage.setItem('nexxo_user', JSON.stringify(updatedUser))
      onUpdateUser(updatedUser)
      
      setResult(res)
    } catch (err) {
      setError(err.message || 'Error en la verificación o reclamo.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-surface border-4 border-black shadow-neu-lg p-10 mb-8">
            <div className="w-20 h-20 bg-secondary border-4 border-black shadow-neu-sm mx-auto mb-6 flex items-center justify-center -rotate-6">
              <QrCode size={40} weight="bold" color="#fff" />
            </div>
            <h1 className="font-heading font-black text-4xl mb-4">¡Bienvenido a Nexxo!</h1>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Tu identidad digital ya está vinculada. <span className="font-bold text-black">{formData.companyName}</span> está lista para conectar.
            </p>
            <div className="flex justify-center mb-8 p-4 bg-white border-2 border-black/10">
              <CustomQRCode 
                value={getRedirectUrl(result.shortCode)} 
                size={180} 
              />
            </div>
            <div className="bg-bg p-4 border-3 border-black font-mono text-xs break-all">
              nexxo.social/r/{result.shortCode}
            </div>
          </div>
          <Primary onClick={() => navigate('/dashboard')} size="lg" className="w-full justify-center">
            Ir a mi Dashboard →
          </Primary>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-cols-1 lg:grid-cols-2">
      {/* Visual side */}
      <div className="hidden lg:flex bg-primary border-r-4 border-black flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 opacity-20">
          <QrCode size={200} weight="fill" />
        </div>
        <div className="relative z-10 text-center">
          <div className="bg-white border-4 border-black p-8 shadow-neu mb-8 inline-block -rotate-3">
             <CustomQRCode value={getRedirectUrl(shortCode)} size={200} />
          </div>
          <h2 className="font-heading font-black text-5xl mb-4">Tu llave al networking digital</h2>
          <p className="text-xl font-heading font-bold max-w-sm mx-auto">
            Reclama este código físico y comienza a construir tu presencia profesional hoy mismo.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8 md:p-16 bg-bg">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <span className="tag tag-red mb-4 inline-block">Activación Pendiente</span>
            <h1 className="font-heading font-black text-4xl md:text-5xl mb-3">
              {step === 1 ? 'Crea tu cuenta' : 'Verifica tu email'}
            </h1>
            <p className="text-muted">
              {step === 1 
                ? 'Ingresa los datos para vincular este QR a tu perfil profesional.'
                : `Ingresa el código de 6 dígitos enviado a ${formData.email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStartClaim} className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label-neubrut">Nombre de la Empresa / Profesional</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                    placeholder="Ej: Nexxo Corp"
                    className="input-neubrut w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-neubrut">Email Profesional</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@tuempresa.com"
                    className="input-neubrut w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-neubrut">Slogan / Tagline <span className="text-muted font-normal">(opcional)</span></label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => setFormData({...formData, tagline: e.target.value})}
                    placeholder="Ej: Innovación en networking"
                    className="input-neubrut w-full"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-accent text-sm font-bold bg-accent/10 border-2 border-accent p-3"
                >
                  {error}
                </motion.p>
              )}

              <Accent
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full justify-center mt-6"
              >
                {loading ? 'Enviando código...' : 'Siguiente: Verificar Email →'}
              </Accent>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndClaim} className="space-y-5">
              <div>
                <label className="label-neubrut">Código de Verificación</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="input-neubrut w-full text-center text-3xl font-black tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-accent text-sm font-bold bg-accent/10 border-2 border-accent p-3"
                >
                  {error}
                </motion.p>
              )}

              <Accent
                type="submit"
                disabled={loading || otpCode.length < 6}
                size="lg"
                className="w-full justify-center mt-6"
              >
                {loading ? 'Verificando...' : 'Activar mi QR ahora →'}
              </Accent>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-heading font-bold text-muted hover:text-black mt-4"
              >
                ← Volver a editar datos
              </button>
            </form>
          )}

          <p className="text-center text-[10px] text-muted mt-8 font-mono uppercase tracking-widest">
            Al activar, este QR físico quedará bloqueado permanentemente a tu cuenta.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── QR Redirector ────────────────────────────────────────────────────────────
function QRRedirector() {
  const { code } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const checkQR = async () => {
      try {
        const res = await API.getQR(code)
        if (res.status === 'blank') {
          navigate(`/claim/${code}`, { replace: true })
        } else if (res.status === 'active' && res.company_id) {
          // Si está activo, redirigir al perfil de la empresa (mocked por ahora o vía slug)
          // En una app real buscaríamos el slug de la empresa
          navigate(`/dashboard`, { replace: true }) 
        } else {
          navigate('/', { replace: true })
        }
      } catch (err) {
        console.error('Redirect error:', err)
        navigate('/', { replace: true })
      }
    }
    checkQR()
  }, [code, navigate])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-heading font-bold animate-pulse">Redirigiendo...</p>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
function AppContent() {
  const [user, setUser] = useState(() => API.getCurrentUser())
  const location = useLocation()
  
  // Ocultar nav en rutas de onboarding/registro para enfoque total
  const hideNav = location.pathname.startsWith('/claim/') || location.pathname.startsWith('/r/')

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <Navbar user={user} onLogout={() => setUser(null)} />}
      <main className={`flex-1 ${hideNav ? 'pt-0' : 'pt-24 pb-20 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/swipe" element={<SwipeDeck user={user} onBack={() => window.history.back()} />} />
          <Route path="/claim/:code" element={<ClaimPage onUpdateUser={(u) => setUser(u)} />} />
          <Route path="/r/:code" element={<QRRedirector />} />
          <Route path="/login" element={
            user 
              ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> 
              : <LoginPage onLogin={(u) => setUser(u)} />
          } />
          <Route path="/admin" element={
            user && user.role === 'admin' 
              ? <AdminDashboard user={user} onLogout={() => setUser(null)} /> 
              : <Navigate to="/login" replace />
          } />
          <Route path="/claim" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideNav && <MobileNav user={user} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
