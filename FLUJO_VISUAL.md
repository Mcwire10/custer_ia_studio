# 📊 Flujo Visual del Sistema

## 1. ESTRUCTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CUSTER IA STUDIO                              │
│                      (Next.js App en Vercel)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐       ┌──────────────────┐                    │
│  │    FRONTEND      │       │     BACKEND      │                    │
│  │   (React)        │  ←→   │   (Next.js API)  │                    │
│  └──────────────────┘       └──────────────────┘                    │
│       ↓                             ↓                                 │
│   6 Panes              4 API Routes + Health                         │
│   + localStorage        + Claude API integration                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │   CLAUDE API         │
                    │ (Anthropic)          │
                    └──────────────────────┘
                              ↓
                    ┌──────────────────────┐
                    │   MySQL (Futuro)     │
                    │  (Servidor Externo)  │
                    └──────────────────────┘
```

---

## 2. PANELES Y SUS FLUJOS

### **Pestaña 1: 🧠 Brand Brain**

```
USUARIO
  ↓
COMPLETA FORMULARIO
  • Nombre
  • Rubro
  • Propuesta
  • Público
  • Colores
  • Tono
  ↓
CLICK "GUARDAR"
  ↓
SE GUARDA EN localStorage
  ↓
MOSTRAR PREVIEW JSON
  ↓
LISTO PARA USAR EN OTRAS PESTAÑAS ✅
```

---

### **Pestaña 2: ✦ Generador**

```
USUARIO
  ↓
ESCRIBE TEMA: "Transformación digital"
ELIGE FORMATO: "Educativo"
  ↓
CLICK "GENERAR"
  ↓
┌─────────────────────────────────────┐
│ Frontend envía a Backend:           │
│ {                                   │
│   topic: "Transformación digital"   │
│   format: "educativo"               │
│   brain: { ... }                    │
│ }                                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Backend (/api/generate):            │
│ • Recibe payload                    │
│ • Construye prompt con Brain:       │
│   "Para Custer (Agencia)..."        │
│ • Llama a Claude API                │
│ • Claude responde: JSON con slides  │
│ • Valida JSON                       │
│ • Devuelve al frontend              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Frontend recibe:                    │
│ {                                   │
│   topic: "Transformación digital"   │
│   slides: [                         │
│     { type: "hook", title: "..." }, │
│     { type: "bullets", ... },       │
│     ...                             │
│   ]                                 │
│ }                                   │
└─────────────────────────────────────┘
  ↓
MOSTRAR EN PANTALLA
  ↓
USUARIO VE:
  • "📌 Transformación digital (8 slides)"
  • Botón "📥 Descargar JSON"
  ↓
CLICK DESCARGAR
  ↓
ARCHIVO: custer-carousel.json ✅
```

---

### **Pestaña 3: 🎯 Validador**

```
USUARIO
  ↓
PEGA MENSAJE: "Somos innovadores revolucionarios"
  ↓
CLICK "🔍 VALIDAR"
  ↓
┌──────────────────────────────────┐
│ Backend (/api/validate):         │
│ • Prompt: "¿Alineado con marca?" │
│ • Claude analiza                 │
│ • Responde: {                    │
│     aligned: true,               │
│     score: 85,                   │
│     feedback: "...",             │
│     suggestions: ["..."]         │
│   }                              │
└──────────────────────────────────┘
  ↓
MOSTRAR RESULTADO:
  ✅ ✓ ALINEADO
  • Score: 85%
  • Feedback: "Es fuerte pero..."
  • Sugerencias:
    • "Menciona 'posicionamiento'"
    • "Agrega cifras"
  ↓
USUARIO MEJORA MENSAJE Y REVALIDA ✅
```

---

### **Pestaña 4: ✍️ Copy**

```
USUARIO
  ↓
TEMA: "Lanzamiento de producto"
PLATAFORMAS: [LinkedIn, Instagram, Email]
  ↓
CLICK "GENERAR"
  ↓
┌──────────────────────────────────┐
│ Backend (/api/copy):             │
│ • Para cada plataforma:          │
│   - Prompt específico (limits)   │
│   - Claude responde adaptado     │
│ • Estructura: {                  │
│     LinkedIn: {                  │
│       headline: "...",           │
│       body: "...",               │
│       cta: "..."                 │
│     },                           │
│     Instagram: { ... },          │
│     Email: { ... }               │
│   }                              │
└──────────────────────────────────┘
  ↓
MOSTRAR 3 TARJETAS:
  1. LinkedIn (headline largo)
  2. Instagram (más visual, hashtags)
  3. Email (para campaña)
  ↓
USUARIO COPIA CADA UNO AL PORTAPAPELES ✅
```

---

### **Pestaña 5: 🔍 Competencia**

```
USUARIO
  ↓
COMPETIDORES (una por línea):
  • Competidor1
  • Competidor2
  • Competidor3
  ↓
CLICK "ANALIZAR"
  ↓
┌──────────────────────────────────┐
│ Backend (/api/competition):      │
│ • Para cada competidor:          │
│   - Fortalezas                   │
│   - Debilidades                  │
│   - Posicionamiento              │
│   - Score 0-100                  │
│ • Claude analiza vs tu marca     │
└──────────────────────────────────┘
  ↓
