# 🎯 Integración de Skills desde Otro Proyecto

## 🤔 ¿Qué son los Skills?

Los **skills** son módulos reutilizables que hacen cosas específicas:
- Crear PDFs, PowerPoints, Word docs
- Generar imágenes
- Procesar datos en Excel
- Convertir formatos

**En Custer IA Studio**, los usamos para:
```
Claude genera contenido (slides, copy, etc)
  ↓
Skill lo convierte a formato descargable
  ↓
Usuario descarga el archivo profesional
```

---

## 📦 Cómo llevar Skills de tu otro proyecto aquí

### **Opción 1: Skills Locales (Recomendado)**

Cada skill es un archivo en una carpeta `skills/`:

```
custer_ai_studio/
└── skills/
    ├── presentation-builder/
    │   ├── skill.md          # Documentación
    │   └── handler.js        # Lógica
    │
    ├── pdf-generator/
    │   ├── skill.md
    │   └── handler.js
    │
    └── excel-exporter/
        ├── skill.md
        └── handler.js
```

### **Opción 2: API Endpoints que llamen Skills**

```
Frontend → /api/export-presentation
         → llama a skill local
         → devuelve archivo
```

---

## 💡 Ejemplos de Integración

### **Ejemplo 1: Generar Presentación desde Carousel**

```javascript
// En GeneratorPane.jsx
import { createPresentation } from '@/skills/presentation-builder/handler'

async function downloadAsPresentation() {
  const pptx = await createPresentation({
    carousel: car,
    brand: brain,
    theme: 'professional'
  })

  // Descargar
  const blob = new Blob([pptx], { type: 'application/vnd.openxmlformats' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'custer-carousel.pptx'
  a.click()
}
```

### **Ejemplo 2: Exportar Copy a Word Document**

```javascript
// En ReportsPane.jsx
import { exportToWord } from '@/skills/word-exporter/handler'

async function downloadReport() {
  const docx = await exportToWord({
    report: report,
    brand: brain,
    format: 'ejecutivo'
  })

  // Descargar
  saveFile(docx, 'report.docx')
}
```

### **Ejemplo 3: Generar tabla competencia en Excel**

```javascript
// En CompetitionPane.jsx
import { createExcelAnalysis } from '@/skills/excel-exporter/handler'

async function downloadAnalysisExcel() {
  const xlsx = await createExcelAnalysis({
    competitors: result,
    myBrand: brain
  })

  saveFile(xlsx, 'competitive-analysis.xlsx')
}
```

---

## 🏗️ Estructura de un Skill

### **skill.md** (Documentación)
```markdown
# Presentation Builder

Convierte un carousel de Custer en PowerPoint profesional.

## Input
```json
{
  "carousel": { /* slides array */ },
  "brand": { /* brand brain */ },
  "theme": "professional|minimal|vibrant"
}
```

## Output
Buffer con archivo .pptx

## Uso
```javascript
const pptx = await createPresentation(input)
```
```

### **handler.js** (Lógica)
```javascript
import pptxgen from "pptxgenjs"

export async function createPresentation({ carousel, brand, theme }) {
  const pres = new PptxGenJS()

  carousel.slides.forEach((slide, idx) => {
    const layout = pres.defineLayout({ name: 'SLIDE' })
    const slidePage = pres.addSlide('SLIDE')

    // Renderizar slide
    slidePage.addText(slide.title, {
      x: 1, y: 1, w: 8, h: 1,
      font: { size: 44, bold: true }
    })

    // ... más customización
  })

  return pres.write('arraybuffer')
}
```

---

## 🔌 API Endpoints para Skills

Alternativa: API endpoints que llamen a los skills:

