# Custer AI Studio — Contexto completo para continuar el proyecto

> Documento generado el 2 de Mayo 2026. Todo lo que necesitás saber para retomar sin perder contexto.

---

## Qué es esto

**Custer AI Studio** es una herramienta interna de agencia de marketing. Permite a los usuarios:
1. **Validar** piezas de contenido con IA (Coach/Mentor Ácido)
2. **Generar piezas gráficas** (HTML/CSS renderizado como imagen) con IA
3. **Generar copy** para redes sociales, emails, etc.
4. **Gestionar el Brand Brain** — base de datos de marcas con su ADN completo

Está en producción en: **https://custeraistudio.vercel.app**

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16, App Router, `app/api/` route handlers |
| Frontend | HTML/CSS/JS vanilla en `/public/studio-v2.html` (una sola página, sin React en el cliente) |
| AI principal | Anthropic Claude (claude-sonnet-4-5 para generación, claude-haiku para búsquedas) |
| AI imágenes | OpenAI gpt-image-1 (fallback cuando web search no encuentra imagen) |
| Base de datos | MySQL (Hostinger), conexión vía `lib/db.js` con mysql2/promise |
| Deploy | Vercel (free tier), rama `dev`, auto-deploy desde GitHub |
| Repo | https://github.com/Mcwire10/custer_ia_studio (rama `dev`) |

### Variables de entorno en Vercel (producción)
```
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=custer_ia_studio
CRON_SECRET=custer2026
```

### vercel.json — timeouts
```json
{
  "functions": {
    "app/api/validate/route.js":        { "maxDuration": 60 },
    "app/api/copy/route.js":            { "maxDuration": 60 },
    "app/api/generate/route.js":        { "maxDuration": 60 },
    "app/api/generate-design/route.js": { "maxDuration": 60 }
  }
}
```

---

## Arquitectura de archivos clave

```
custer_ai_studio/
├── app/
│   └── api/
│       ├── generate-design/route.js   ← GENERADOR DE PIEZAS (más importante ahora)
│       ├── validate/route.js          ← Validador de contenido
│       ├── copy/route.js              ← Generador de copy
│       ├── brands/route.js            ← CRUD de marcas (MySQL)
│       ├── brands/[id]/route.js
│       ├── cron/
│       │   ├── tendencias/route.js    ← Actualiza contexto semanal (web search)
│       │   └── efemerides/route.js    ← Actualiza efemérides mensuales
│       └── setup/
│           └── migrate-contexto/route.js
├── lib/
│   ├── db.js                 ← Pool MySQL, query/getOne/getMany/insert/update
│   ├── cerebro.js            ← Lee archivos del /cerebro (marca ADN, system prompts)
│   ├── contexto-actual.js    ← Lee tendencias+efemérides de MySQL
│   ├── auth.js               ← getCurrentUser() con cookie de sesión
│   └── brands-db.js          ← Operaciones de marcas en MySQL
├── public/
│   └── studio-v2.html        ← TODO el frontend (8019 líneas, una sola página)
├── cerebro/                  ← Archivos markdown con el "cerebro" de la agencia
│   ├── 00_SOP_Agencia/       ← System prompts, SOPs
│   ├── 01_Biblioteca_Teorica/← 25 libros de marketing resumidos
│   └── 02_ADN_Marcas/        ← Un .md por marca con su ADN completo
└── vercel.json
```

---

## El Generador de Piezas — el módulo más importante

### Flujo completo

```
Usuario escribe brief
        ↓
POST /api/generate-design
        ↓
Claude Sonnet genera HTML/CSS completo
(con <!--IMG:descripción--> como placeholders para imágenes)
        ↓
Regex extrae todos los <!--IMG:--> del HTML
        ↓
Para cada imagen (en paralelo):
  1. Claude Haiku + web_search busca imagen real del producto (PNG fondo blanco)
  2. Si la encuentra → descarga y convierte a base64
  3. Si no → gpt-image-1 genera la imagen
  4. Si eso falla → SVG placeholder gris
        ↓
Imágenes inyectadas como base64 en el HTML final
        ↓
Frontend renderiza el HTML en un <iframe srcdoc="...">
```

### API: POST /api/generate-design

**Request body:**
```json
{
  "brief": "Placa de FarmaVida sobre su rutina de skincare matutina",
  "formato": "placa-feed",
  "brain": { "nombre": "FarmaVida" },
  "iteracion": "<html anterior completo o null>",
  "imagenAnotada": "data:image/png;base64,... (canvas con marcas o null)"
}
```

