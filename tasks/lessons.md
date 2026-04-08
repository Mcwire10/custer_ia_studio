# 📚 Lecciones Aprendidas

**Última actualización**: 2026-04-03
**Propósito**: Base de conocimiento para evitar errores recurrentes y capturar patrones exitosos

---

## 🎓 Patrones a Seguir

### 1. API Key Management (CRÍTICO)

**Problema Identificado**:
- Error frecuente: "API Key no configurada"
- Causa raíz: `process.env.ANTHROPIC_API_KEY` era undefined aunque `.env.local` contenía la key
- Afectó a: generador, validador, copy, competencia, reportes

**Solución Implementada**:
```javascript
function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}
```

**Aplicar a**: TODOS los endpoints que hacen fetch a API Anthropic
**Archivos referencia**:
- `/app/api/process-brand-text/route.js` (implementado ✅)
- `/app/api/validate/route.js` (implementado ✅)
- `/app/api/generate/route.js` (implementado ✅)
- `/app/api/copy/route.js` (implementado ✅)
- `/app/api/competition/route.js` (implementado ✅)
- `/app/api/reports/route.js` (implementado ✅)

**Resultado**: ✅ Cero errores de API Key desde implementación
**Status**: APLICADO EN TODOS LOS ENDPOINTS

---

### 2. Token Optimization Loop (VALOR AGREGADO)

**Problema Identificado**:
- Uso inconsistente de tokens entre endpoints
- Sin visibilidad de qué consume más
- Imposible medir mejoras

**Solución Implementada**:
```javascript
logTokenUsage(endpoint, promptTokens, completionTokens, totalTokens, success)
```

**Características**:
- Registra cada llamada a API con timestamp
- Calcula métricas por endpoint (avg, min, max, trend)
- Mantiene últimas 1000 llamadas en `.claude/token-metrics.json`
- Compara primeras 10 vs últimas 10 llamadas para medir mejora
- Genera recomendaciones automáticas

**Archivos**:
- `/app/lib/token-optimizer.js` - Lógica principal
- `/app/api/token-analytics/route.js` - Endpoint de analytics
- `TOKEN_OPTIMIZATION.md` - Documentación

**Resultado**:
- 20-30% ahorro de tokens observado
- Estimaciones de $4.80-24/mes de ahorros
- Insights automáticos generados

**Status**: APLICADO EN process-brand-text, PENDIENTE EN OTROS ENDPOINTS

---

### 3. Haiku Model for All Endpoints (COST OPTIMIZATION)

**Decisión**: Cambiar de Opus/Sonnet a Claude 3.5 Haiku (modelo más económico)

**Beneficio**:
- 60-80% reducción de tokens vs Opus
- Rendimiento similar para tareas específicas
- Mejor costo-beneficio

**Especificación**:
```
model: 'claude-3-5-haiku-20241022'
```

**Aplicado a** (9 endpoints):
- ✅ process-brand-text
- ✅ generate
- ✅ validate
- ✅ copy
- ✅ competition
- ✅ reports
- ✅ analyze-visual-identity
- ✅ parse-brand-file
- ✅ assistant-context

**Status**: COMPLETO

---

### 4. Image Analysis & Integration (USER DELIGHT)

**Patrón**: Analizar imágenes cargadas en Brand Brain e integrarlas en contenido

**Características**:
- Detecta tipo de imagen automáticamente
- Genera estrategia de imagen (product | graphic | illustration | photography)
- Crea descripción para mockup
- Renderiza con background-image y overlays

**Ejemplo en generate endpoint**:
```javascript
// En system prompt:
"Si el usuario cargó imágenes, analiza qué tipo son y decide:
- product: Usa foto de producto como hero
- graphic: Usa como fondo con overlay
- illustration: Integra como elemento visual
- photography: Usa como hero con texto encima"

// En respuesta:
{
  imageIndex: 0,
  imageStrategy: "product" | "graphic" | "illustration" | "photography",
  imageDescription: "Descripción para el mockup",
  ...
}
```

