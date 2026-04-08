# 🎨 Brand Loader - Guía Completa de Configuración

## **Overview**

El Brand Loader es una arquitectura de carga de marcas completamente automática que:

1. **Detecta** marca automáticamente desde: imágenes, Instagram, sitio web
2. **Analiza** colores, tipografía, estilo visual con Claude Vision
3. **Extrae** seguidores, engagement, bio desde Instagram
4. **Scrape** colores, tipografía, contenido desde sitio web
5. **Consolida** todo en un objeto "Brand" listo para usar
6. **Guarda** en MySQL para reutilizar siempre
7. **Pre-carga** cuando el usuario selecciona brand del dropdown

---

## **Arquitectura Técnica**

### **1. Frontend - Brand Loader Screen**
📁 `/public/brand-loader.html`

**Flujo Usuario:**
```
┌─────────────────────────────────────────────────┐
│  1. ARRASTRA IMÁGENES (JPG, PNG, WebP, GIF, MP4)│
│  2. ESCRIBE @INSTAGRAM (auto-fetch sin botón)   │
│  3. ESCRIBE URL SITIO (auto-scrape sin botón)   │
│  4. REVISA DATOS en tabs (colores, tipografía)  │
│  5. CLICKEA "Continuar" → Studio-v2.html        │
└─────────────────────────────────────────────────┘
```

**Elementos clave:**
- Drop zone con drag & drop
- Progress tracker real-time
- Review tabs con datos detectados
- Buttons: Confirmar / Editar / Rechazar

---

### **2. Backend - Endpoints**

#### **A. POST `/api/auto-populate-brand` (MAESTRO)**
Orquesta todo en paralelo:

```bash
curl -X POST http://localhost:3000/api/auto-populate-brand \
  -F "images=@logo.png" \
  -F "images=@site-screenshot.png" \
  -F "instagram_handle=@tuusuario" \
  -F "website_url=https://tudominio.com"
```

**Qué hace:**
- Llama `POST /api/analyze-visual-assets` (imágenes)
- Llama `POST /api/scrape-instagram` (@usuario)
- Llama `POST /api/scrape-website` (URL)
- **Espera los 3 en paralelo** (sin bloquear)
- Consolida todo en `brandData` object
- Retorna listo para poblar Brain

**Output:**
```javascript
{
  success: true,
  brand: {
    nombre: "",  // Del Instagram
    color_primario: "#667eea",  // De imágenes
    color_secundario: "#764ba2",  // De imágenes
    tipografia_principal: "Gotham",  // Detectada
    estilo_visual: "moderno",  // Detectado
    metricas_redes: {
      instagram_usuario: "tuusuario",
      instagram_seguidores: 5000,
      instagram_engagement: 4.5
    },
    website_url: "https://tudominio.com",
    visualAssets: {
      analysis: { colors: [], typography: {}, style: {} }
    }
    // ... todos los 11 campos del Brain
  }
}
```

---

#### **B. POST `/api/analyze-visual-assets` (IMÁGENES)**
Analiza imágenes con Claude Vision

```bash
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@imagen1.jpg" \
  -F "files=@imagen2.png" \
  -F "files=@video.mp4"
```

**Formatos soportados:**
- ✅ JPG, PNG (nativos)
- ✅ WebP → convertido a JPEG con Sharp
- ✅ GIF → primer frame extraído con Sharp
- ✅ MP4 → requiere ffmpeg (TBD)
- ✅ HEIC → convertido a JPEG con Sharp
- ✅ AVIF → convertido a JPEG con Sharp

**Media Converter** (`/app/lib/media-converter.js`):
```javascript
import { convertToJpeg, isValidSize, resizeIfNeeded } from '@/app/lib/media-converter'

// Detecta formato, convierte si necesario
const jpegBuffer = await convertToJpeg(buffer, mimeType)

// Valida tamaño (máx 5MB)
if (!isValidSize(buffer)) throw new Error('Too large')

// Redimensiona si es muy grande
const resized = await resizeIfNeeded(jpegBuffer, 2000, 2000)
```

**Output:**
```javascript
{
  success: true,
  analysis: {
    colors: [
      { hex: "#667eea", name: "Azul", confidence: 95 },
      { hex: "#764ba2", name: "Púrpura", confidence: 88 }
    ],
    typography: {
      family: "Gotham",
      style: "sans-serif",
      weights: ["regular", "bold"],
      confidence: 92
    },
    style: {
      classification: "moderno",
      elements: ["geometric shapes", "bold typography"],
      emotions: ["professional", "innovative"],
      palette: "cool"
    }
  }
}
```

---

#### **C. POST `/api/scrape-instagram` (@USUARIO)**
Auto-fetch de datos Instagram

```bash
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "@tuusuario"}'
```

**Métodos (fallback chain):**
1. **ScrapeOGraph API** (free tier, ideal)
   - Requiere: `SCRAPEGRAPH_API_KEY`
   - URL: https://scrapegraph.ai

2. **Apify Instagram Scraper** (alternativa)
   - Requiere: `APIFY_API_KEY`
   - Actor: `apify/instagram-profile-scraper`