**Formatos disponibles:**
- `placa-feed` → 1080×1080
- `stories` → 1080×1920
- `banner-email` → 600×200
- `carrusel` → 1080×1080 (múltiples slides)
- `flyer` → 800×1200

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "formato": "placa-feed",
  "dims": { "w": 1080, "h": 1080 },
  "imagenes": [
    { "desc": "suero vitamina C fondo blanco", "fuente": "web" }
  ]
}
```

### System prompt del Generador (lo que le decimos a Claude)

Claude recibe instrucciones para generar HTML/CSS con:
- **OKLCH color system** — un solo `--hue`, paleta de 12 pasos derivada matemáticamente
- **System font stacks** — cero dependencias externas (Inter, Roboto, etc.)
- **Design tokens completos** — spacing 4px base, radios, sombras en capas hue-matched
- **Keyframe library** — fadeUp, scaleIn, blurIn, float, shimmer, gradFlow
- **Stagger animations** — clase `.stagger` para listas/cards
- **Efectos premium** — gradient text, glassmorphism, mesh gradients, neon glow
- **Reglas tipográficas** — clamp(), letter-spacing tight, text-wrap: balance
- **SVG inline de Lucide/Heroicons** — nunca emoji como íconos de diseño

### Frontend del Generador (en studio-v2.html)

**Variables de estado globales:**
```javascript
let genHTMLActual = null          // HTML de la pieza actual
let genVersionesHistory = []      // Array de versiones anteriores
window._genAnnotacionPendiente    // Base64 del canvas con anotaciones
```

**Funciones JS clave:**
```javascript
generarDiseno()          // Llama a /api/generate-design
renderPreviewDiseno()    // Inyecta HTML en iframe via srcdoc
aplicarZoom(val)         // Escala el iframe con transform:scale()
toggleAnnotMode(on)      // Activa/desactiva modo anotación (canvas overlay)
setAnnotTool(tool)       // brush | rect | arrow
setupAnnotEvents()       // Listeners del canvas
getAnnotacionBase64()    // Combina iframe + canvas en una imagen PNG
descargarImagen(fmt)     // html2canvas → PNG/JPG
descargarDiseno()        // Descarga el HTML
limpiarGenerador()       // Reset completo
restaurarVersion(idx)    // Vuelve a una versión anterior del historial
```

**Layout del Generador (HTML estructura):**
```html
<div id="generador" class="tab-content">
  <!-- grid 320px (panel brief) + 1fr (panel preview) -->
  <div style="display:grid; grid-template-columns: 320px 1fr; gap:20px;">

    <!-- PANEL IZQUIERDO: brief sticky -->
    <div class="panel" style="position:sticky; top:20px;">
      <select id="genFormato">      <!-- formato de la pieza -->
      <textarea id="genBrief">      <!-- brief del usuario -->
      <div id="genIteracionBox">    <!-- visible solo después de la 1ra generación -->
        <textarea id="genIteracion"> <!-- cambios a iterar -->
      </div>
      <div id="genHistorial">       <!-- versiones anteriores -->
    </div>

    <!-- PANEL DERECHO: preview -->
    <div class="panel">
      <div id="genAcciones">        <!-- botones PNG/JPG/HTML/Marcar/Código -->
      <div id="genEmptyState">      <!-- estado vacío inicial -->
      <div id="genLoadingState">    <!-- spinner -->
      <div id="genPreviewContainer">
        <!-- controles de zoom -->
        <div id="genAnnotToolbar">  <!-- toolbar de anotaciones (hidden por defecto) -->
        <div id="genPreviewBox">
          <div id="genIframeWrapper">  <!-- transform:scale() acá -->
            <iframe id="genIframe" srcdoc="...">
            <canvas id="genAnnotCanvas">  <!-- overlay para anotaciones -->
          </div>
        </div>
        <div id="genCodigoPanel">   <!-- pre con el código HTML (toggle) -->
      </div>
    </div>

  </div>
