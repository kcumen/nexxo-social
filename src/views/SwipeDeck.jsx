import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
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
  Sparkle,
  Globe,
  Users,
} from '@phosphor-icons/react'
import { Primary, Secondary, Accent } from '../components/Buttons'
import { API } from '../App'

// ── Configuration ─────────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  featured: { Icon: Crown, label: 'Destacada', color: 'bg-primary', textColor: 'text-text' },
  trending: { Icon: Lightning, label: 'Tendencia', color: 'bg-accent', textColor: 'text-white' },
  new: { Icon: Star, label: 'Nueva', color: 'bg-secondary', textColor: 'text-white' },
  verified: { Icon: Check, label: 'Verificada', color: 'bg-success', textColor: 'text-white' },
}

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
    accentColor: '#FACC15',
    employees: '50-100',
    website: 'mercadotech.co'
  },
  {
    id: '2',
    name: 'DataSphere',
    tagline: 'Analytics predictivo con IA',
    location: 'São Paulo, BR',
    industry: 'AI / Data',
    description: 'Plataforma de analytics que predice churn y optimiza retención. Estamos levantando ronda seed para expansión regional.',
    tags: ['AI', 'Machine Learning', 'SaaS', 'B2B'],
    scans: 31,
    matches: 8,
    badge: 'trending',
    logoLetter: 'D',
    accentColor: '#EF4444',
    employees: '10-20',
    website: 'datasphere.io'
  },
  {
    id: '3',
    name: 'CloudFlow',
    tagline: 'Infraestructura cloud gestionada',
    location: 'Ciudad de México, MX',
    industry: 'DevOps',
    description: 'Ayudamos empresas a migrar y gestionar su infraestructura en AWS/GCP/AZURE. Expertos en Kubernetes y seguridad.',
    tags: ['AWS', 'GCP', 'DevOps', 'Cloud'],
    scans: 28,
    matches: 6,
    badge: 'verified',
    logoLetter: 'C',
    accentColor: '#3B82F6',
    employees: '20-50',
    website: 'cloudflow.mx'
  },
  {
    id: '4',
    name: 'LegalSync',
    tagline: 'Abogados on-demand para startups',
    location: 'Madrid, ES',
    industry: 'Legal Tech',
    description: 'Contratos, propiedad intelectual, levantamiento de capital. Soluciones legales ágiles para founders modernos.',
    tags: ['Legal Tech', 'Startups', 'Contracts'],
    scans: 19,
    matches: 4,
    badge: 'new',
    logoLetter: 'L',
    accentColor: '#A855F7',
    employees: '5-10',
    website: 'legalsync.es'
  },
  {
    id: '5',
    name: 'GrowthLab',
    tagline: 'Agencia de crecimiento B2B',
    location: 'Bogotá, CO',
    industry: 'Marketing',
    description: 'Generamos leads cualificados para empresas SaaS. Metodología outbound + content de alto impacto.',
    tags: ['B2B', 'Growth', 'Marketing', 'SaaS'],
    scans: 22,
    matches: 9,
    badge: null,
    logoLetter: 'G',
    accentColor: '#10B981',
    employees: '15-30',
    website: 'growthlab.co'
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function CompanyCard({ company, onSwipe, index, total }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8])
  
  const opacityPass = useTransform(x, [-150, -50], [1, 0])
  const opacityConnect = useTransform(x, [50, 150], [0, 1])
  
  const badge = company.badge ? BADGE_CONFIG[company.badge] : null
  
  return (
    <motion.div
      style={{ 
        zIndex: total - index,
        gridArea: '1 / 1 / 2 / 2',
        x,
        rotate,
        opacity,
        scale
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500
        if (swipe) {
          onSwipe(offset.x > 0 ? 'right' : 'left')
        }
      }}
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={(custom) => ({
        x: custom > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.5,
        rotate: custom > 0 ? 45 : -45,
        transition: { duration: 0.4, ease: "easeIn" }
      })}
      className="card relative w-full h-full flex flex-col cursor-grab active:cursor-grabbing bg-white select-none overflow-hidden"
    >
      {/* Visual Feedback Overlays */}
      <motion.div 
        className="absolute inset-0 bg-secondary/50 z-10 pointer-events-none flex items-center justify-center"
        style={{ opacity: opacityConnect }}
      >
        <div className="border-8 border-secondary px-8 py-4 rotate-12 font-heading font-black text-6xl text-secondary bg-white shadow-neu-md">
          CONNECT
        </div>
      </motion.div>

      <motion.div 
        className="absolute inset-0 bg-accent/50 z-10 pointer-events-none flex items-center justify-center"
        style={{ opacity: opacityPass }}
      >
        <div className="border-8 border-accent px-8 py-4 -rotate-12 font-heading font-black text-6xl text-accent bg-white shadow-neu-md">
          PASS
        </div>
      </motion.div>

      {/* Card Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        {/* Header: Logo + Badges */}
        <div className="flex justify-between items-start mb-4">
          <div 
            className="w-16 h-16 border-4 border-black shadow-neu-md flex items-center justify-center text-3xl font-heading font-black"
            style={{ backgroundColor: company.accentColor || '#FACC15' }}
          >
            {company.logoLetter}
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            {badge && (
              <div className={`${badge.color} ${badge.textColor} border-2 border-black shadow-neu-sm px-3 py-1 flex items-center gap-1.5`}>
                <badge.Icon size={14} weight="bold" />
                <span className="font-heading font-bold text-[10px] uppercase tracking-wider">{badge.label}</span>
              </div>
            )}
            <div className="bg-white border-2 border-black shadow-neu-sm px-2 py-1 flex items-center gap-1.5">
              <Users size={12} weight="bold" />
              <span className="font-mono text-[10px] font-bold">{company.employees}</span>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="mb-4">
          <h2 className="font-heading font-black text-2xl md:text-3xl leading-none mb-1 tracking-tight">
            {company.name}
          </h2>
          <p className="text-accent font-heading font-bold text-base leading-tight">
            {company.tagline}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/10 border-2 border-black flex items-center justify-center">
              <MapPin size={16} weight="bold" className="text-secondary" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-muted leading-none">Ubicación</p>
              <p className="text-xs font-bold">{company.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 border-2 border-black flex items-center justify-center">
              <Tag size={16} weight="bold" className="text-text" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-muted leading-none">Sector</p>
              <p className="text-xs font-bold">{company.industry}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-bg border-3 border-black p-3 mb-4 relative">
          <div className="absolute -top-3 -left-2 bg-white border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
            About
          </div>
          <p className="text-xs leading-relaxed text-text">
            {company.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {company.tags.map(tag => (
            <span key={tag} className="tag text-[10px] py-1 px-3 bg-white border-2 border-black shadow-neu-xs hover:bg-primary transition-colors cursor-default">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Link */}
        <div className="flex items-center gap-2 text-muted hover:text-text transition-colors">
          <Globe size={16} />
          <span className="font-mono text-xs font-bold">{company.website}</span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-black text-white p-2.5 flex justify-around items-center border-t-3 border-black">
        <div className="text-center">
          <div className="text-xl font-heading font-black">{company.scans}</div>
          <div className="text-[9px] uppercase font-bold opacity-60">Escaneos</div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="text-center">
          <div className="text-xl font-heading font-black text-primary">{company.matches}</div>
          <div className="text-[9px] uppercase font-bold opacity-60">Matches</div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="text-center">
          <Sparkle size={20} weight="fill" className="text-accent mx-auto mb-1" />
          <div className="text-[9px] uppercase font-bold opacity-60">VIP</div>
        </div>
      </div>
    </motion.div>
  )
}

function MatchModal({ company, onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, rotate: -10, y: 100 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        className="card max-w-sm w-full bg-primary border-4 border-black text-center relative overflow-hidden"
      >
        {/* Animated Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1.5, 0],
                x: Math.random() * 300 - 150,
                y: Math.random() * 400 - 200
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkle weight="fill" className="text-accent" size={24} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 py-10 px-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="w-24 h-24 mx-auto bg-white border-4 border-black shadow-neu-lg flex items-center justify-center mb-8"
          >
            <Heart size={48} weight="fill" className="text-accent" />
          </motion.div>

          <h2 className="font-heading font-black text-5xl mb-4 tracking-tighter leading-none">
            ¡ES UN MATCH!
          </h2>
          
          <p className="font-heading font-bold text-lg mb-8 bg-black text-white py-2 px-4 inline-block">
            {company.name}
          </p>

          <p className="text-sm font-bold mb-10 leading-relaxed max-w-[200px] mx-auto">
            Te has conectado con éxito. Ahora pueden ver sus perfiles completos.
          </p>

          <div className="space-y-3">
            <Primary onClick={onClose} size="lg" className="w-full justify-center text-xl">
              SEGUIR EXPLORANDO
            </Primary>
            <button 
              onClick={onClose}
              className="text-xs font-mono font-bold uppercase tracking-widest hover:underline"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ onBack }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center flex-1 px-8 text-center"
    >
      <div className="w-24 h-24 bg-white border-4 border-black shadow-neu-md flex items-center justify-center mb-8 rotate-3">
        <Buildings size={48} weight="bold" className="text-muted" />
      </div>
      <h2 className="font-heading font-black text-4xl mb-4 leading-tight">TODO VISTO POR AHORA</h2>
      <p className="text-muted font-bold mb-10 max-w-xs mx-auto">
        Has explorado todas las empresas disponibles en el evento. ¡Vuelve pronto para nuevas conexiones!
      </p>
      <Secondary onClick={onBack} size="lg" className="gap-2">
        <ArrowLeft weight="bold" />
        VOLVER AL INICIO
      </Secondary>
    </motion.div>
  )
}

function UpgradeModal({ onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="card max-w-sm w-full bg-white border-4 border-black p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto bg-[#FFD700] border-4 border-black shadow-neu flex items-center justify-center mb-6 -rotate-6">
          <Crown size={40} weight="fill" className="text-black" />
        </div>

        <h2 className="font-heading font-black text-3xl mb-4 leading-tight">
          LÍMITE ALCANZADO
        </h2>
        
        <p className="text-sm font-bold text-muted mb-8 leading-relaxed">
          Has agotado tus 10 swipes gratuitos. En eventos presenciales, puedes seguir conectando <span className="text-black">escaneando directamente los QRs</span> de las empresas.
        </p>

        <div className="bg-bg border-2 border-black p-4 mb-8 text-left">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-secondary">Beneficios Pro:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs font-bold">
              <Check weight="bold" className="text-success" /> Swipes ilimitados
            </li>
            <li className="flex items-center gap-2 text-xs font-bold">
              <Check weight="bold" className="text-success" /> Perfil destacado
            </li>
            <li className="flex items-center gap-2 text-xs font-bold">
              <Check weight="bold" className="text-success" /> Analytics en tiempo real
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Primary onClick={() => {}} size="lg" className="w-full justify-center bg-[#FFD700]">
            MEJORAR A PRO →
          </Primary>
          <button 
            onClick={onClose}
            className="text-xs font-mono font-bold uppercase tracking-widest hover:underline"
          >
            Continuar gratis (Solo QR)
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SwipeDeck({ user, onBack }) {
  const [companies, setCompanies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchCompany, setMatchCompany] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [swipesCount, setSwipesCount] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [lastDirection, setLastDirection] = useState(0)

  useEffect(() => {
    // Fetch initial stats and companies
    const loadData = async () => {
      try {
        const [stats, qrs] = await Promise.all([
          API.getUserStats().catch(() => ({ swipes: 0 })),
          new Promise(resolve => setTimeout(() => resolve(MOCK_COMPANIES), 800))
        ])
        setSwipesCount(stats.swipes || 0)
        setCompanies(qrs)
      } catch (e) {
        console.error(e)
        setCompanies(MOCK_COMPANIES)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSwipe = useCallback(async (direction) => {
    const company = companies[currentIndex]
    
    if (direction === 'right') {
      // Verificar límites
      if (!user?.is_premium && swipesCount >= 10) {
        setShowUpgradeModal(true)
        return
      }

      setLastDirection(1)
      setSavedIds(prev => new Set([...prev, company.id]))
      setSwipesCount(prev => prev + 1)

      // Guardar en backend
      try {
        await API.saveSwipe(company.id)
      } catch (e) {
        console.error("Error saving swipe:", e)
      }

      // Simular match
      if (Math.random() > 0.3) {
        setMatchCompany(company)
      }
    } else {
      setLastDirection(-1)
    }
    
    setCurrentIndex(prev => prev + 1)
  }, [companies, currentIndex, user, swipesCount])

  const currentCompany = companies[currentIndex]

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden font-sans">
      {/* Dynamic Header */}
      <header className="border-b-4 border-black px-6 py-4 flex items-center justify-between bg-white z-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 border-3 border-black shadow-neu-xs flex items-center justify-center hover:bg-primary transition-colors"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>

        <div className="flex flex-col items-center">
          <span className="font-heading font-black text-sm tracking-tight">LATAM TECH SUMMIT</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-muted">Explorando ahora</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!user?.is_premium && (
            <div className="hidden sm:flex items-center gap-2 bg-bg border-2 border-black px-3 py-1 font-mono text-[10px] font-bold">
              <span className={swipesCount >= 10 ? 'text-accent' : 'text-text'}>
                SWIPES: {swipesCount}/10
              </span>
            </div>
          )}
          <div className="w-10 h-10 border-3 border-black bg-accent shadow-neu-xs flex items-center justify-center relative">
            <Heart size={20} weight="fill" className="text-white" />
            <div className="absolute -top-2 -right-2 bg-white border-2 border-black text-[9px] font-black px-1 min-w-[18px] text-center">
              {swipesCount}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative flex flex-col p-3 md:p-6 max-w-xl mx-auto w-full" style={{ perspective: '1000px' }}>
        
        {/* Counter */}
        {!loading && currentCompany && (
          <div className="flex justify-center mb-2">
            <div className="bg-black text-white px-3 py-0.5 text-[9px] font-mono font-bold">
              {currentIndex + 1} / {companies.length}
            </div>
          </div>
        )}

        {/* Stack Container */}
        <div className="flex-1 relative grid items-center justify-center" style={{ overflow: 'visible' }}>
          <AnimatePresence custom={lastDirection}>
            {loading ? (
              <motion.div 
                key="loading"
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 border-4 border-black shadow-neu-md bg-white flex items-center justify-center animate-spin">
                  <Sparkle size={32} weight="bold" className="text-primary" />
                </div>
                <p className="font-heading font-black text-muted animate-pulse">BUSCANDO EMPRESAS...</p>
              </motion.div>
            ) : currentCompany ? (
              <CompanyCard
                key={currentCompany.id}
                company={currentCompany}
                onSwipe={handleSwipe}
                index={currentIndex}
                total={companies.length}
              />
            ) : (
              <EmptyState onBack={onBack} />
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Controls */}
        {!loading && currentCompany && (
          <div className="flex items-center justify-center gap-6 py-3 md:py-4 flex-shrink-0">
            {/* PASS Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 bg-white border-3 border-black shadow-neu-sm flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
              title="Pasar"
            >
              <X size={28} weight="bold" />
            </motion.button>

            {/* SUPER CONNECT (Center) */}
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-primary border-3 border-black shadow-neu-sm flex items-center justify-center text-text hover:bg-white transition-colors"
              title="Super Connect"
            >
              <Star size={28} weight="fill" />
            </motion.button>

            {/* CONNECT Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 bg-secondary border-3 border-black shadow-neu-md flex items-center justify-center text-white hover:bg-white hover:text-secondary transition-colors group"
              title="Conectar"
            >
              <Heart size={32} weight="fill" className="group-hover:scale-125 transition-transform" />
            </motion.button>
          </div>
        )}
      </main>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchCompany && (
          <MatchModal 
            company={matchCompany} 
            onClose={() => setMatchCompany(null)} 
          />
        )}
        {showUpgradeModal && (
          <UpgradeModal 
            onClose={() => setShowUpgradeModal(false)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 0px;
        }
      `}</style>
    </div>
  )
}
