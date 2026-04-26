import { useState, useEffect, useRef } from 'react'
import {
  X,
  Heart,
  Buildings,
  MapPin,
  Tag,
  ArrowLeft,
  Star,
  Check,
  Crown,
  Lightning,
} from '@phosphor-icons/react'

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

// ── Tipos de badges para empresas ─────────────────────────────────────────────
const BADGE_CONFIG = {
  featured: { Icon: Crown, label: 'Featured', color: 'bg-primary' },
  trending: { Icon: Lightning, label: 'Trending', color: 'bg-accent text-white' },
  new: { Icon: Star, label: 'Nuevo', color: 'bg-secondary text-white' },
  verified: { Icon: Check, label: 'Verificado', color: 'bg-success text-white' },
}

// ── Mock data para desarrollo ─────────────────────────────────────────────────
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'Mercado Tech',
    tagline: 'Fintech paraLatam',
    location: 'Buenos Aires, AR',
    industry: 'Fintech',
    description: 'Construimos la próxima generación de pagos digitales para América Latina. Buscamos partners estratégicos y talento tech.',
    tags: ['Fintech', 'Payments', 'API', 'B2B'],
    scans: 47,
    matches: 12,
    badge: 'featured',
    logoLetter: 'M',
  },
  {
    id: '2',
    name: 'DataSphere',
    tagline: 'Analytics predictivo con IA',
    location: 'São Paulo, BR',
    industry: 'AI / Data',
    description: 'Plataforma de analytics que predice churn y optimiza retención. Estamos levantando ronda seed.',
    tags: ['AI', 'Machine Learning', 'SaaS', 'B2B'],
    scans: 31,
    matches: 8,
    badge: 'trending',
    logoLetter: 'D',
  },
  {
    id: '3',
    name: 'CloudFlow',
    tagline: 'Infraestructura cloud gestionada',
    location: 'Ciudad de México, MX',
    industry: 'DevOps',
    description: 'Ayudamos empresas a migrar y gestionar su infraestructura en AWS/GCP/AZURE. Certificados en todos los clouds majors.',
    tags: ['AWS', 'GCP', 'DevOps', 'Cloud'],
    scans: 28,
    matches: 6,
    badge: null,
    logoLetter: 'C',
  },
  {
    id: '4',
    name: 'LegalSync',
    tagline: 'Abogados on-demand para startups',
    location: 'Madrid, ES',
    industry: 'Legal Tech',
    description: 'Contratos, propiedad intelectual, levée de fondos. Legal para founders, sin retainer.',
    tags: ['Legal Tech', 'Startups', 'Contracts'],
    scans: 19,
    matches: 4,
    badge: 'new',
    logoLetter: 'L',
  },
  {
    id: '5',
    name: 'GrowthLab',
    tagline: 'Agencia de crecimiento B2B',
    location: 'Bogotá, CO',
    industry: 'Marketing',
    description: 'Generamos leads qualificados para empresas SaaS. Metodología outbound + content. CAC garantizado.',
    tags: ['B2B', 'Growth', 'Marketing', 'SaaS'],
    scans: 22,
    matches: 9,
    badge: null,
    logoLetter: 'G',
  },
]