</div>
```

### Fix de layout aplicado (importante)

Por defecto `.tab-content.active` tenía `grid-template-columns: 1fr 1fr` que aplastaba el Generador. Fix:
```css
#generador.tab-content.active {
  display: block;  /* su grid interno 320px 1fr usa el 100% del ancho */
}
```

---

## Tabs del Studio

Orden y estado actual:
1. 🎯 **Validador** (`#validador`) — activo, funciona
2. 🎨 **Generador** (`#generador`) — activo, funciona
3. ✍️ **Copy** (`#copy`) — activo, endpoint ok, sin testear en profundidad
4. 🧠 **Brand Brain** (`#brain`) — activo, marcas cargadas en MySQL
5. 🔍 **Competencia** — `.tab-disabled`, muestra "Próximamente"
6. 📊 **Reportes** — `.tab-disabled`
7. 📈 **Analytics** — `.tab-disabled`

Tabs deshabilitados tienen clase `.tab-disabled` y llaman `showComingSoon(nombre)` al hacer click.

---

## El Validador

**POST /api/validate**

- Un solo llamado a Claude Sonnet (sin web search propio)
- Lee `getContextoValidador()` (titulos de 25 libros de marketing) + `getContextoActual()` (tendencias+efemérides de MySQL)
- Detecta `tipo_contenido` y `etapa_funnel` del contenido
- Devuelve 3 versiones mejoradas: `directa` (mismo formato), `narrativa`, `disruptiva`

**Response shape:**
```json
{
  "success": true,
  "coach_analysis": { ...mismo objeto... },
  "score": 72,
  "aligned": false,
  "tipo_contenido": "educativo",
  "etapa_funnel": "consideracion",
  "diagnostico": "El contenido...",
  "cambios": ["cambio 1", "cambio 2"],
  "opciones": {
    "directa": "...",
    "narrativa": "...",
    "disruptiva": "..."
  },
  "aprendizaje_clave": "..."
}
```

> **Nota:** el frontend busca `data.coach_analysis` Y también `data.score` directamente (dual shape por compatibilidad histórica).

---

## Sistema de Contexto Actual (Tendencias + Efemérides)

**Problema resuelto:** validate y copy antes hacían web search en tiempo real → timeouts.

**Solución:** MySQL table `contexto_actual` con datos pre-computados.

```sql
CREATE TABLE contexto_actual (
  tipo VARCHAR(50) PRIMARY KEY,
  contenido LONGTEXT,
  updated_at DATETIME
);
-- tipos: 'tendencias', 'efemerides'
```

**Actualización:**
- `POST /api/cron/tendencias` → Claude web search, tendencias semana pasada + próxima
- `POST /api/cron/efemerides` → Claude web search, efemérides del mes siguiente
- Ambos protegidos con header `x-cron-secret: custer2026`

**Pendiente:** Configurar cron-job.org (gratis) con:
- Tendencias: lunes 8am ART → POST https://custeraistudio.vercel.app/api/cron/tendencias
- Efemérides: día 28 de cada mes, 9am ART → POST https://custeraistudio.vercel.app/api/cron/efemerides

Header a enviar en ambos: `x-cron-secret: custer2026`

---

## Brand Brain (lib/cerebro.js)

Los datos de cada marca se guardan de dos formas:

**1. Archivos locales en `/cerebro/02_ADN_Marcas/`**  
Markdown con el ADN completo de la marca. `getADNMarca(nombre)` busca por nombre parcial case-insensitive.

**2. MySQL tabla `brands`**  
Para persistencia y multi-usuario. `lib/brands-db.js` maneja el CRUD.

La marca activa en el frontend se guarda en `currentBrand` (variable global JS). Se pasa como `brain: { nombre: "FarmaVida" }` a los endpoints.

---

## Próximos pasos prioritarios

### 1. Asset Tray (DISEÑADO, pendiente implementar)
**Qué es:** Panel lateral en el Generador donde el usuario sube sus propias imágenes (logo, fotos de producto) antes de generar.

**Flujo diseñado:**
1. Usuario sube imagen(es) → se guardan como base64 en memoria de sesión
2. Cada imagen tiene un nombre asignable: `serum-vichy`, `logo-farmavida`
3. Claude recibe en el system prompt la lista de assets disponibles: `ASSETS DISPONIBLES: serum-vichy, logo-farmavida`
4. Claude referencia los assets en el HTML: `<img src="{{asset:serum-vichy}}" />`
5. **ANTES de enviar al iframe**, el frontend hace replace de esos tokens por el base64 real
6. Para imágenes no disponibles en el tray → sigue usando `<!--IMG:-->` → web search → gpt-image-1

**Por qué:** El usuario no puede pedirle a gpt-image-1 "el frasco exacto de Vichy Mineral 89" — eso es una foto real. Con el Asset Tray el usuario sube lo que tiene y Claude lo usa.

