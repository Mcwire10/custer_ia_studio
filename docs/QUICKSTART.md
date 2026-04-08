# ⚡ QuickStart - Brand Loader Setup (5 minutos)

## 🔴 ESTADO ACTUAL

Los endpoints están implementados pero dan errores porque:
- ❌ **ANTHROPIC_API_KEY** no está configurado
- ❌ **SCRAPEGRAPH_API_KEY** no está configurado
- ⚠️ **Rutas de API** pueden ser relativas

## ✅ CÓMO ARREGLARLO

### **Paso 1: Agregar API Keys a .env.local**

```bash
# Editar: /Users/leandromoyano/agentes/custer_ai_studio/.env.local

# 1. OBLIGATORIO - Claude Vision
ANTHROPIC_API_KEY=sk-ant-... # Obtén en https://console.anthropic.com

# 2. OPCIONAL (para Instagram mejor)
SCRAPEGRAPH_API_KEY=... # Obtén en https://scrapegraph.ai

# 3. OPCIONAL (alternativa Instagram)
APIFY_API_KEY=... # Obtén en https://apify.com
```

### **Paso 2: Instalar Dependencias**

```bash
cd /Users/leandromoyano/agentes/custer_ai_studio
npm install sharp ffmpeg-static
```

### **Paso 3: Reiniciar Server**

```bash
npm run dev
# Debería correr en http://localhost:3000
```

### **Paso 4: Testear**

```bash
# Test imágenes (DEBE funcionar)
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@test.jpg"

# Test Instagram
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "nike"}'
```

---

## 🔍 ERRORES QUE VAS A VER

### **Error 1: "Failed to parse URL from /api/analyze-visual-assets"**

```
❌ Failed to execute 'fetch' on 'Window':
   Failed to parse URL from /api/analyze-visual-assets
```

**Causa:** La ruta es relativa y el navegador no la entiende

**Solución (editar en brand-loader.html):**

```javascript
// Antes ❌
const response = await fetch('/api/analyze-visual-assets', {

// Después ✅
const response = await fetch(`${window.location.origin}/api/analyze-visual-assets`, {
```

O mejor aún, crear función helper:

```javascript
const API_BASE = window.location.origin

async function analyzeImages() {
  const response = await fetch(`${API_BASE}/api/analyze-visual-assets`, {
    method: 'POST',
    body: formData
  })
}
```

---

### **Error 2: "API Key no configurada"**

```
❌ { error: "API Key no configurada" }
```

**Causa:** ANTHROPIC_API_KEY falta en .env.local

**Solución:**
1. Ir a https://console.anthropic.com
2. Crear API Key
3. Agregar a .env.local:
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
   ```
4. Reiniciar server: `npm run dev`

---

### **Error 3: "Instagram not found"**

```
❌ { error: "User not found or Instagram account is private" }
```

**Causa:** Usuario privado o no existe

**Solución:**
- Prueba con @nike, @apple, @instagram (públicos)
- Si ScrapeOGraph no está configurado, usa mock data
- Agrega SCRAPEGRAPH_API_KEY si quieres datos reales

---

## 📋 CHECKLIST RÁPIDO

```
ANTES DE TESTEAR:
☐ npm install sharp ffmpeg-static
☐ Agregar ANTHROPIC_API_KEY a .env.local
☐ npm run dev (reiniciar server)

TESTEAR ENDPOINTS:
☐ POST /api/analyze-visual-assets (con imagen)
☐ POST /api/scrape-instagram (con @usuario)
☐ POST /api/scrape-website (con URL)
☐ POST /api/auto-populate-brand (maestro)

INTEGRACIÓN:
☐ Arreglar rutas en brand-loader.html
☐ Agregar dropdown en studio-v2.html
☐ Probar carga completa de marca
☐ Guardar en MySQL
☐ Cargar desde dropdown
```

---

## 🎯 RUTAS QUE NECESITAN ARREGLARSE

### **Archivo: `/public/brand-loader.html`**

**Buscar y reemplazar:**

```javascript
// ANTES ❌ (3 líneas)
fetch('/api/analyze-visual-assets', {
fetch('/api/scrape-instagram', {
fetch('/api/scrape-website', {

// DESPUÉS ✅ (3 líneas)
fetch(`${window.location.origin}/api/analyze-visual-assets`, {
fetch(`${window.location.origin}/api/scrape-instagram`, {
fetch(`${window.location.origin}/api/scrape-website`, {
```

O crear helper al inicio de brand-loader.html:

```javascript
const API = {
  analyzeVisual: () => fetch(`${window.location.origin}/api/analyze-visual-assets`),
  fetchInstagram: (handle) => fetch(`${window.location.origin}/api/scrape-instagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: handle })
  }),
  scrapeWebsite: (url) => fetch(`${window.location.origin}/api/scrape-website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
}
```

---

## 🧪 TESTS RÁPIDOS

### **Test 1: Imagen**
```bash
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@logo.jpg"

# ✅ Si retorna: { success: true, analysis: { colors: [...] } }
```

### **Test 2: Instagram**
```bash
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "nike"}'

# ✅ Si retorna: { success: true, data: { followers: ... } }
```

### **Test 3: Website**
```bash
curl -X POST http://localhost:3000/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nike.com"}'

# ✅ Si retorna: { success: true, data: { detected_colors: [...] } }
```

### **Test 4: Maestro (todos juntos)**
```bash
curl -X POST http://localhost:3000/api/auto-populate-brand \
  -F "images=@logo.jpg" \
  -F "instagram_handle=nike" \
  -F "website_url=https://nike.com"

# ✅ Si retorna: { success: true, brand: { nombre: "nike", color_primario: "#...", ... } }
```

---

## ⏱️ Timeline Esperado

| Tarea | Tiempo |
|-------|--------|
| Agregar API Keys | 5 min |
| npm install | 2 min |
| Testear endpoints | 5 min |
| Arreglar rutas en HTML | 5 min |
| Integrar en studio-v2 | 15 min |
| Testing completo | 10 min |
| **TOTAL** | **~40 minutos** |

---

## 📞 Si algo no funciona

1. **Ver error en browser console (F12)**
2. **Ver logs del server (terminal con npm run dev)**
3. **Verificar .env.local tiene las variables**
4. **Testear endpoint con curl (arriba)**
5. **Leer BRAND_LOADER_README.md para más detalles**

---

**¡Listo! Ya puedes empezar. Cualquier duda, revisar `/BRAND_LOADER_README.md`**
