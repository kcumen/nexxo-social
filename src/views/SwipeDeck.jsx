import { useState, useEffect, useRef, useCallback } from 'react'
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
import { Primary, Secondary, Accent } from '../components/Buttons'

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
    tagline: 'Fintech para Latam',
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

// ── Umbral de swipe para activar ───────────────────────────────────────────────
const SWIPE_THRESHOLD = 100 // px

// ── Componente: Overlay de swipe sobre la card ─────────────────────────────────
function SwipeOverlay({ offsetX }) {
  if (Math.abs(offsetX) < 20) return null

  const isRight = offsetX > 0
  const opacity = Math.min(Math.abs(offsetX) / SWIPE_THRESHOLD, 1) * 0.9

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 rounded-none`}
      style={{ opacity }}
    >
      <div
        className={`border-4 font-heading font-black text-3xl px-6 py-3 rotate-[-15deg] ${
          isRight
            ? 'border-accent bg-accent text-white'
            : 'border-black bg-black text-white'
        }`}
      >
        {isRight ? 'CONNECT' : 'PASS'}
      </div>
    </div>
  )
}

// ── Componente: Tarjeta de empresa con gestos ──────────────────────────────────
function CompanyCard({ company, onSwipe }) {
  const cardRef = useRef(null)
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const badge = company.badge ? BADGE_CONFIG[company.badge] : null

  // Rotation: inclinar la card según cuánto se arrastra
  const rotation = offsetX * 0.05 // ~0.8deg cada 10px
  const opacity = isDragging ? 1 : 1

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e) => {
    setIsDragging(true)
    startX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    const delta = e.touches[0].clientX - startX.current
    setOffsetX(delta)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      const dir = offsetX > 0 ? 'right' : 'left'
      setOffsetX(offsetX > 0 ? 400 : -400)
      setTimeout(() => onSwipe(dir), 200)
    } else {
      setOffsetX(0)
    }
  }, [offsetX, onSwipe])

  // ── Mouse handlers (desktop) ─────────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    startX.current = e.clientX

    const handleMouseMove = (e) => {
      const delta = e.clientX - startX.current
      setOffsetX(delta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
        const dir = offsetX > 0 ? 'right' : 'left'
        setOffsetX(offsetX > 0 ? 400 : -400)
        setTimeout(() => onSwipe(dir), 200)
      } else {
        setOffsetX(0)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [offsetX, onSwipe])

  return (
    <div
      ref={cardRef}
      className="card relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{
        minHeight: '380px',
        maxHeight: '560px',
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Overlay de swipe (aparece mientras arrastás) */}
      <SwipeOverlay offsetX={offsetX} />

      {/* Badge superior */}
      {badge && (
        <div className={`absolute top-3 left-3 ${badge.color} border-2 border-black shadow-neu-sm px-2 py-1 flex items-center gap-1 z-10`}>
          <badge.Icon size={12} weight="bold" />
          <span className="font-heading font-bold text-xs uppercase tracking-wide">{badge.label}</span>
        </div>
      )}

      {/* Contenido scrolleable */}
      <div className="overflow-y-auto" style={{ maxHeight: '540px' }}>
        {/* Logo de empresa */}
        <div className="flex justify-center mt-6 mb-3">
          <div className="w-16 h-16 border-3 border-black shadow-neu-md bg-primary flex items-center justify-center">
            <span className="font-heading font-black text-3xl text-text">{company.logoLetter}</span>
          </div>
        </div>

        {/* Info principal */}
        <div className="text-center mb-3 px-3">
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-0.5">{company.name}</h2>
          <div className="flex items-center justify-center gap-1 text-xs text-muted mb-1">
            <MapPin size={12} weight="bold" />
            <span>{company.location}</span>
            <span className="mx-0.5">·</span>
            <Tag size={12} weight="bold" />
            <span>{company.industry}</span>
          </div>
          <p className="font-heading font-semibold text-accent text-sm">{company.tagline}</p>
        </div>

        {/* Divider */}
        <div className="border-t-3 border-black mx-3 mb-3" />

        {/* Descripción */}
        <p className="text-sm text-muted leading-relaxed mb-3 text-center px-4">
          {company.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3 px-3">
          {company.tags.map(tag => (
            <span key={tag} className="tag text-[10px] py-1 px-2">{tag}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="border-t-3 border-black pt-3 pb-3 mt-auto">
          <div className="flex justify-around">
            <div className="text-center px-2">
              <div className="font-heading font-extrabold text-xl">{company.scans}</div>
              <div className="text-[10px] text-muted uppercase tracking-wide">escaneos</div>
            </div>
            <div className="w-px bg-black" />
            <div className="text-center px-2">
              <div className="font-heading font-extrabold text-xl text-accent">{company.matches}</div>
              <div className="text-[10px] text-muted uppercase tracking-wide">matches</div>
            </div>
            <div className="w-px bg-black" />
            <div className="text-center px-2">
              <div className="font-heading font-extrabold text-xl text-secondary">{company.industry.slice(0, 3)}</div>
              <div className="text-[10px] text-muted uppercase tracking-wide">sector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint de gesto */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 opacity-40 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <X size={12} weight="bold" className="text-muted" />
          <span className="text-[10px] text-muted font-mono">Arrastrá</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart size={12} weight="bold" className="text-accent" />
          <span className="text-[10px] text-muted font-mono">o botones</span>
        </div>
      </div>
    </div>
  )
}

// ── Componente: Modal de Match ────────────────────────────────────────────────
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

        <Primary onClick={onClose} className="w-full justify-center">
          Continuar swipeando
        </Primary>
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
      <Primary onClick={onBack}>
        ← Volver al inicio
      </Primary>
    </div>
  )
}

// ── Vista principal: SwipeDeck ─────────────────────────────────────────────────
export default function SwipeDeck({ onBack }) {
  const [companies, setCompanies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchCompany, setMatchCompany] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [eventName] = useState('LATAM Tech Summit 2026')

  // Cargar empresas (mock por ahora)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompanies(MOCK_COMPANIES)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleSwipe = useCallback((direction) => {
    const company = companies[currentIndex]
    if (direction === 'right') {
      setSavedIds(prev => new Set([...prev, company.id]))
      setMatchCompany(company)
    }
    setCurrentIndex(prev => prev + 1)
  }, [companies, currentIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'l') handleSwipe('right')
      if (e.key === 'ArrowLeft' || e.key === 'h') handleSwipe('left')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwipe])

  const currentCompany = companies[currentIndex]
  const progress = companies.length > 0
    ? `${currentIndex} de ${companies.length}`
    : ''

  return (
    <div className="min-h-screen bg-bg flex flex-col" style={{ height: '100dvh', overscrollBehavior: 'none', touchAction: 'none' }}>
      {/* Header */}
      <div className="border-b-3 border-black px-4 py-3 flex items-center gap-3 bg-surface flex-shrink-0">
        <Secondary size="sm" onClick={onBack} className="flex items-center gap-1.5 flex-shrink-0">
          <ArrowLeft size={14} weight="bold" />
          <span className="hidden sm:inline">Volver</span>
        </Secondary>

        <div className="flex-1 text-center min-w-0">
          <div className="font-heading font-bold text-sm truncate">{eventName}</div>
          <div className="text-xs text-muted">{progress}</div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Heart size={16} weight="bold" className="text-accent" />
          <span className="font-heading font-extrabold text-base">{savedIds.size}</span>
          <span className="text-xs text-muted font-heading hidden sm:inline">saved</span>
        </div>
      </div>

      {/* Deck — toma todo el espacio disponible */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-3 overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 border-3 border-black bg-surface shadow-neu-md flex items-center justify-center mb-3 animate-pulse">
              <Buildings size={28} weight="bold" className="text-muted" />
            </div>
            <p className="font-heading font-semibold text-muted text-sm">Cargando empresas...</p>
          </div>
        ) : currentCompany ? (
          <>
            {/* Company card — flexible height, fills available space */}
            <div className="flex-1 min-h-0">
              <CompanyCard
                key={currentCompany.id}
                company={currentCompany}
                onSwipe={handleSwipe}
              />
            </div>

            {/* Action buttons — siempre visibles en bottom */}
            <div className="flex items-center gap-3 pt-3 pb-1 flex-shrink-0">
              <Accent circle onClick={() => handleSwipe('left')} style={{ touchAction: 'manipulation' }}>
                <X size={22} weight="bold" />
              </Accent>

              <Primary onClick={() => handleSwipe('right')} className="flex-1" style={{ touchAction: 'manipulation' }}>
                <Heart size={20} weight="bold" />
                <span className="text-base">Connect</span>
              </Primary>
            </div>
          </>
        ) : (
          <EmptyState onBack={onBack} />
        )}
      </div>

      {/* Saved companies preview */}
      {!loading && savedIds.size > 0 && (
        <div className="border-t-3 border-black px-4 py-3 bg-surface flex-shrink-0 max-h-40 overflow-y-auto">
          <h3 className="font-heading font-bold text-sm mb-2 flex items-center gap-1.5">
            <Heart size={14} weight="bold" className="text-accent" />
            Tus matches ({savedIds.size})
          </h3>
          <div className="space-y-1.5">
            {[...savedIds].map(id => {
              const c = companies.find(x => x.id === id)
              if (!c) return null
              return (
                <div key={id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 border-2 border-black shadow-neu-sm bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="font-heading font-black text-xs">{c.logoLetter}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-bold text-xs truncate">{c.name}</div>
                    <div className="text-[10px] text-muted">{c.location}</div>
                  </div>
                  <Heart size={12} weight="bold" className="text-accent flex-shrink-0" />
                </div>
              )
            })}
          </div>
        </div>
      )}

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
