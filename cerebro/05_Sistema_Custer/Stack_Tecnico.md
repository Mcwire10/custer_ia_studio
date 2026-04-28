# Stack Técnico — Custer AI Studio

> **Última actualización:** 2026-04-28

---

## Frontend

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework principal (React 18) |
| **HTML/CSS vanilla** | UI principal en `public/studio-v2.html` (7535 líneas) |
| **Glassmorphism** | Estética visual del estudio |
| Responsive | Breakpoints en @768px y @480px |

**Archivos UI principales:**
- `public/studio-v2.html` — Interfaz principal del estudio
- `public/login.html` — Pantalla de login
- `public/brand-loader.html` — Modal de carga de marca
- `public/components/` — Modales reutilizables

---

## Backend

| Tecnología | Uso |
|---|---|
| **Next.js API Routes** | 32 endpoints REST |
| **Node.js / JavaScript** | Runtime y lógica de negocio |
| **middleware.js** | Validación de sesión global |

---

## IA & APIs Externas

| Servicio | Librería | Uso |
|---|---|---|
| **Claude 3.5 Haiku** | `@anthropic-ai/sdk` | Generación de contenido principal |
| **Claude Vision** | `@anthropic-ai/sdk` | Análisis de imágenes de marca |
| **Firecrawl** | `@mendable/firecrawl` | Web scraping de sitios de clientes |
| **FAL / Stability / Replicate** | `axios` | Generación de imágenes (experimental) |
| **Gemini** | — | Fallback cuando Claude no está disponible |

---

## Base de Datos

| Item | Detalle |
|---|---|
| **Motor** | MySQL |
| **Driver** | `mysql2` (connection pool) |
| **Schema** | `users`, `brands`, `conversations`, `conversation_summaries`, `logs` |
| **Multi-tenancy** | Todas las tablas filtran por `user_id` |
| **Brand Brain** | 58 campos en columna `data` tipo JSON + columnas rápidas (`name`, `color`, `typography`) |

---

## Dependencias Principales

```json
{
  "@anthropic-ai/sdk": "^0.86.0",
  "@mendable/firecrawl": "^4.18.1",
  "mysql2": "^3.6.0",
  "bcrypt": "^6.0.0",
  "next": "^16.2.3",
  "sharp": "^0.34.5",
  "axios": "^1.x",
  "jsdom": "^29.0.2",
  "dotenv": "^16.x"
}
```

---

## Variables de Entorno Requeridas

```bash
# IA
ANTHROPIC_API_KEY=sk-ant-...

# Base de datos MySQL
DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=

# Sesiones
SESSION_SECRET=

# Scraping (opcional)
FIRECRAWL_API_KEY=
```

---

## Libs Internas

| Archivo | Función |
|---|---|
| `lib/db.js` | Connection pool MySQL |
| `lib/auth.js` | Bcrypt, sessions, login logic |
| `lib/brands-db.js` | CRUD de marcas (100+ funciones) |
| `lib/conversations-db.js` | Queries de conversaciones |
| `app/lib/token-optimizer.js` | Tracking de tokens por endpoint |
| `app/lib/brand-validation.js` | Reglas de validación de marca |
| `app/lib/prompt-schemas.js` | Prompts optimizados por tipo de output |
| `app/lib/media-converter.js` | Conversión de imágenes para Vision |

---

## Estructura de Carpetas

```
custer_ai_studio/
├── app/
│   ├── api/          → 32 endpoints (Next.js API Routes)
│   ├── lib/          → Lógica de negocio
│   ├── page.jsx      → Auth redirect + carga de studio
│   └── layout.jsx    → Root layout
├── lib/              → DB, auth, CRUD
├── public/           → HTML, CSS, assets estáticos
├── SKILLS/           → Skills/agentes especializados
├── docs/             → Documentación técnica detallada
├── tasks/            → TODO list y lessons learned
├── scripts/          → Migraciones de DB
├── cerebro/          → Vault Obsidian sincronizado (Fase 2)
└── .claude/          → Config Claude Code + token metrics
```