MOSTRAR ANÁLISIS:
  ┌─────────────────┐
  │ Competidor1     │  [85] ⭐
  ├─────────────────┤
  │ ✅ Fortalezas:  │
  │ • Presencia web │
  │ • Equipo grande │
  │                 │
  │ ❌ Debilidades: │
  │ • Copy genérico │
  │ • Sin vision    │
  └─────────────────┘
  ↓
USUARIO VE DONDE PUEDE DIFERENCIARSE ✅
```

---

### **Pestaña 6: 📊 Reportes**

```
USUARIO
  ↓
VE BOTONES:
  1. "💾 Exportar Brand Brain" → brain.json
  2. "💾 Exportar Carousel" → carousel.json (si existe)
  3. "📈 Generar Reporte Ejecutivo"
  ↓
CLICK #3
  ↓
┌──────────────────────────────────┐
│ Backend (/api/reports):          │
│ • Recibe: brain + carousel       │
│ • Claude genera análisis         │
│ • Responde: {                    │
│     title: "...",                │
│     summary: "...",              │
│     kpis: {                      │
│       "Engagement": "30%",        │
│       "Conversión": "5%"          │
│     },                           │
│     recommendations: ["..."]     │
│   }                              │
└──────────────────────────────────┘
  ↓
MOSTRAR REPORTE:
  TÍTULO
  ────────────
  Resumen ejecutivo...

  KPIs RECOMENDADOS
  ┌──────┐  ┌──────┐  ┌──────┐
  │ 30%  │  │ 5%   │  │ $45K │
  │ Eng. │  │ Conv.│  │ MRR  │
  └──────┘  └──────┘  └──────┘

  RECOMENDACIONES
  💡 Aumentar frecuencia de posts
  💡 Testear nuevo copy
  💡 Analizar competencia mensual
  ↓
USUARIO DESCARGA O COMPARTE ✅
```

---

## 3. FLUJO DE DATOS (Sincrónico)

```
ENTRADA          PROCESO              SALIDA
─────────        ───────              ──────

message ──→ /api/validate ──→ { score, feedback }
            └─ Brain ──────→
            └─ Claude ────→

topic ──────→ /api/generate ──→ { carousel }
format ─────→ └─ Brain ──────→
brain ──────→ └─ Claude ────→

theme ──────→ /api/copy ──────→ { copies.{platform} }
platforms ──→ └─ Brain ──────→
brain ──────→ └─ Claude ────→
```

---

## 4. FLUJO DE DATOS (Con Skills)

```
CAROUSEL
  ↓ (usuario descarga como presentación)
  ↓
/api/export-presentation
  ↓
Skill: presentation-builder
  ├─ Toma carousel
  ├─ Aplica colores del brain
  ├─ Renderiza slides en PowerPoint
  └─ Devuelve .pptx
  ↓
FRONTEND
  ↓
DESCARGAR presentation.pptx ✅
```

---

## 5. CICLO COMPLETO DEL USUARIO

```
DÍA 1: SETUP
────────────
USER
  ↓ Completa Brand Brain
  ↓ Presiona Guardar
  └─→ localStorage: { nombre, rubro, propuesta, ... }

DÍA 2: CONTENIDO
────────────────
USER
  ↓ Generador: "Transformación digital"
  ↓ API genera 8 slides
  ↓ Descarga carousel.json
  ↓ O: Skill convierte a .pptx

DÍA 3: VALIDACIÓN
──────────────────
USER
  ↓ Escribe copy en Linkedin
  ↓ Validador: "¿Alineado?"
  ↓ Score: 78% → sugerencias
  ↓ Mejora copy → valida de nuevo
  ↓ Score: 92% ✅

DÍA 4: ANÁLISIS
────────────────
USER
  ↓ Ingresa 3 competidores
  ↓ Análisis → ve debilidades suyas
  ↓ Detecta oportunidad
  ↓ Descarga report.pdf (con Skills)

DÍA 5: REPORTES
────────────────
USER
  ↓ Click "Reporte Ejecutivo"
  ↓ Recibe: KPIs + recomendaciones
  ↓ Toma decisiones estratégicas
  ↓ ¡Crece! 📈
```

---

## 6. QUÉ PASA EN CADA CAPA

```
┌────────────────────────────────────────────────────────┐
│ USER                                                    │
│ • Escribe en inputs                                    │
│ • Clickea botones                                      │
│ • Ve resultados hermosos                              │
│ • Descarga archivos                                    │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                       │
│ • Componentes visuales                                 │
│ • Estado local (useState)                             │
│ • localStorage (Brand Brain)                          │
│ • Llama APIs del backend                              │
│ • Renderiza resultados                                │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│ BACKEND (Next.js API Routes)                          │
│ • Recibe POST requests                                │
│ • Construye prompts                                   │
│ • Llama a Claude API (con API key segura)            │
│ • Parsea respuestas                                   │
│ • Devuelve JSON al frontend                           │
└────────────────────────────────────────────────────────┘
                           ↕
┌────────────────────────────────────────────────────────┐
│ CLAUDE API                                             │
│ • Procesa prompts                                     │
│ • Genera contenido inteligente                        │
│ • Responde con JSON                                   │
└────────────────────────────────────────────────────────┘
```

---

## 7. SEGURIDAD

```
❌ INSEGURO: Frontend envía API key
    Frontend (tiene key) → Usuario ve key en DevTools

✅ SEGURO: Backend guarda API key
    Frontend (sin key) → Backend (tiene key) → Claude
                           ↓
                      .env.local (dev)
                      Vercel vars (prod)
```

---

¡Así funciona todo el sistema! 🚀