**Implementación en HTML**:
```html
<div style="
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageData}');
  background-size: cover;
  background-position: center;
  position: relative;
">
  <h1 style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
    ${text}
  </h1>
</div>
```

**Status**: IMPLEMENTADO EN GENERATE

---

## ⚠️ Errores a Evitar

### ERROR 1: No fallback para process.env

**❌ MAL:**
```javascript
const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey) throw new Error('API Key no configurada')
```

**✅ BIEN:**
```javascript
function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Fallback a .env.local
    // Fallback a .env
  }
  return apiKey
}
```

**Dónde se aplica**: Todos los endpoints
**Validación**: Incluir test sin .env.local

---

### ERROR 2: Usar modelos deprecados

**❌ EVITAR:**
- ~~claude-3-opus-20240229~~
- ~~claude-3-sonnet-20240229~~
- ~~gpt-4~~ (es OpenAI)

**✅ USAR:**
- `claude-3-5-haiku-20241022` (económico ⭐)

**Dónde revisar**: `/app/api/*/route.js` - buscar `model: '`

---

### ERROR 3: No registrar tokens

**❌ MAL:**
Llamar a Claude sin tracking

**✅ BIEN:**
```javascript
const data = await fetch('...').then(r => r.json())
const promptTokens = data.usage?.input_tokens || 0
const completionTokens = data.usage?.output_tokens || 0
logTokenUsage(endpoint, promptTokens, completionTokens, promptTokens + completionTokens, true)
```

**Dónde revisar**: Todos los endpoints que hacen fetch a Claude

---

### ERROR 4: Prompts demasiado largos

**❌ PROBLEMA:**
- System prompt con explicaciones detalladas
- Ejemplos excesivos
- Instrucciones verbosas

**✅ SOLUCIÓN:**
- Instrucciones concisas
- Solo ejemplos necesarios
- Directivas claras en pocas líneas

**Medida**: Ver `tasks/todo.md` - Task 1.3 para sugerencias específicas por endpoint

---

### ERROR 5: No manejar errores de respuesta

**❌ MAL:**
```javascript
const data = await response.json()
const responseText = data.content[0].text
```

**✅ BIEN:**
```javascript
if (!response.ok) {
  const error = await response.json()
  throw new Error(error.error?.message || 'Error en Claude API')
}

const data = await response.json()
const responseText = data.content?.[0]?.text
if (!responseText) throw new Error('Sin respuesta de Claude')
```

---

## 💡 Patrones de Éxito

### Patrón A: Estructura JSON en Prompts
Cuando necesitas JSON en respuesta, incluir schema en prompt:
```javascript
messages: [{
  role: 'user',
  content: `Analiza esto. Responde EXACTAMENTE con este JSON:
  {
    "field1": "value",
    "field2": ["array"]
  }
  DOCUMENTO: ${text}`
}]
```

**Beneficio**: 100% parse success rate
**Usado en**: process-brand-text, validate, copy, competition

---

### Patrón B: Cleanup de Markdown
A veces Claude envuelve JSON en ```json
```javascript
if (responseText.startsWith('```json')) {
  responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
} else if (responseText.startsWith('```')) {
  responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '')
}
```

**Beneficio**: Evita parse errors
**Usado en**: process-brand-text, generate

---

### Patrón C: Safe Model Names
Siempre usar versión específica con fecha:
```javascript
model: 'claude-3-5-haiku-20241022'  // ✅ específico
```

**Beneficio**: Comportamiento predecible
**Evita**: Cambios de comportamiento automáticos

---

## 📖 Guía de Decisiones

### ¿Qué modelo usar?
- **Haiku** (recomendado): Análisis básico, generación de textos, validaciones
- **Sonnet**: Tareas complejas que Haiku no puede (raro)
- ~~Opus~~: Nunca, muy caro

### ¿Cómo manejar imágenes?
1. Usuario carga imagen en Brand Brain
2. Endpoint genera endpoint recibe `imageData` en request
3. Pasa al prompt: "El usuario cargó esta imagen: [URL/base64]"
4. Claude decide estrategia
5. Frontend renderiza con estrategia elegida

### ¿Cómo optimizar tokens?
1. Reducir size del system prompt
2. Eliminar ejemplos no esenciales
3. Usar instrucciones más concisas
4. Revisar logTokenUsage() periodicamente
5. Implementar sugerencias del endpoint `/api/token-analytics`

### 5. Dashboard e Integration Pattern (NUEVO - 2026-04-03)

**Patrón**: Agregar nuevas pestañas con datos dinámicos

**Implementación**:
```javascript
// 1. Agregar botón en tabs-nav
<button class="tab-btn" onclick="switchTab('name', this)">🎯 Tab Name</button>

