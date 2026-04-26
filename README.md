# nexxo.social 🛒

> Networking corporativo a través del escaneo de códigos QR conectados a perfiles corporativos.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS (CDN)
- **Backend:** Cloudflare Workers (Hono)
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2
- **Deploy:** Cloudflare Pages

## Setup local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Build producción
```

## Deploy

```bash
npm run deploy     # Build + wrangler pages deploy
```

## Concepto

- Admin genera códigos QR únicos (imprimibles o por enlace)
- Empresa se registra via OAuth (LinkedIn, Google, Instagram)
- Usuario escanea QR → ve perfil corporativo público
- Usuario puede guardar perfil (requiere registro)

## Status

🟡 En construcción · Q2 2026
