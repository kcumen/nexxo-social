# Nexxo.Social — Design System
## Neubrutalism Edition

> Estilo: **Neubrutalism** — Audaz, Gen-Z, funcional. Bordes negros 3px + sombras offset 4px. Sin blurs, sin gradientes. Declarativo y memorable.

---

## 1. Concepto

Nexxo.Social es networking corporativo con identidad visual fuerte. Neubrutalism comunica confianza sin ser aburrido — es el antídoto contra los SaaS genéricos con glassmorphism y gradientes suaves. Cada elemento dice "estamos aquí para hacer algo".

---

## 2. Paleta de Color

```
Background:      #FAFAF9  (Off-white cálido, no puro para no cegar)
Surface/Cards:   #FFFFFF  (Blanco para las cards)
Primary:         #FACC15  (Yellow Neubrutalism — energía, acción)
Secondary:       #3B82F6  (Blue — confianza, profesionalismo)
Accent:          #EF4444  (Red — urgencia, CTAs importantes)
Success:         #22C55E  (Green — confirmaciones)
Text Primary:    #0A0A0A  (Near-black)
Text Secondary:  #525252  (Muted gray)
Border:          #000000  (Negro puro para bordes)
Shadow:          #000000  (Sombra = color puro, no gris)
```

**Color CSS Variables:**
```css
--color-bg: #FAFAF9;
--color-surface: #FFFFFF;
--color-primary: #FACC15;
--color-secondary: #3B82F6;
--color-accent: #EF4444;
--color-success: #22C55E;
--color-text: #0A0A0A;
--color-text-muted: #525252;
--color-border: #000000;
--color-shadow: #000000;
```

---

## 3. Tipografía

```
Heading:  Outfit (700, 800) — bold, geométrica, moderna
Body:     DM Sans (400, 500, 600) — legible, friendly, profesional
Mono:     JetBrains Mono (400) — para datos, IDs, QR codes
```

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Scale:**
```css
--text-xs:   0.75rem  (12px)
--text-sm:   0.875rem (14px)
--text-base: 1rem     (16px)
--text-lg:   1.125rem (18px)
--text-xl:   1.25rem  (20px)
--text-2xl:  1.5rem   (24px)
--text-3xl:  1.875rem (30px)
--text-4xl:  2.25rem  (36px)
--text-5xl:  3rem     (48px)
--text-6xl:  3.75rem  (60px)
```

---

## 4. Sistema de Bordes y Sombras

### Bordes
```css
border: 3px solid #000;
border-radius: 0px; /* TODO: algunas cards pueden tener 2-4px para suavizar */
```

### Sombras Offset (la firma de Neubrutalism)
```css
/* Small shadow (botones, tags) */
box-shadow: 3px 3px 0 #000;

/* Medium shadow (cards, inputs) */
box-shadow: 4px 4px 0 #000;

/* Large shadow (hero cards, secciones) */
box-shadow: 6px 6px 0 #000;

/* Hover: incrementar offset */
box-shadow: 5px 5px 0 #000;
transform: translate(-1px, -1px);
```

### Transiciones
```css
transition: all 150ms ease;
```

---

## 5. Componentes

### Button Primary
```css
background: #FACC15;
border: 3px solid #000;
box-shadow: 4px 4px 0 #000;
padding: 12px 24px;
font-family: 'Outfit', sans-serif;
font-weight: 700;
font-size: 1rem;
cursor: pointer;
/* Hover */
box-shadow: 5px 5px 0 #000;
transform: translate(-1px, -1px);
/* Active */
box-shadow: 2px 2px 0 #000;
transform: translate(2px, 2px);
```

### Button Secondary
```css
background: #FFFFFF;
border: 3px solid #000;
box-shadow: 4px 4px 0 #000;
/* Mismo hover/active que primary pero invierte la sombra */
```

### Card
```css
background: #FFFFFF;
border: 3px solid #000;
box-shadow: 6px 6px 0 #000;
padding: 24px;
border-radius: 0px;
/* Hover */
transform: translate(-2px, -2px);
box-shadow: 8px 8px 0 #000;
```

### Input Field
```css
background: #FFFFFF;
border: 3px solid #000;
box-shadow: 4px 4px 0 #000;
padding: 12px 16px;
font-family: 'DM Sans', sans-serif;
border-radius: 0px;
/* Focus */
outline: 3px solid #FACC15;
outline-offset: 0px;
```

### Tag / Badge
```css
background: #FACC15;
border: 2px solid #000;
box-shadow: 2px 2px 0 #000;
padding: 4px 12px;
font-family: 'Outfit', sans-serif;
font-weight: 600;
font-size: 0.75rem;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### QR Card (especial para Nexxo)
```css
background: #FFFFFF;
border: 3px solid #000;
box-shadow: 6px 6px 0 #000;
padding: 20px;
/* QR code dentro con padding generoso */
```

---

## 6. Layout

```
Max-width contenido:    1280px
Grid:                   12 columnas, gap 24px
Padding lateral móvil:  16px
Padding lateral desktop: 48px
Secciones:              padding 80px vertical (desktop), 48px (móvil)
```

### Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
```

---

## 7. Animaciones y Micro-interacciones

```css
/* Hover en cards */
transform: translate(-2px, -2px);
box-shadow: 8px 8px 0 #000;
transition: all 150ms ease;

/* Click en botones */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 #000;
transition: all 100ms ease;

/* Aparición de secciones */
opacity: 0;
transform: translateY(20px);
animation: reveal 400ms ease forwards;

@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 8. Dark Mode

```css
@media (prefers-color-scheme: dark) {
  --color-bg: #0A0A0A;
  --color-surface: #1A1A1A;
  --color-text: #FAFAF9;
  --color-text-muted: #A3A3A3;
  --color-border: #FAFAF9;
  --color-shadow: #FAFAF9;
  /* Las sombras siguen siendo de color, no negras */
}
```

---

## 9. Checklist de Implementación

```
☐ Outfit + DM Sans + JetBrains Mono instalados (Google Fonts)
☐ Variables CSS en :root
☐ border-radius: 0px en todo (reset)
☐ border: 3px solid #000 en todos los elementos interactivos
☐ box-shadow offset (4px 4px 0 #000) en cards, inputs, botones
☐ Hover states con incremento de sombra + translate
☐ Active states con decremento de sombra + translate
☐ Tags con background primary (#FACC15) y uppercase
☐ Dark mode con inversión de colors pero sombras blancas
☐ Animación reveal en scroll para secciones
☐ Touch targets mínimo 48x48px en móvil
```

---

## 10. UI de Referencia (inspiración visual)

Este estilo neubrutalism se ve en:
- **Linear** (las secciones oscuras con bordes)
- **Notion** (antes del rebranding)
- **Figma** (el UI de la herramienta)
- **Hotjar** (los tooltips y widgets)
- **Krescent** (productos Gen-Z SaaS)

La diferencia con Nexxo: paleta yellow/blue/white en vez de las paletas monochromáticas typical.