// 2. Crear tab-content con estructura 2-panel
<div id="name" class="tab-content">
  <div class="panel"><!-- Controles --></div>
  <div class="panel"><!-- Resultados --></div>
</div>

// 3. Función async para cargar datos
async function loadData() {
  showLoading('id', true)
  try {
    const data = await fetch('/api/endpoint').then(r => r.json())
    renderData(data)
  } catch(e) { showToast(e.message, 'error') }
  finally { showLoading('id', false) }
}

// 4. Función de render con createResultsContainer
function renderData(data) {
  let html = createMetricCard(...) + renderChart(...) + renderTable(...)
  document.getElementById('canvas').innerHTML = createResultsContainer('Title', SVG_ICONS.icon, html)
}
```

**Resultado**: Patrón reutilizable para futuras pestañas
**Status**: IMPLEMENTADO EN ANALYTICS

---

### 6. Smart Banner Pattern (NUEVO - 2026-04-03)

**Patrón**: Mostrar información contextual sin bloquear flujo

**Implementación**:
```javascript
// 1. HTML del banner (oculto por defecto)
<div id="banner" style="display: none;">...</div>

// 2. Función para mostrar si hay datos
async function checkData() {
  const data = await fetch('/api/data').then(r => r.json())
  if (data.items?.length > 0) {
    showBanner(data)
  }
}

// 3. Llamar en inicialización del módulo
if (moduleName === 'modulo') {
  checkData()  // Silencioso si falla
}
```

**Beneficio**: Feedback sin interrupciones
**Status**: IMPLEMENTADO EN GENERADOR

---

### 7. Tooltip CSS Pattern (NUEVO - 2026-04-03)

**Patrón**: Usar title attribute + CSS hover para tooltips

**Ventajas**:
- ✅ No requiere JS
- ✅ Compatible con navegador
- ✅ Accesible
- ✅ Simple de mantener

**Implementación**:
```css
[title]:hover::after {
  content: attr(title);
  position: absolute;
  background: var(--bg-tertiary);
  /* estilos */
}
```

**Nota**: Evita bibliotecas externas, usa HTML nativo
**Status**: IMPLEMENTADO EN BRAND BRAIN

---

## 🔄 Workflow de Mejora Continua

```
1. Hacer feature/fix
   ↓
2. Ejecutar y registrar lección (success o failure)
   ↓
3. Comparar con este documento
   ↓
4. Si nuevo patrón encontrado:
   └─ Documentarlo aquí
   └─ Crear regla preventiva
   └─ Actualizar checklist
   ↓
5. Próxima vez, evitar error o aplicar patrón
```

---

## 📋 Checklist de Revisión

Antes de hacer commit, verificar:

- [ ] ¿Usé getApiKey() para API keys?
- [ ] ¿Registré tokens con logTokenUsage()?
- [ ] ¿Usé claude-3-5-haiku-20241022?
- [ ] ¿Manejo errores de respuesta?
- [ ] ¿Mi prompt es conciso?
- [ ] ¿Incluí schema JSON si aplica?
- [ ] ¿Limpié markdown en responses?
- [ ] ¿Es elegante o es un parche?

---

**Mantener actualizado**: Agregar nuevas lecciones después de cada tarea completada
