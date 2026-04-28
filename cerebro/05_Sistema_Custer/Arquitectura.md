# Arquitectura — Custer AI Studio

> **Última actualización:** 2026-04-28

---

## Diagrama General

```
┌─────────────────────────────────────────────────────┐
│              USUARIO (Navegador)                    │
│  /login.html → /app (auth check) → studio-v2.html  │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  NEXT.JS (SSR)  │
        │  /app/page.jsx  │
        │  middleware.js  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────────────────┐
    │            │                        │
    ▼            ▼                        ▼
┌─────────┐  ┌──────────────────┐  ┌──────────────┐
│  API    │  │ Frontend (HTML)  │  │   /cerebro/  │
│ Routes  │  │ studio-v2.html   │  │  (vault sync)│
│ (32 x)  │  │ (7535 líneas)    │  │  (Fase 2)    │
└────┬────┘  └──────────────────┘  └──────────────┘
     │
┌────▼──────────────────────────────────────────────┐
│   BACKEND LOGIC                                    │
│  lib/auth.js         → Autenticación              │
│  lib/brands-db.js    → CRUD marcas                │
│  lib/conversations-db.js → Historial              │
│  app/lib/token-optimizer.js → Métricas            │
│  app/lib/brand-validation.js → Validación         │
│  app/lib/prompt-schemas.js → Prompts optimizados  │
└────┬──────────────────────────────────────────────┘
     │
┌────▼──────────────────────────────────────────────┐
│   CLAUDE AI + SERVICIOS EXTERNOS                   │
│  Claude 3.5 Haiku  → Generación principal          │
│  Claude Vision     → Análisis de imágenes          │
│  Firecrawl         → Web scraping                  │
└────┬──────────────────────────────────────────────┘
     │
┌────▼──────────────────────────────────────────────┐
│   MYSQL DATABASE                                   │
│  users                → Auth                      │
│  brands               → Brand Brain (58 campos)   │
│  conversations        → Historial de sesiones      │
│  conversation_summaries → Auto-resúmenes           │
│  logs                 → Token metrics              │
└───────────────────────────────────────────────────┘
```

---

## Flujo de Autenticación

```
1. /login.html → POST /api/auth/login
2. bcrypt valida contraseña → HTTPOnly cookie
3. /app/page.jsx → GET /api/auth/me
4. Si OK → carga studio-v2.html
5. Si no → redirect a /login.html
```

**Credenciales demo:** `demo / 1234`

---

## Flujo de Carga de Marca

```
Brand Selection Modal
├─ Opción A: Cargar marca existente
│   └─ GET /api/brands/:id → Popula los 11 slides
│
└─ Opción B: Crear marca nueva
    └─ POST /api/auto-populate-brand
        ├─ analyzeImages()   → Colores, tipografía
        ├─ scrapeInstagram() → Followers, engagement
        ├─ scrapeWebsite()   → CSS, fonts, contenido
        └─ analyzeText()     → Claude extrae datos
            └─ Consolidate + Save to MySQL
```

---

## Flujo de Generación de Contenido

```
Usuario escribe brief en Generador
    ↓
POST /api/generate
    ├─ Lee Brand Brain (58 campos como JSON)
    ├─ Lee historial de conversaciones
    ├─ (Futuro) Lee /cerebro/00_SOP_Agencia/System_Prompt_Mentor.md
    ├─ (Futuro) Lee /cerebro/01_Biblioteca_Teorica/Indice_Teoria.md
    └─ Claude 3.5 Haiku genera:
        ├─ HTML/CSS mockup
        ├─ Copy (headlines, subtítulos)
        └─ Image strategy

Response → Preview en browser + opción exportar
```

---

## Flujo de Validación de Campaña

```
Usuario pega copy o sube pieza
    ↓
POST /api/validate
    ├─ Lee Brand Brain → extrae voz, tono, valores
    ├─ (Futuro) Lee /cerebro/00_SOP_Agencia/System_Prompt_Mentor.md
    └─ Claude evalúa coherencia de marca
        ├─ ¿Usa clichés prohibidos?
        ├─ ¿Respeta el territorio visual?
        └─ ¿Alineado con arquetipos?
```

---

## Sistema de Skills (Agentes Especializados)

Los skills viven en `/SKILLS/` y se cargan como contexto adicional en los prompts:

| Skill | Función |
|---|---|
| `CUSTER-MASTER-PROMPT.md` | Orquestador principal de validación de campañas |
| `brand-profile-generator.md` | Extrae ADN visual de piezas previas |
| `conversion-architect.md` | Optimiza estructura para Meta Ads |
| `visual-prompt-engineer.md` | Crea wireframes textuales |
| `brand-guardian.md` | Valida cumplimiento de marca |
| `critical-auditor.md` | Squint test pre-lanzamiento |
| `image-prompt-generator.md` | Convierte wireframes en prompts para imágenes |
| `html-css-designer.md` | Genera mockups HTML/CSS |

**Flujo automático de validación (10 min):**
`Brief → Conversion Architect → Brand Guardian → Critical Auditor → Aprobado/Rechazado`