```javascript
// app/api/export-presentation/route.js
import { createPresentation } from '@/skills/presentation-builder/handler'

export async function POST(request) {
  const { carousel, brain } = await request.json()

  try {
    const buffer = await createPresentation({ carousel, brain })

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats',
        'Content-Disposition': 'attachment; filename="carousel.pptx"'
      }
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

Uso en Frontend:
```javascript
async function downloadPresentation() {
  const response = await fetch('/api/export-presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carousel: car, brain })
  })

  const blob = await response.blob()
  downloadFile(blob, 'carousel.pptx')
}
```

---

## 📝 Mapa de Skills Potenciales

| Skill | Entrada | Salida | Pane |
|-------|---------|--------|------|
| **Presentation Builder** | carousel | .pptx | Generator |
| **PDF Generator** | report | .pdf | Reports |
| **Word Exporter** | copy+brain | .docx | Copy |
| **Excel Analysis** | competitors | .xlsx | Competition |
| **Image Generator** | copy theme | .png | Copy |
| **Email Template** | copy | .html | Copy |

---

## 🚀 Flujo con Skills Integrados

```
Usuario en Custer IA
  ↓
Genera carousel
  ↓
Click "Descargar como Presentación"
  ↓
Frontend llama /api/export-presentation
  ↓
Backend usa Skill "presentation-builder"
  ↓
Skill renderiza slides → PPTX
  ↓
Backend devuelve archivo
  ↓
Frontend descarga .pptx
  ↓
Usuario abre en PowerPoint
  ✨ ¡Presentación profesional lista!
```

---

## ✅ Checklist para Agregar un Skill

- [ ] Crear carpeta `skills/nombre-skill/`
- [ ] Crear `skill.md` con documentación
- [ ] Crear `handler.js` con función principal
- [ ] Testear función localmente
- [ ] Importar en componente React
- [ ] Agregar botón de descarga
- [ ] Probar flujo completo

---

## 💬 Conversación entre Skill y Custer IA

```
Custer IA:
"Tengo este carousel con 8 slides"

Skill Presentation:
"Dale, voy a convertirlo a PowerPoint con diseño profesional"

Custer IA:
"¿Usas los colores del brand?"

Skill Presentation:
"Claro, tomo el brain y le aplico color1 y color2 en el template"

Custer IA:
"Perfecto, descargalo para el usuario"
```

---

## 🎨 Ejemplo Real: Presentation Builder con Brand

```javascript
// skills/presentation-builder/handler.js

export async function createPresentation({ carousel, brand, theme }) {
  const pres = new PptxGenJS()

  // Configurar colores del brand
  const colors = {
    primary: brand.color1,      // #3730C4
    accent: brand.color2,       // #F5A623
    bg: brand.colorBg,          // #0D0C1E
    text: brand.colorText       // #FFFFFF
  }

  // Plantilla
  const masterSlide = pres.defineLayout({ name: 'TEMPLATE' })
  pres.defineLayout({ name: 'TEMPLATE' }, {
    background: { color: colors.bg }
  })

  // Procesar cada slide del carousel
  carousel.slides.forEach((slide, idx) => {
    const s = pres.addSlide('TEMPLATE')

    // Background del brand
    s.background = { color: colors.primary }

    // Título
    s.addText(slide.title, {
      x: 0.5, y: 0.5, w: 9, h: 1.5,
      font: { size: 40, bold: true, color: colors.text }
    })

    // Highlight con color del brand
    s.addText(slide.titleHighlight || '', {
      x: 0.5, y: 2, w: 9, h: 1,
      font: { size: 36, bold: true, color: colors.accent }
    })

    // Body
    if (slide.body) {
      s.addText(slide.body, {
        x: 0.5, y: 3.2, w: 9, h: 2,
        font: { size: 14, color: colors.text }
      })
    }

    // Pie con branding
    s.addText(`${brand.nombre} • ${brand.rubro}`, {
      x: 0.5, y: 6.8, w: 9, h: 0.5,
      font: { size: 10, color: colors.accent }
    })
  })

  return pres.write('arraybuffer')
}
```

---

**¿Próximo paso?** Definir qué skills específicos necesitas del otro proyecto. 🚀
