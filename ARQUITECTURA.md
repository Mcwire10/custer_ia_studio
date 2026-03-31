# 🏗️ Arquitectura y Orquestación de Flujo

## Visión General

**Custer IA Studio** es una aplicación de **frontend + backend integrado** en Next.js que:
1. Recibe datos del usuario (Brand Brain)
2. Los envía a Claude API para procesamiento inteligente
3. Devuelve resultados para visualización

---

## 🔄 El Flujo Completo

```
┌────────────────────────────────────────────────────────────────┐
│                   USUARIO EN NAVEGADOR                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Completa Brand Brain (nombre, rubro, propuesta, etc)       │
│     ↓ Se guarda en localStorage                                 │
│     ↓                                                            │
│  2. Elige una pestaña:                                          │
│     • Generador → Crea 8 slides sobre un tema                   │
│     • Validador → ¿Este mensaje es coherente con mi marca?      │
│     • Copy → Textos para redes sociales                         │
│     • Competencia → Analiza competidores                        │
│     • Reportes → Genera análisis ejecutivo                      │
│                                                                  │
│     ↓ Click en botón "Generar"                                  │
│     ↓                                                            │
│  3. Frontend construye payload:                                 │
│     {                                                            │
│       message/topic/competitors: "input del usuario"            │
│       brain: { nombre, rubro, propuesta, ... }                  │
│     }                                                            │
│                                                                  │
│     ↓ POST a /api/validate (o /api/copy, /api/competition)     │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js API)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  4. API Route recibe el payload                                 │
│     ↓                                                            │
│  5. Construye SYSTEM PROMPT desde Brain:                        │
│     "Eres especialista en marketing para [brand]"              │
│     "Su propuesta es: [propuesta]"                             │
│     "Público: [publico]"                                       │
│     "Tono: [registro]"                                         │
│     ↓                                                            │
│  6. Llama a Claude API:                                         │
│     POST https://api.anthropic.com/v1/messages                 │
│     Headers: x-api-key (guardada en .env)                      │
│     Body: { model, system, messages, max_tokens }              │
│     ↓                                                            │
│  7. Claude procesa y responde:                                  │
│     "Aquí están los 8 slides JSON..."                          │
│     "Este mensaje tiene score 85%..."                          │
│     "Para LinkedIn: {headline, body, cta}"                     │
│     ↓                                                            │
│  8. API extrae JSON de respuesta                                │
│     Valida formato                                              │
│     Devuelve al frontend:                                       │
│     { success: true, result: {...} }                           │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Mostrar Resultado)                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  9. Recibe respuesta del backend                                │
│     ↓                                                            │
│  10. Renderiza componente con resultado:                        │
│      • Validator: muestra score, feedback, sugerencias          │
│      • Copy: muestra textos por plataforma                      │
│      • Competition: muestra análisis con scores                 │
│      • Reports: muestra KPIs y recomendaciones                  │
│      ↓                                                            │
│  11. Usuario puede:                                             │
│      • Copiar al portapapeles                                   │
│      • Descargar JSON                                           │
│      • Generar nuevo análisis                                   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📡 Estructura de Archivos y Responsabilidades

### **Frontend (React Componentes)**

```
components/
├── Header.jsx
│   └── Logo + API Test
├── Navigation.jsx
│   └── Tabs (Brain, Generador, Validador, Copy, Competencia, Reportes)
└── panes/
    ├── BrandBrainPane.jsx
    │   └─ Entrada: user data
    │   └─ Salida: guardado en localStorage
    │
    ├── GeneratorPane.jsx
    │   └─ Entrada: { tema, formato }
    │   └─ API: POST /api/generate
    │   └─ Salida: { carousel.slides[] }
    │
    ├── ValidatorPane.jsx
    │   └─ Entrada: { message }
    │   └─ API: POST /api/validate
    │   └─ Salida: { aligned, score, feedback, suggestions }
    │
    ├── CopyPane.jsx
    │   └─ Entrada: { tema, plataformas[] }
    │   └─ API: POST /api/copy
    │   └─ Salida: { copies.{platform: {headline, body, cta}} }
    │
    ├── CompetitionPane.jsx
    │   └─ Entrada: { competidores[] }
    │   └─ API: POST /api/competition
    │   └─ Salida: { competitors[]{name, strengths, weaknesses, score} }
    │
    └── ReportsPane.jsx
        └─ Entrada: { brain, carousel }
        └─ API: POST /api/reports
        └─ Salida: { title, summary, kpis, recommendations[] }
```

### **Backend (API Routes)**

```
app/api/
├── health/route.js
│   └─ Simple health check
│
├── generate/route.js
│   └─ Input: { topic, format, brain }
│   └─ Process: Claude → crear slides
│   └─ Output: { success, carousel }
│
├── validate/route.js
│   └─ Input: { message, brain }
│   └─ Process: Claude → validar contra brand
│   └─ Output: { validation: {aligned, score, feedback, suggestions} }
│
├── copy/route.js
│   └─ Input: { theme, platforms, brain }
│   └─ Process: Claude → generar copy x plataforma
│   └─ Output: { copies: {platform: {...}} }
│
├── competition/route.js
│   └─ Input: { competitors, brain }
│   └─ Process: Claude → analizar competencia
│   └─ Output: { analysis: [{name, strengths, weaknesses, score}] }
│
└── reports/route.js
    └─ Input: { brain, carousel }
    └─ Process: Claude → reporte ejecutivo
    └─ Output: { report: {title, summary, kpis, recommendations} }
