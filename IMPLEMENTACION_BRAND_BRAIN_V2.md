# Documentación: Brand Brain V2 - Sistema Completo de Gestión de Marcas

**Fecha:** Abril 2, 2026
**Versión:** 2.0
**Estado:** Beta - Listo para Testing

---

## 📋 Resumen Ejecutivo

Se ha implementado una **expansión completa del módulo Brand Brain** de Custer IA Studio, transformándolo de un formulario básico de 10 campos a un **sistema profesional de gestión de marca con 38+ campos**, análisis visual automático, chat contextual inteligente y visualización gráfica avanzada.

**Cambio Clave:** De un formulario simple a un **briefing estratégico profesional completo**.

---

## 🎯 Objetivos Alcanzados

### ✅ 1. Expansión de Campos (28 nuevos campos)

El formulario Brand Brain pasó de 10 campos básicos a una estructura profesional con:

**INFORMACIÓN BÁSICA (4 campos)**
- Nombre de marca
- Rubro/Industria
- Ciudad
- Propuesta de valor

**INFORMACIÓN ESTRATÉGICA (5 campos)**
- Misión
- Visión
- Valores (array)
- Beneficios funcionales
- Beneficios emocionales

**AUDIENCIA DETALLADA (6 campos)**
- Audiencia demográfica (edad, género, ingreso)
- Audiencia real/psicográfica
- Pain points (problemas del cliente)
- Gains (beneficios buscados)
- Motivaciones de compra
- Comportamiento digital

**IDENTIDAD VISUAL (7 campos)**
- Color primario (hex)
- Color secundario (hex)
- Acentos de color (array)
- Tipografía principal
- Tipografía secundaria
- Estilo visual (fotografía, ilustración, etc)
- Recursos gráficos (íconos, texturas, patrones)
- Sistema gráfico
- Mood board/referencias

**IDENTIDAD VERBAL (5 campos)**
- Voz y tono (pilares comunicacionales)
- Claim/Manifiesto
- Narrativa de marca
- Territorio creativo
- Tonalidad (adjetivos de marca)

**POSICIONAMIENTO (3 campos)**
- Competencia directa (array)
- Diferenciadores (array)
- Propuesta única

**IMPLEMENTACIÓN (3 campos)**
- Canales (array)
- Formatos de contenido (array)
- Frecuencia de publicación

**ANÁLISIS VISUAL**
- Carga de 10-15 imágenes
- Análisis automático con Claude Vision

---

### ✅ 2. Backend API Endpoints

#### **POST /api/process-brand-text**
- **Función:** Procesa texto largo (PDF extraído, documentos) y extrae información de marca
- **Modelo:** Claude Opus 4.1 (2000 max_tokens)
- **Entrada:** `{ text: string }`
- **Salida:** Estructura JSON anidada con todas las secciones
- **Ubicación:** `/app/api/process-brand-text/route.js`

```javascript
{
  basico: { nombre, rubro, ciudad, propuesta },
  estrategico: { mision, vision, valores[], beneficios_funcionales, beneficios_emocionales },
  audiencia: { publico_objetivo, audiencia_real, pain_points[], gains[], motivaciones, comportamiento_digital },
  identidad: { voz_tono, claim, narrativa, territorio_creativo },
  visual: { tipografia, colores: {primario, secundario, acentos[]}, estilo_visual, recursos_graficos, sistema_grafico, mood_board },
  posicionamiento: { competencia[], diferenciadores[], propuesta_unica },
  implementacion: { canales[], formatos[], frecuencia },
  comunicacion: { keywords[], avoid[], tonalidad[], ejemplos }
}
```

#### **POST /api/parse-brand-file**
- **Función:** Procesa PDF/imágenes y extrae información con visión
- **Modelo:** Claude Opus 4.1 (2000 max_tokens)
- **Entrada:** FormData con archivo (PDF, JPG, PNG - hasta 3MB)
- **Salida:** Misma estructura JSON que process-brand-text
- **Ubicación:** `/app/api/parse-brand-file/route.js`

#### **POST /api/analyze-visual-identity**
- **Función:** Analiza 10-15 imágenes y extrae paleta, tipografías, estilos
- **Modelo:** Claude Opus 4.1 (2500 max_tokens)
- **Entrada:** `{ images: [{data, type}], brandName }`
- **Salida:**
```javascript
{
  colores: [{ hex, rgb, nombre, uso, frecuencia }],
  tipografia: [{ familia, peso, uso, estilo }],
  fotografia: { estilo, composicion, temas[], tratamiento, perspectiva },
  elementos_graficos: { iconos[], formas[], texturas[], patrones[], lineas },
  sistema_visual: { consistencia, paleta_dominante[], atmosfera, balance },
  recomendaciones: { mantener[], mejorar[], expandir },
  resumen: string,
  timestamp: ISO
}
```
- **Ubicación:** `/app/api/analyze-visual-identity/route.js`

