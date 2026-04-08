# 🎨 Brand Loader - Sistema Automático de Carga de Marcas

## 📋 Overview

Se ha implementado una **arquitectura completa** para cargar marcas automáticamente sin formularios manuales de 11 slides.

### **Cómo funciona:**
```
User: Arrastra imágenes + @Instagram + URL sitio
    ↓
Sistema (Paralelo):
    - Analiza imágenes con Claude Vision
    - Fetch datos Instagram
    - Scrape colores/tipografía del sitio
    ↓
Consolida todo en 1 "brand" object
    ↓
Guarda en MySQL
    ↓
Studio-v2.html pre-carga automáticamente
```

---

## 📁 Estructura de Carpetas

```
/app/api/
├─ auto-populate-brand/       ← Maestro orquestador (paralelo)
│  └─ route.js
├─ analyze-visual-assets/     ← Claude Vision (imágenes)
│  └─ route.js
├─ scrape-instagram/          ← Auto-fetch Instagram
│  └─ route.js
├─ scrape-website/            ← Scrape sitios web
│  └─ route.js
└─ brands/                     ← CRUD MySQL
   ├─ route.js
   └─ [id]/route.js

/app/lib/
└─ media-converter.js          ← Conversión formatos (Sharp + ffmpeg)

/lib/
└─ brands-db.js               ← Funciones MySQL (saveBrand, getBrand, etc)

/public/
└─ brand-loader.html          ← UI/UX nueva (drag & drop)

/documentación/
├─ BRAND_LOADER_SETUP.md      ← Guía técnica completa
├─ STYLE_GUIDE_CLEANUP.md     ← Guía UI/UX aplicar a app
└─ BRAND_LOADER_README.md     ← Este archivo
```

---

## 🚀 Configuración Requerida

### **1. Variables de Entorno (.env.local)**

Agregar TODAS estas:

```env
# ============= ANTHROPIC (REQUERIDO) =============
# Para análisis visual con Claude Vision
ANTHROPIC_API_KEY=sk-ant-...
# Signup: https://console.anthropic.com

# ============= INSTAGRAM SCRAPING (Opcional - Fallbacks) =============
# Opción A: ScrapeOGraph (recomendado)
SCRAPEGRAPH_API_KEY=...
# Signup: https://scrapegraph.ai

# Opción B: Apify (alternativa)
APIFY_API_KEY=...
# Signup: https://apify.com

# ============= MYSQL (Si usas DB local) =============
# Estos probablemente ya están en lib/db.js
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=custer_studio
```

**Nota:**
- **ANTHROPIC_API_KEY** es OBLIGATORIO (sin Claude Vision no funciona análisis visual)
- Los de Instagram tienen fallbacks (mock data si no están configuradas)
- MySQL es necesario para persistencia (guardar & reutilizar marcas)

---

## 🔌 Endpoints Implementados

### **1. POST `/api/auto-populate-brand` (MAESTRO)**

**Orquesta todo en paralelo:**

```bash
curl -X POST http://localhost:3000/api/auto-populate-brand \
  -F "images=@logo.png" \
  -F "images=@screenshot.png" \
  -F "instagram_handle=@tunombre" \
  -F "website_url=https://tudominio.com"
```

**Qué hace:**
- Llama analyze-visual-assets (imágenes)
- Llama scrape-instagram (@usuario)
- Llama scrape-website (URL)
- Espera los 3 en **paralelo** (sin bloqueos)
- Consolida en 1 brand object
- Retorna listo para Brain

**Response:**
```javascript
{
  success: true,
  brand: {
    nombre: "tunombre",
    color_primario: "#667eea",
    tipografia_principal: "Gotham",
    metricas_redes: { instagram_seguidores: 5000, ... },
    // ... todos los 11 campos
  }
}
```

---

### **2. POST `/api/analyze-visual-assets` (IMÁGENES)**

**Analiza imágenes con Claude Vision**

```bash
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@logo.jpg" \
  -F "files=@banner.png" \
  -F "files=@video.mp4"
```

**Formatos soportados:**
- ✅ JPG, PNG (nativos)
- ✅ WebP, GIF, HEIC, AVIF (convertidos a JPEG)
- ✅ MP4 (extrae frames - requiere ffmpeg)

**Detecta:**
- Colores dominantes (hex + nombre + confidence)
- Tipografía (family, style, weights)
- Estilo visual (moderno/clásico, elementos, emociones)

---

### **3. POST `/api/scrape-instagram` (INSTAGRAM)**

```bash
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "@tunombre"}'
```

**Métodos (fallback chain):**
1. ScrapeOGraph (si SCRAPEGRAPH_API_KEY está configurado)
2. Apify (si APIFY_API_KEY está configurado)
3. Mock data (testing sin APIs)

**Retorna:**
```javascript
{
  username: "tunombre",
  followers: 5000,
  engagement_rate: 4.5,
  bio: "Tu descripción",
  posts: [...]
}
```

---

### **4. POST `/api/scrape-website` (SITIO WEB)**

```bash
curl -X POST http://localhost:3000/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://tudominio.com"}'
```

**Extrae:**
- Colores del CSS y estilos inline
- Tipografías detectadas
- Meta tags (title, description, og:image)
- Estructura de contenido

---

### **5. GET/POST `/api/brands` (CRUD MySQL)**

**Listar todas:**
```bash
curl http://localhost:3000/api/brands
```

**Guardar:**
```bash
curl -X POST http://localhost:3000/api/brands \
  -H "Content-Type: application/json" \
  -d '{"brand": {...}}'
```

**Cargar 1:**
```bash
curl http://localhost:3000/api/brands/123
```

---

## 🧪 Testing