// ── Componente: Tarjeta de empresa ──────────────────────────────────────────
function CompanyCard({ company, onSwipe, swipeDir }) {
  const badge = company.badge ? BADGE_CONFIG[company.badge] : null

  return (
    <div
      className={`card relative w-full max-w-md mx-auto overflow-hidden transition-transform duration-300 ${
        swipeDir === 'right' ? 'translate-x-32 rotate-12 opacity-0' :
        swipeDir === 'left' ? '-translate-x-32 -rotate-12 opacity-0' : ''
      }`}
      style={{ minHeight: '420px' }}
    >
      {/* Badge superior */}
      {badge && (
        <div className={`absolute top-4 left-4 ${badge.color} border-2 border-black shadow-neu-sm px-3 py-1 flex items-center gap-1.5 z-10`}>
          <badge.Icon size={13} weight="bold" />
          <span className="font-heading font-bold text-xs uppercase tracking-wide">{badge.label}</span>
        </div>
      )}

      {/* Logo de empresa */}
      <div className="flex justify-center mt-6 mb-4">
        <div className="w-20 h-20 border-3 border-black shadow-neu-md bg-primary flex items-center justify-center">
          <span className="font-heading font-black text-4xl text-text">{company.logoLetter}</span>
        </div>
      </div>

      {/* Info principal */}
      <div className="text-center mb-4">
        <h2 className="font-heading font-extrabold text-3xl tracking-tight mb-1">{company.name}</h2>
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted mb-2">
          <MapPin size={14} weight="bold" />
          <span>{company.location}</span>
          <span className="mx-1">·</span>
          <Tag size={14} weight="bold" />
          <span>{company.industry}</span>
        </div>
        <p className="font-heading font-semibold text-accent text-base mb-1">{company.tagline}</p>
      </div>

      {/* Divider */}
      <div className="border-t-3 border-black mb-4" />

      {/* Descripción */}
      <p className="text-sm text-muted leading-relaxed mb-4 text-center px-2">
        {company.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {company.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="border-t-3 border-black pt-4 mt-auto">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="font-heading font-extrabold text-2xl">{company.scans}</div>
            <div className="text-xs text-muted uppercase tracking-wide">escaneos</div>
          </div>
          <div className="w-px bg-black" />
          <div className="text-center">
            <div className="font-heading font-extrabold text-2xl text-accent">{company.matches}</div>
            <div className="text-xs text-muted uppercase tracking-wide">matches</div>
          </div>
          <div className="w-px bg-black" />
          <div className="text-center">
            <div className="font-heading font-extrabold text-2xl text-secondary">{company.industry.slice(0, 3)}</div>
            <div className="text-xs text-muted uppercase tracking-wide">sector</div>
          </div>
        </div>
      </div>

      {/* Swipe hint */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-50">
        <span className="text-xs text-muted font-mono">✗ Pass</span>
        <span className="text-xs text-muted font-mono">·</span>
        <span className="text-xs text-muted font-mono">♥ Connect</span>
      </div>
    </div>
  )
}

// ── Componente: Botón de acción ──────────────────────────────────────────────
function ActionButton({ onClick, variant = 'pass', children }) {
  const isPass = variant === 'pass'
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 border-3 border-black shadow-neu-md font-heading font-bold text-lg transition-all hover:translate-y-[-2px] hover:shadow-neu-lg active:translate-y-1 active:shadow-neu-sm ${
        isPass
          ? 'bg-surface text-text hover:bg-bg'
          : 'bg-accent text-white hover:bg-accent/90'
      }`}
    >
      {children}
    </button>
  )
}

// ── Componente: Modal de Match ───────────────────────────────────────────────
function MatchModal({ company, onClose }) {
  if (!company) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card text-center max-w-sm w-full reveal">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto border-3 border-black shadow-neu-md bg-accent flex items-center justify-center mb-4">
            <Heart size={32} weight="bold" className="text-white" />
          </div>
          <h2 className="font-heading font-extrabold text-4xl tracking-tight mb-2">
            ¡Match!
          </h2>
          <p className="text-muted text-sm">
            Te conectaste con <strong>{company.name}</strong>
          </p>
        </div>

        <div className="border-t-3 border-black pt-4 mb-6">
          <div className="w-14 h-14 mx-auto border-3 border-black shadow-neu-sm bg-primary flex items-center justify-center mb-3">
            <span className="font-heading font-black text-2xl">{company.logoLetter}</span>
          </div>
          <p className="font-heading font-semibold text-lg">{company.name}</p>
          <p className="text-sm text-muted">{company.tagline}</p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full justify-center"
        >
          Continuar swipeando
        </button>
      </div>
    </div>
  )
}

// ── Componente: Stack vacío ──────────────────────────────────────────────────
function EmptyState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 border-3 border-black shadow-neu-md bg-surface flex items-center justify-center mb-6">
        <Buildings size={40} weight="bold" className="text-muted" />
      </div>
      <h2 className="font-heading font-extrabold text-3xl mb-3">No hay más empresas</h2>
      <p className="text-muted text-base mb-8 max-w-xs">
        Ya viste todas las empresas en este evento. Volvé cuando haya más attendees.
      </p>
      <button onClick={onBack} className="btn-primary">
        ← Volver al inicio
      </button>
    </div>
  )
}

// ── Vista principal: SwipeDeck ─────────────────────────────────────────────────
export default function SwipeDeck({ onBack }) {
  const [companies, setCompanies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDir, setSwipeDir] = useState(null)
  const [matchCompany, setMatchCompany] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [eventName] = useState('LATAM Tech Summit 2026')

  // Cargar empresas (mock por ahora)
  useEffect(() => {
    // En producción esto llama a /api/events/:id/attendees
    const timer = setTimeout(() => {
      setCompanies(MOCK_COMPANIES)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSwipe = (direction) => {
    const company = companies[currentIndex]
    setSwipeDir(direction)

    setTimeout(() => {
      if (direction === 'right') {
        setSavedIds(prev => new Set([...prev, company.id]))
        setMatchCompany(company)
      }
      setSwipeDir(null)
      setCurrentIndex(prev => prev + 1)
    }, 300)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'l') handleSwipe('right')
    if (e.key === 'ArrowLeft' || e.key === 'h') handleSwipe('left')
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, companies])

  const remaining = companies.length - currentIndex
  const currentCompany = companies[currentIndex]
  const progress = companies.length > 0
    ? `${currentIndex} de ${companies.length} empresas`
    : ''

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b-3 border-black px-6 md:px-12 py-4 flex items-center gap-4 bg-surface sticky top-0 z-20">
        <button
          onClick={onBack}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} weight="bold" />
          Volver
        </button>

        <div className="flex-1 text-center">
          <div className="font-heading font-bold text-base">{eventName}</div>
          <div className="text-xs text-muted">{progress}</div>
        </div>

        <div className="flex items-center gap-2">
          <Heart size={18} weight="bold" className="text-accent" />
          <span className="font-heading font-extrabold text-lg">{savedIds.size}</span>
          <span className="text-sm text-muted font-heading">saved</span>
        </div>
      </div>

      {/* Deck area */}
      <div className="px-6 py-8 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-3 border-black bg-surface shadow-neu-md flex items-center justify-center mb-4 animate-pulse">
              <Buildings size={32} weight="bold" className="text-muted" />
            </div>
            <p className="font-heading font-semibold text-muted">Cargando empresas...</p>
          </div>
        ) : currentCompany ? (
          <>
            {/* Company card */}
            <div className="mb-8">
              <CompanyCard
                key={currentCompany.id}
                company={currentCompany}
                onSwipe={handleSwipe}
                swipeDir={swipeDir}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6">
              <ActionButton onClick={() => handleSwipe('left')} variant="pass">
                <X size={24} weight="bold" />
                Pass
              </ActionButton>

              <ActionButton onClick={() => handleSwipe('right')} variant="connect">
                <Heart size={24} weight="bold" />
                Connect
              </ActionButton>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-muted mt-6 font-mono">
              Usá ← → o H L para hacer swipe rápido
            </p>
          </>
        ) : (
          <EmptyState onBack={onBack} />
        )}

        {/* Saved companies preview */}
        {!loading && savedIds.size > 0 && (
          <div className="mt-12">
            <h3 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
              <Heart size={20} weight="bold" className="text-accent" />
              Tus matches ({savedIds.size})
            </h3>
            <div className="space-y-2">
              {[...savedIds].map(id => {
                const c = companies.find(x => x.id === id)
                if (!c) return null
                return (
                  <div key={id} className="qr-row">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-3 border-black shadow-neu-sm bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="font-heading font-black text-sm">{c.logoLetter}</span>
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-muted">{c.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <Heart size={14} weight="bold" />
                      <span className="text-xs font-heading font-semibold">Match</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Match modal */}
      {matchCompany && (
        <MatchModal
          company={matchCompany}
          onClose={() => setMatchCompany(null)}
        />
      )}
    </div>
  )
}