#### **POST /api/assistant-context**
- **Función:** Chat contextual que explica fuentes de datos y herramientas alternativas
- **Modelo:** Claude Opus 4.1 (1000 max_tokens)
- **Entrada:** `{ module, question, currentData, tools_requested? }`
- **Salida:** `{ response, module, moduleInfo, timestamp }`
- **Módulos soportados:** brain, generador, validador, copy, competition, reports
- **Ubicación:** `/app/api/assistant-context/route.js`

---

### ✅ 3. Frontend - Formulario HTML Expandido

**Archivo:** `/public/studio-v2.html`

**Estructura:**
- Tab "Brand Brain" con 2 paneles (izquierda: formulario, derecha: preview)
- 3 métodos de carga: Archivo, Texto, Manual
- Formulario organizado en 9 secciones temáticas
- Sección de carga de imágenes (10-15 imágenes)
- Chat contextual + cuadro explicativo (dinámico)

**Métodos de Carga:**

1. **📁 Archivo (PDF/JPG/PNG)**
   - Carga automática
   - Compresión automática para imágenes > 3MB
   - Extrae datos con Claude Vision

2. **📝 Pegar Texto**
   - Textarea grande (600px mín)
   - Acepta texto largo sin límite
   - Procesa con Claude

3. **✏️ Manual**
   - Rellena campos directamente
   - Validación al guardar

---

### ✅ 4. Almacenamiento - localStorage

**Estructura de datos:**

```javascript
// Clave: 'custer_brands' (array)
{
  id: "nombre-marca",
  nombre: string,
  rubro: string,
  // ... todos los 38+ campos ...
  createdAt: ISO,
  updatedAt: ISO,
  visualAssets: {
    images: [{ name, data: base64, type }],
    analysis: { colores[], tipografia[], fotografia, ... }
  }
}

// Clave: 'custer_current_brand' (objeto único)
// Clave: 'custer_brand_chat_${brandId}' (array de conversaciones)
```

**Capacidad:** ~5-10MB por marca (limitado por localStorage)

---

### ✅ 5. JavaScript - Funciones Clave

**Gestión de Marca:**
- `saveBrand()` - Guarda/actualiza marca en localStorage
- `selectBrand()` - Selecciona marca actual
- `updateBrandSelector()` - Actualiza dropdown de marcas

**Carga de Datos:**
- `procesarTextoMarca()` - Envía texto a `/api/process-brand-text`
- `sendBrandFile()` - Envía archivo a `/api/parse-brand-file`
- `compressAndUploadImage()` - Comprime automáticamente imágenes grandes

**Análisis Visual:**
- `handleVisualImages()` - Maneja carga múltiple acumulativa de imágenes
- `analyzeVisualIdentity()` - Envía imágenes a `/api/analyze-visual-identity`

**Visualización:**
- `updateBrainPreview()` - Renderiza preview con colores gráficos, tipografías
- `updateBrainPreview()` - Genera brief estratégico didáctico

**Chat Contextual:**
- `initializeModuleChat(module)` - Crea chat dinámicamente en cada módulo
- `sendContextQuestion(module)` - Envía pregunta a `/api/assistant-context`

---

## 🎨 Visualización - Brand Brain Preview

**Elementos Visuales:**

### Paleta de Colores
- Flotantes gráficos (60x60px) por color
- Código hex visible debajo
- Nombre del color
- Uso (primario, secundario, acento)

### Tipografía
- Muestra visual de cada fuente
- Clasificación (principal, secundaria)
- Características