```

---

## 🧠 Cómo funciona el Brain

El **Brand Brain** es el corazón del sistema:

```javascript
// Estructura del Brain (se guarda en localStorage)
{
  nombre: "Custer",
  rubro: "Agencia de marketing",
  ciudad: "Villa María, Córdoba",
  propuesta: "Posicionamiento y copy para marcas en crecimiento",
  publico: "Emprendedores y pymes que quieren crecer",
  color1: "#3730C4",
  color2: "#F5A623",
  registro: "formal-conversacional",
  keywords: ["innovación", "velocidad", "transparencia"],
  tonalidad: ["Directo", "Honesto", "Inspirador"]
}
```

### Cómo se usa en cada API:

1. **En /api/generate:**
   ```javascript
   "Crea slides para Custer (Agencia de marketing).
    Su propuesta: Posicionamiento y copy para marcas.
    Público: Emprendedores.
    Tono: formal-conversacional."
   ```

2. **En /api/validate:**
   ```javascript
   "Analiza si este mensaje se alinea con Custer.
    (Recibe el Brain completo como contexto)"
   ```

3. **En /api/copy:**
   ```javascript
   "Eres copywriter para Custer. Genera textos para LinkedIn, Instagram, Email.
    Adapt al tono: formal-conversacional"
   ```

---

## 🔐 Seguridad

### API Key
```
❌ NO: Expuesta en frontend
✅ SÍ: En variables de entorno del servidor
   .env.local (desarrollo)
   Variables de Vercel (producción)
```

### Flow seguro:
```
Frontend (sin API key)
  ↓ POST /api/generate
Backend (tiene API key en .env)
  ↓ Llama a Claude API
  ↓ Devuelve resultado
Frontend (muestra resultado)
```

---

## 📊 Ejemplos de Payloads

### Generar Carousel
**Request:** `POST /api/generate`
```json
{
  "topic": "Transformación digital en pymes",
  "format": "educativo",
  "brain": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "carousel": {
    "topic": "Transformación digital en pymes",
    "slides": [
      {
        "type": "hook",
        "title": "¿Por qué transformarse?",
        "titleHighlight": "Es ahora o nunca",
        "body": "Las pymes que no se digitalizan...",
        "eyebrow": "Introducción"
      },
      ...
    ]
  }
}
```

### Validar Mensaje
**Request:** `POST /api/validate`
```json
{
  "message": "Somos innovadores y revolucionamos el marketing",
  "brain": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "aligned": true,
    "score": 85,
    "feedback": "El mensaje es fuerte pero falta especificar propuesta",
    "suggestions": [
      "Menciona 'posicionamiento'",
      "Agrega 'copy' explícitamente"
    ]
  }
}
```

---

## 🔄 Estados de Componentes

### Brand Brain
```
→ input → guardar localStorage → mostrar JSON preview
```

### Generator
```
tema + format → API → recibe carousel → muestra topic + slide count
                                      → botón descargar JSON
```

### Validator
```
message → API → recibe validation → muestra score + feedback + sugerencias
```

### Copy
```
tema + platforms (select) → API → muestra copy x platform
                                → estructura: headline + body + cta
```

### Competition
```
competidores (textarea) → API → muestra análisis con scores
                              → fortalezas + debilidades
```

### Reports
```
click btn → API → muestra reporte ejecutivo
                → título + summary + KPIs + recommendations
```

---

## 🔗 Cómo se integran los Skills

Cuando agregues skills del otro proyecto:

```
Skill en otro proyecto
  ↓
Genera contenido (PDF, slides, etc)
  ↓
Se almacena en carpeta compartida
  ↓
Custer IA Studio
  → Crea referencia en componente
  → Permite visualizar/descargar
  → Usa Brain para contexto
```

**Ejemplo:** Skill que crea presentaciones
```javascript
// En GeneratorPane.jsx
async function generateAndCreatePresentation(carousel) {
  // 1. Tenemos el carousel
  // 2. Llamamos al Skill (si está disponible)
  const presentation = await createPresentation(carousel, brain)
  // 3. Mostramos link de descarga
}
```

---

## ✅ Checklist de Flujos

- ✅ Usuario completa Brand Brain
- ✅ Usuario elige pestaña
- ✅ Frontend envía datos + brain a API
- ✅ API construye prompt con brain
- ✅ API llama a Claude con API key segura
- ✅ Claude responde JSON
- ✅ API valida JSON y devuelve al frontend
- ✅ Frontend renderiza resultado
- ✅ Usuario puede copiar/descargar

---

**Diagrama simple:** Usuario → Frontend → Backend → Claude API → Frontend → Usuario

**Responsabilidad:**
- **Frontend:** Entrada de datos, visualización, UX
- **Backend:** Orquestación, llamadas a Claude, validación
- **Claude:** Inteligencia, procesamiento, generación

¡Todo conectado y seguro! 🔒