**Dónde implementar:**
- Frontend: nuevo panel colapsable encima del brief en el panel izquierdo del Generador
- `app/api/generate-design/route.js`: recibir `assets: [{ name, base64 }]` en el body, inyectar lista de nombres en el system prompt
- Frontend: función `reemplazarAssetTokens(html, assets)` que hace replace antes de `iframe.srcdoc = html`

### 2. Cargar Efemérides
Fue bloqueado por rate limit de Anthropic. Ejecutar:
```bash
curl -X POST https://custeraistudio.vercel.app/api/cron/efemerides \
  -H "x-cron-secret: custer2026"
```

### 3. Configurar cron-job.org
Ver sección "Sistema de Contexto Actual" arriba.

### 4. Testear Copy end-to-end
La sección de Copy tiene endpoint funcionando pero no fue testeada con datos reales de marca.

### 5. Brand Brain UX (baja prioridad)
El formulario actual es de slides infinitos. Propuesta: una sola pantalla con secciones colapsables, guardado progresivo, indicador de completitud.

---

## Contexto de producto — qué piensa el dueño

- El usuario es el dueño de la agencia, **no es desarrollador**. Entiende el producto pero necesita explicaciones simples cuando hay que hacer algo en la terminal.
- Las marcas principales que usa para testear: **FarmaVida** (farmacia/skincare), otras marcas de salud/retail.
- La prioridad es tener un generador de piezas que funcione bien con las marcas del cliente — no features nuevas.
- El modelo de negocio: usar el Studio internamente para producir contenido para clientes. No es un SaaS público (todavía).
- OpenAI API key viene del plan mensual de empresa (no paga por uso adicional mientras no pase el límite).
- Anthropic API key tiene saldo cargado manualmente.

---

## Errores conocidos / gotchas

| Problema | Causa | Fix |
|----------|-------|-----|
| `genAcciones` siempre visible | HTML tiene dos atributos `style=` en el mismo div — el segundo con `display:none` es ignorado | Pendiente arreglar, afecta UX menor |
| Preview auto-zoom mostraba 20% | `box.clientWidth` era 0 cuando el timeout de 50ms disparaba | Resuelto con `requestAnimationFrame(() => requestAnimationFrame(...))` |
| 504 timeouts en validate | Web search + Claude call muy lento | Resuelto: se eliminó web search de validate, usa DB |
| Rate limit 30k tokens/min | System prompt incluía 25 libros completos | Resuelto: versión condensada solo con títulos |
| `coach_analysis not found` | Nueva ruta devolvía objeto plano, frontend esperaba `.coach_analysis` | Resuelto: `{ success, coach_analysis: result, ...result }` |
| vercel.ts conflicto con vercel.json | vercel.ts usaba `@vercel/config/v1` que nunca funcionó | Resuelto: se eliminó vercel.ts |
| Panel Generador cortado al 50% | `.tab-content.active` tenía `grid-template-columns: 1fr 1fr` global | Resuelto: `#generador.tab-content.active { display: block }` |

---

## Comandos útiles

```bash
# Desarrollo local
cd /Users/leandromoyano/agentes/custer_ai_studio
npm run dev   # http://localhost:3000/studio-v2.html

# Deploy a producción
vercel --prod --yes

# Ver logs en tiempo real
vercel logs https://custeraistudio.vercel.app --follow

# Poblar efemérides manualmente
curl -X POST https://custeraistudio.vercel.app/api/cron/efemerides \
  -H "x-cron-secret: custer2026"

# Poblar tendencias manualmente
curl -X POST https://custeraistudio.vercel.app/api/cron/tendencias \
  -H "x-cron-secret: custer2026"
```

---

## Notas de sesiones anteriores

- **28/04** — Validador reescrito, contexto-actual con MySQL, endpoints cron
- **29/04** — Reorden de tabs, Brand Brain UX planeada, análisis de Open Design (descartado, se construyó nativo)
- **30/04** — Generador v1 completo: HTML en iframe, anotaciones, historial, descarga PNG/JPG/HTML, gpt-image-1 para imágenes, web search como paso previo
- **02/05** — Fix layout preview panel (100% ancho), upgrade system prompt con CSS profesional (OKLCH, design tokens, animaciones, efectos premium)

Las notas completas de cada sesión están en:
`/Users/leandromoyano/Obsidian/Vault/Cerebro agencia/05_Sistema_Custer/`