3. **Mock data** (testing sin API)
   - Retorna datos simulados
   - Útil para desarrollo

**Output:**
```javascript
{
  success: true,
  data: {
    username: "tuusuario",
    followers: 5000,
    engagement_rate: 4.5,
    bio: "Tu biografía aquí",
    posts: [...],
    best_time: "20:00 UTC"
  }
}
```

---

#### **D. POST `/api/scrape-website` (URL)**
Scrape de datos del sitio web

```bash
curl -X POST http://localhost:3000/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://tudominio.com"}'
```

**Qué extrae:**
- Colores dominantes del CSS y estilos inline
- Tipografías detectadas
- Estructura de contenido (headings, CTAs)
- Meta tags (title, description, og:image)

**Output:**
```javascript
{
  success: true,
  data: {
    url: "https://tudominio.com",
    detected_colors: [
      { hex: "#667eea", name: "Azul", confidence: 85 }
    ],
    detected_fonts: [
      { family: "Roboto", type: "google-fonts", confidence: 80 }
    ],
    content_structure: {
      headings: ["Bienvenido", "Características"],
      ctas: ["Comprar", "Contactar"],
      sections: 5
    },
    meta: {
      title: "Mi Sitio",
      description: "Descripción...",
      ogImage: "https://..."
    }
  }
}
```

---

#### **E. POST `/api/brands` (GUARDAR)**
Guarda brand en MySQL

```bash
curl -X POST http://localhost:3000/api/brands \
  -H "Content-Type: application/json" \
  -d '{"brand": { ...brandData }}'
```

**Output:**
```javascript
{ success: true, id: 123, brand: {...} }
```

---

#### **F. GET `/api/brands` (LISTAR)**
Lista todas las marcas guardadas

```bash
curl http://localhost:3000/api/brands
```

**Output:**
```javascript
{
  success: true,
  brands: [
    { id: 1, name: "Nike", updated_at: "2026-04-07T...", thumbnail: "#667eea" },
    { id: 2, name: "Apple", updated_at: "2026-04-07T...", thumbnail: "#000000" }
  ]
}
```

---

#### **G. GET `/api/brands/:id` (CARGAR)**
Carga 1 brand completamente

```bash
curl http://localhost:3000/api/brands/123
```

**Output:** Objeto brand COMPLETO con todos los 11 campos + análisis

---

### **3. Database - MySQL**

**Schema:**
```sql
CREATE TABLE brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE,
  rubro VARCHAR(100),
  propuesta TEXT,
  color_primario VARCHAR(7),
  color_secundario VARCHAR(7),
  tipografia_principal VARCHAR(100),
  estilo_visual VARCHAR(50),
  data JSON,  -- Todos los otros campos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visual_analysis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  brand_id INT UNIQUE,
  detected_colors JSON,
  detected_typography JSON,
  detected_style JSON,
  confidence_score INT,
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);
```

**Funciones** (`/lib/brands-db.js`):
```javascript
import {
  saveBrand,      // Guardar nueva marca
  getBrand,       // Obtener 1 marca por ID
  getBrandByName, // Obtener por nombre
  getAllBrands,   // Listar todas (lite)
  updateBrand,    // Actualizar marca
  deleteBrand,    // Eliminar marca
  saveVisualAnalysis,  // Guardar análisis
  getVisualAnalysis    // Obtener análisis
} from '@/lib/brands-db'
```

---

## **Configuración Requerida (.env.local)**

### **1. Base de datos MySQL**
```env
# lib/db.js ya tiene configuración
# Si necesitas cambiar, edita:
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=custer_studio
```

### **2. APIs Externas (Opcional - Fallbacks disponibles)**

#### **A. Claude Vision (REQUERIDO para análisis visual)**
```env
ANTHROPIC_API_KEY=sk-ant-...
```
- Sin esto: No puede analizar imágenes
- Signup: https://console.anthropic.com

#### **B. ScrapeOGraph (Recomendado para Instagram)**
```env
SCRAPEGRAPH_API_KEY=...
```
- Más confiable, free tier disponible
- Signup: https://scrapegraph.ai
- Fallback: Mock data si no está configurado

#### **C. Apify (Alternativa para Instagram)**
```env
APIFY_API_KEY=...
```
- Alternativa si ScrapeOGraph falla
- Signup: https://apify.com
- Fallback: Mock data si no está configurado

---

## **Pasos para Instalar & Ejecutar**

### **1. Instalar Dependencias**
```bash
npm install sharp ffmpeg-static # Para conversión de formatos
npm install mysql2/promise      # Ya incluida
```

### **2. Crear Base de Datos**
```bash
mysql -u root -p
> CREATE DATABASE custer_studio;
> USE custer_studio;
# Las tablas se crean automáticamente al llamar initializeDatabase()
```

### **3. Configurar .env.local**
```bash
cp .env.example .env.local
# Editar con tus API keys
```

### **4. Iniciar Server**
```bash
npm run dev
# Server corre en http://localhost:3000
```

