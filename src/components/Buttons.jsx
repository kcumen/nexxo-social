// ── Neubrutalism Button Components ────────────────────────────────────────────
// Cuatro variantes: Primary (amarillo), Secondary (blanco), Accent (rojo), Ghost (transparente)
// Soporta prop `circle` para botones circulares
// Polymorphic: renderiza <button> por defecto, <a> si recibe href
// NOTA: Todos los estilos son inline para evitar dependencia de Tailwind CDN
//       (el scanner de Tailwind no detecta clases construidas como strings dinámicos)

// ── Shared base styles (inline, no依赖 Tailwind utilities) ────────────────────
const BASE_STYLE = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 700,
  borderWidth: '3px',
  borderStyle: 'solid',
  borderColor: '#000000',
  boxShadow: '4px 4px 0 #000000',
  cursor: 'pointer',
  userSelect: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 150ms ease',
  textDecoration: 'none',
}

// ── Sizes: { pyV, pxH, fontSize, minW } ─────────────────────────────────────────
const SIZES = {
  sm:  { pyV: 6,   pxH: 16,  fontSize: '0.875rem', minW: 0  },
  md:  { pyV: 10,  pxH: 24,  fontSize: '1rem',     minW: 0  },
  lg:  { pyV: 14,  pxH: 32,  fontSize: '1.125rem', minW: 0  },
  xl:  { pyV: 18,  pxH: 40,  fontSize: '1.25rem',  minW: 0  },
}

// ── Hover/active helpers ─────────────────────────────────────────────────────────
function hoverStyle(s) {
  return {
    ...s,
    transform: 'translate(-1px, -1px)',
    boxShadow: '5px 5px 0 #000000',
  }
}
function activeStyle(s) {
  return {
    ...s,
    transform: 'translate(2px, 2px)',
    boxShadow: '2px 2px 0 #000000',
  }
}

// ── Inner polymorphic core ──────────────────────────────────────────────────────
function ButtonBase({ href, size = 'md', circle = false, baseStyle = {}, className = '', children, ...props }) {
  const s = SIZES[size] ?? SIZES.md

  // Base style: merge BASE_STYLE + size + baseStyle + circle overrides
  let style = {
    ...BASE_STYLE,
    paddingTop: `${s.pyV}px`,
    paddingBottom: `${s.pyV}px`,
    paddingLeft: circle ? '0' : `${s.pxH}px`,
    paddingRight: circle ? '0' : `${s.pxH}px`,
    fontSize: s.fontSize,
    ...baseStyle,
  }

  // Circle: fuerza forma circular y dimensiones fijas
  if (circle) {
    const dim = '64px'
    style = {
      ...style,
      borderRadius: '9999px',
      width: dim,
      height: dim,
      padding: '0',
      minWidth: '0',
      minHeight: '0',
      flexShrink: 0,
    }
  }

  const Tag = href ? 'a' : 'button'

  if (href) {
    return (
      <a
        href={href}
        className={className}
        {...props}
        style={style}
        onMouseEnter={e => { Object.assign(e.currentTarget.style, hoverStyle(style)) }}
        onMouseLeave={e => { Object.assign(e.currentTarget.style, activeStyle(style)) }}
        onMouseDown={e => { Object.assign(e.currentTarget.style, activeStyle(style)) }}
        onMouseUp={e => { Object.assign(e.currentTarget.style, hoverStyle(style)) }}
      >
        {children}
      </a>
    )
  }
  return (
    <button
      className={className}
      {...props}
      style={style}
      onMouseEnter={e => { Object.assign(e.currentTarget.style, hoverStyle(style)) }}
      onMouseLeave={e => { Object.assign(e.currentTarget.style, { ...BASE_STYLE, ...(s.pyV !== undefined ? { paddingTop: `${s.pyV}px`, paddingBottom: `${s.pyV}px`, paddingLeft: circle ? '0' : `${s.pxH}px`, paddingRight: circle ? '0' : `${s.pxH}px` } : {}), fontSize: s.fontSize, ...baseStyle }) }}
      onMouseDown={e => { Object.assign(e.currentTarget.style, activeStyle(style)) }}
      onMouseUp={e => { Object.assign(e.currentTarget.style, hoverStyle(style)) }}
      onTouchStart={e => { Object.assign(e.currentTarget.style, hoverStyle(style)) }}
      onTouchEnd={e => { Object.assign(e.currentTarget.style, { ...BASE_STYLE, ...(s.pyV !== undefined ? { paddingTop: `${s.pyV}px`, paddingBottom: `${s.pyV}px`, paddingLeft: circle ? '0' : `${s.pxH}px`, paddingRight: circle ? '0' : `${s.pxH}px` } : {}), fontSize: s.fontSize, ...baseStyle }) }}
    >
      {children}
    </button>
  )
}

// ── Primary (amarillo #FACC15) ────────────────────────────────────────────────
export function Primary({ href, size = 'md', circle = false, className = '', children, ...props }) {
  return (
    <ButtonBase
      href={href}
      size={size}
      circle={circle}
      className={className}
      baseStyle={{
        backgroundColor: '#FACC15',
        color: '#0A0A0A',
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  )
}

// ── Secondary (blanco #FFFFFF) ─────────────────────────────────────────────────
export function Secondary({ href, size = 'md', circle = false, className = '', children, ...props }) {
  return (
    <ButtonBase
      href={href}
      size={size}
      circle={circle}
      className={className}
      baseStyle={{
        backgroundColor: '#FFFFFF',
        color: '#0A0A0A',
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  )
}

// ── Accent (rojo #EF4444) ─────────────────────────────────────────────────────
export function Accent({ href, size = 'md', circle = false, className = '', children, ...props }) {
  return (
    <ButtonBase
      href={href}
      size={size}
      circle={circle}
      className={className}
      baseStyle={{
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  )
}

// ── Ghost (transparente) ───────────────────────────────────────────────────────
export function Ghost({ href, size = 'md', circle = false, className = '', children, ...props }) {
  return (
    <ButtonBase
      href={href}
      size={size}
      circle={circle}
      className={className}
      baseStyle={{
        backgroundColor: 'transparent',
        color: '#0A0A0A',
        borderColor: 'transparent',
        boxShadow: 'none',
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  )
}