### Brief Estratégico
- Secciones temáticas
- Gradient background (#6860EE + #F5A623)
- Emojis identificadores
- Información jerárquica

---

## 💬 Chat Contextual

**Ubicación:** Pie de cada módulo (creado dinámicamente)

**Componentes:**
1. **Cuadro Explicativo**
   - Icono del módulo
   - Nombre del módulo
   - Fuentes de datos que usa

2. **Chat**
   - Input textarea
   - Historial de conversación
   - Respuestas de Claude

**Módulos Soportados:**
- 🧠 Brand Brain - Vision API, PDF, Análisis Visual
- ✨ Generador - Brand Data, Tipografía, AI Creativo
- ✅ Validador - Identidad, Voz y Tono, Compliance
- ✍️ Copy - Brand Copy, Audiencia, Platform Optimization
- 🏆 Competencia - Meta Ads, Pinterest API, Instagram
- 📊 Reportes - Instagram API, Meta Insights, Analytics

---

## 🔄 Flujo Completo - Cargar una Marca

1. **Usuario carga PDF o pega texto**
   - Endpoint procesa con Claude
   - JSON estructurado retorna

2. **Formulario se llena automáticamente**
   - 38+ campos poblados
   - Fallback para estructura antigua
   - Toast de éxito

3. **Usuario sube 10-15 imágenes**
   - Preview acumulativo (sin borrar anteriores)
   - Max 15 imágenes
   - Puedo eliminar haciendo click

4. **Análisis visual automático**
   - Claude Vision analiza todas las imágenes
   - Extrae paleta de colores, tipografías, estilos
   - Resultado se muestra gráficamente

5. **Guardar marca**
   - Click en "Guardar/Actualizar marca"
   - Se persiste en localStorage
   - Disponible en selector dropdown

6. **Ver preview mejorado**
   - Colores visuales con códigos hex
   - Tipografías con ejemplos
   - Brief estratégico completo

7. **Usar chat contextual**
   - Preguntar sobre herramientas
   - Entender fuentes de datos
   - Solicitar cambios de herramientas

---

## 📁 Archivos Modificados/Creados

### Creados:
- ✅ `/app/api/process-brand-text/route.js` (180 líneas)
- ✅ `/app/api/analyze-visual-identity/route.js` (200 líneas)
- ✅ `/app/api/assistant-context/route.js` (140 líneas)

### Modificados:
- ✅ `/public/studio-v2.html` (Expansión de ~1000 a ~2100 líneas)
- ✅ `/app/api/parse-brand-file/route.js` (Expandido con nueva estructura)

---

## 🐛 Problemas Encontrados y Solucionados

### Bug 1: Imágenes Reemplazando Anteriores
**Problema:** Al cargar nueva imagen, se borraba la anterior
**Causa:** `preview.innerHTML = ''` al inicio de `handleVisualImages()`
**Solución:** Remover limpieza de preview, agregar acumulativamente

### Bug 2: Análisis de Imágenes Fallaba
**Problema:** "Could not process image"
**Causa:** Imágenes muy pequeñas o formato incorrecto
**Solución:** Aumentar tamaño máximo de imágenes, aceptar PNGs grandes

### Consideración 3: Estructura JSON
**Problema:** APIs antiguas esperaban estructura plana
**Solución:** Mantener fallback para estructura antigua

---

## 🚀 Siguiente Fase - Mejoras Pendientes

1. **Base de datos persistente** (actualmente localStorage ~5-10MB)
   - PostgreSQL o Firebase para ilimitado
   - Sincronización en la nube

2. **Integración real de APIs**
   - Meta Ads Library API
   - Pinterest Ads API
   - Instagram Business API

3. **Exportación de briefing**
   - PDF profesional
   - PPTX con diseño
   - JSON para integraciones

4. **Colaboración en tiempo real**
   - Múltiples usuarios por marca
   - Comentarios en campos
   - Historial de cambios

5. **Más módulos**
   - Brand Audit
   - Competitor Deep Dive
   - Content Calendar Generator

---

## 📊 Estadísticas

- **Campos totales:** 38+ (vs 10 anteriores)
- **Endpoints nuevos:** 3 (process-brand-text, analyze-visual-identity, assistant-context)
- **Líneas de código añadidas:** ~500+ (HTML, JS, API endpoints)
- **Secciones temáticas:** 9
- **Métodos de carga:** 3
- **Módulos con chat:** 6
- **Imágenes soportadas:** 10-15 por marca

---

## 🎯 Resultados Esperados

Cuando usuario carga un PDF o pega texto:
- ✅ Todos los 38 campos se llenan automáticamente
- ✅ Puede subir 10-15 imágenes de Instagram
- ✅ Análisis visual automático extrae colores y tipografías
- ✅ Vista previa visual y profesional del brief
- ✅ Chat contextual explica cada módulo
- ✅ Datos guardados en localStorage para uso inmediato
- ✅ Sistema completo de gestión de marca listo

---

## 🔐 Seguridad

- ✅ API key nunca expuesta en frontend
- ✅ Validación de tamaños de archivo
- ✅ Límites en cantidad de imágenes
- ✅ Sanitización de entrada en formularios
- ✅ localStorage solo para datos no sensibles

---

**Documento creado:** 2026-04-02
**Desarrollador:** Claude Code + Usuario
**Estado:** Documentación Completa