### **5. Acceder a Brand Loader**
```
http://localhost:3000/public/brand-loader.html
```

---

## **Testing & Verificación**

### **Test 1: Análisis de Imagen**
```bash
curl -X POST http://localhost:3000/api/analyze-visual-assets \
  -F "files=@test-image.jpg" \
  | jq '.analysis'
```

✅ Debe retornar colores, tipografía, estilo

---

### **Test 2: Instagram Fetch**
```bash
curl -X POST http://localhost:3000/api/scrape-instagram \
  -H "Content-Type: application/json" \
  -d '{"username": "nike"}' \
  | jq '.data'
```

✅ Debe retornar followers, engagement, bio

---

### **Test 3: Website Scrape**
```bash
curl -X POST http://localhost:3000/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nike.com"}' \
  | jq '.data.detected_colors'
```

✅ Debe retornar colores detectados

---

### **Test 4: Auto-Populate Maestro**
```bash
curl -X POST http://localhost:3000/api/auto-populate-brand \
  -F "images=@logo.png" \
  -F "instagram_handle=nike" \
  -F "website_url=https://nike.com" \
  | jq '.brand'
```

✅ Debe retornar brand COMPLETO consolidado

---

### **Test 5: Guardar & Cargar**
```bash
# Guardar
curl -X POST http://localhost:3000/api/brands \
  -H "Content-Type: application/json" \
  -d @brand.json \
  | jq '.id'

# Cargar (reemplaza 123 con ID del test anterior)
curl http://localhost:3000/api/brands/123 | jq '.brand'
```

✅ Debe guardar y retornar datos completos

---

## **Troubleshooting**

| Problema | Solución |
|----------|----------|
| "Format not supported" | Checkea MIME type, usa convertToJpeg() |
| "Instagram not found" | Verifica usuario existe públicamente, no privado |
| "Website connection failed" | Checkea URL es accesible, permite User-Agent |
| "Claude API error" | Verifica ANTHROPIC_API_KEY en .env.local |
| "MySQL connection failed" | Checkea credenciales, DB existe |
| "Slow image analysis" | Claude Vision es lento, espera 3-5seg |

---

## **Para el Agente: Instrucciones Automáticas**

Cuando el usuario pida **"Carga una marca"**:

### **Paso 1: Preparar datos**
```
1. User proporciona:
   - Imágenes (JPG, PNG, WebP, GIF, MP4, HEIC)
   - Instagram @usuario (opcional)
   - URL sitio web (opcional)
```

### **Paso 2: Validar formatos**
```
import { isValidFormat, isValidSize } from '@/app/lib/media-converter'

if (!isValidFormat(mimeType)) {
  throw new Error(`Formato no soportado: ${mimeType}`)
}

if (!isValidSize(buffer)) {
  throw new Error('Archivo > 5MB')
}
```

### **Paso 3: Llamar auto-populate**
```javascript
const response = await fetch('/api/auto-populate-brand', {
  method: 'POST',
  body: formData  // Imágenes + instagram + website
})

const { brand } = await response.json()
```

### **Paso 4: Guardar en DB**
```javascript
const saveResponse = await fetch('/api/brands', {
  method: 'POST',
  body: JSON.stringify({ brand })
})

const { id } = await saveResponse.json()
console.log(`✅ Marca guardada con ID ${id}`)
```

### **Paso 5: Poblar Brain**
```javascript
// El brand object ya tiene todos los 11 campos:
// - nombre, rubro, propuesta
// - color_primario, color_secundario
// - tipografia_principal, estilo_visual
// - metricas_redes, website_url, visualAssets
// ... etc

// Passar a studio-v2.html como:
const currentBrand = brand  // Ya listo para usar
```

---

## **Checklist de Implementación**

- [x] Brand Loader UI (`/public/brand-loader.html`)
- [x] Media converter (`/app/lib/media-converter.js`)
- [x] Auto-populate endpoint (`/api/auto-populate-brand`)
- [x] Image analysis (`/api/analyze-visual-assets`)
- [x] Instagram scraper (`/api/scrape-instagram`)
- [x] Website scraper (`/api/scrape-website`)
- [x] MySQL functions (`/lib/brands-db.js`)
- [x] Brands CRUD (`/api/brands/route.js` + `[id]/route.js`)
- [ ] Integrar en studio-v2.html (dropdown brand selection)
- [ ] Aplicar UI/UX a toda la app
- [ ] Tests completos

---

## **Resumen**

El **Brand Loader** es un sistema **completamente automático** que:

1. ✅ Detecta marca desde imágenes (Claude Vision)
2. ✅ Obtiene datos Instagram (Apify/ScrapeOGraph)
3. ✅ Scrape sitio web (JSDOM)
4. ✅ Consolida todo en 1 `brand` object
5. ✅ Guarda en MySQL para reutilizar
6. ✅ Pre-carga al seleccionar del dropdown

**Resultado:** Un usuario arrastra imágenes, escribe @instagram y URL → Sistema configura brand automáticamente → Listo para usar en todas las tabs.

**Sin tedioso formulario de 11 slides.**