### **Antes de empezar:**
```bash
npm install sharp ffmpeg-static  # Conversión de formatos
npm run dev                      # Iniciar server
```

### **Test 1: Verificar API Key**
```bash
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@test.jpg"
```

❌ **Si ves:** "API Key no configurada"
→ Agrega ANTHROPIC_API_KEY a .env.local

✅ **Si ves:** Colores detectados → OK!

---

### **Test 2: Instagram (con fallback)**
```bash
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "nike"}'
```

✅ **Si ves:** Mock data (fuente: "mock_data") → Funciona (sin API)
✅ **Si ves:** Datos reales → APIs configuradas OK!

---

### **Test 3: Website Scraping**
```bash
curl -X POST http://localhost:3000/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nike.com"}'
```

✅ Debe retornar colores y fonts detectados

---

### **Test 4: Auto-Populate (Maestro)**
```bash
curl -X POST http://localhost:3000/api/auto-populate-brand \
  -F "images=@logo.png" \
  -F "instagram_handle=nike" \
  -F "website_url=https://nike.com" | jq '.brand'
```

✅ Debe retornar **brand COMPLETO** con todos los campos

---

## 🛠️ Librerías Clave

### **`app/lib/media-converter.js`**

Convierte cualquier formato de imagen a JPEG para Claude Vision:

```javascript
import { convertToJpeg, isValidSize, resizeIfNeeded } from '@/app/lib/media-converter'

// Detecta formato, convierte si necesario
const jpegBuffer = await convertToJpeg(buffer, mimeType)

// Valida tamaño (máx 5MB)
if (!isValidSize(buffer)) throw new Error('Too large')

// Redimensiona si es muy grande
const resized = await resizeIfNeeded(jpegBuffer, 2000, 2000)
```

**Soporta:**
- JPG, PNG, WebP, GIF, HEIC, AVIF, MP4

---

### **`lib/brands-db.js`**

Operaciones MySQL:

```javascript
import {
  saveBrand,           // Guardar nueva marca
  getBrand,            // Obtener por ID
  getAllBrands,        // Listar todas
  updateBrand,         // Actualizar
  deleteBrand          // Eliminar
} from '@/lib/brands-db'

// Guardar
const result = await saveBrand(brandData)
console.log(result.id)  // ID de la marca

// Cargar
const brand = await getBrand(123)
```

---

## 📱 Brand Loader UI

**Ubicación:** `/public/brand-loader.html`

**Características:**
- ✅ Drag & drop para imágenes
- ✅ Auto-fetch Instagram (sin botón)
- ✅ Auto-scrape website (sin botón)
- ✅ Progress tracker en tiempo real
- ✅ Review tabs (colores, tipografía, estilo, Instagram)
- ✅ Selector de marcas guardadas (dropdown)
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Sin JSON visible (limpio)

**Acceder:**
```
http://localhost:3000/public/brand-loader.html
```

---

## 🎯 Problemas Conocidos & Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Failed to parse URL from /api/..." | Ruta incorrecta | Verifica NEXT_PUBLIC_SITE_URL |
| "API Key no configurada" | ANTHROPIC_API_KEY falta | Agrega a .env.local |
| "Instagram not found" | Usuario privado o no existe | Prueba con @nike, @apple |
| "No se pudo acceder al sitio" | URL inválida o bloqueada | Verifica URL es accesible |
| "Format not supported" | Archivo corrupto o formato raro | Usa JPG, PNG, WebP directamente |

---

## 📖 Documentación Adicional

**Para entender la arquitectura:**
→ Ver `/BRAND_LOADER_SETUP.md`

**Para aplicar UI/UX limpia a toda la app:**
→ Ver `/STYLE_GUIDE_CLEANUP.md`

---

## ✅ Checklist de Setup

- [ ] Copiar archivos a carpetas correctas ✅
- [ ] Instalar dependencias: `npm install sharp ffmpeg-static`
- [ ] Configurar .env.local:
  - [ ] ANTHROPIC_API_KEY (obligatorio)
  - [ ] SCRAPEGRAPH_API_KEY (opcional)
  - [ ] APIFY_API_KEY (opcional)
  - [ ] MySQL credenciales (si local)
- [ ] Crear tabla MySQL: `initializeDatabase()` (se crea automáticamente)
- [ ] Testear cada endpoint (ver Testing section)
- [ ] Integrar dropdown en studio-v2.html
- [ ] Aplicar estilos UI/UX limpios (ver STYLE_GUIDE)
- [ ] Deploy a producción

---

## 🚀 Próximos Pasos

### **Para tu socio programador:**

1. **Setup inicial:**
   ```bash
   npm install sharp ffmpeg-static
   npm run dev
   ```

2. **Agregar variables .env.local:**
   - Mínimo: ANTHROPIC_API_KEY
   - Opcional: SCRAPEGRAPH_API_KEY, APIFY_API_KEY

3. **Test endpoints:**
   - Ver sección Testing

4. **Integrar en studio-v2.html:**
   - Agregar dropdown que llame `/api/brands`
   - Función `loadBrandFromDB(id)` para pre-cargar
   - Ver ejemplo en `/BRAND_LOADER_SETUP.md`

5. **Aplicar UI/UX limpia:**
   - Seguir `/STYLE_GUIDE_CLEANUP.md`
   - Usar gradient primary (#667eea → #764ba2)
   - Estándares: botones, inputs, cards

---

## 📞 Contacto / Preguntas

**Si falta algo o no funciona:**
- Revisar errores en console (F12 → Network)
- Verificar .env.local variables
- Testear endpoints con curl
- Ver logs del servidor (`npm run dev`)

---

**Implementado por:** Claude Code Agent
**Fecha:** 2026-04-07
**Status:** ✅ Listo para integración
