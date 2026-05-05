/**
 * POST /api/generate-design
 * Flujo mejorado (v3):
 * 1. Extrae colores/tipografía del ADN de marca programáticamente
 * 2. [NUEVO] Si hay assets de referencia, los analiza con Claude Vision para extraer estilo
 * 3. [NUEVO] Genera imagen de fondo fotográfica con Claude Banana + gpt-image-1
 * 4. Claude genera SOLO la capa de texto/CTA sobre esa imagen de fondo
 * 5. Assets {{asset:nombre}} se reemplazan en el frontend
 */

import { getCurrentUser } from '@/lib/auth'
import { getADNMarca } from '@/lib/cerebro'
import { callGemini, callGeminiVision, generateImage } from '@/lib/gemini'

const FORMATOS = {
  'placa-feed':   { w: 1080, h: 1080, label: 'Placa Feed (1:1)' },
  'stories':      { w: 1080, h: 1920, label: 'Stories (9:16)' },
  'banner-email': { w: 600,  h: 200,  label: 'Banner Email' },
  'carrusel':     { w: 1080, h: 1080, label: 'Carrusel (múltiples slides)' },
  'flyer':        { w: 800,  h: 1200, label: 'Flyer vertical' },
}

// Mapeo de formatos a tamaños válidos de gpt-image-1
function getImageSize(dims) {
  const ratio = dims.w / dims.h
  if (ratio > 1.2) return '1536x1024'  // landscape
  if (ratio < 0.8) return '1024x1536'  // portrait / stories
  return '1024x1024'                   // cuadrado
}

/**
 * Extrae colores hex del texto del ADN
 */
function extraerColoresDeMarca(adnText) {
  if (!adnText) return []
  const matches = adnText.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g) || []
  return [...new Set(matches.map(c => c.toUpperCase()))]
}

/**
 * Extrae tipografías mencionadas en el ADN
 */
function extraerTipografiasDeMarca(adnText) {
  if (!adnText) return null
  const tipPatterns = [
    /\*\*[Tt]ipograf[íi]a\*\*[^|]*\|[^|]*\|([^\n|]+)/g,
    /[Tt]ipograf[íi]a[^\n:]*:\s*\*\*([^\n*]+)\*\*/g,
    /\*\*[Pp]rincipal[:\*\*]*\s*([^\n,|*]+)/g,
    /Helvetica[^\n,]*/g,
    /Gotham[^\n,]*/g,
    /Futura[^\n,]*/g,
    /Montserrat[^\n,]*/g,
    /Bebas[^\n,]*/g,
    /Impact[^\n,]*/g,
    /Arial[^\n,]*/g,
  ]
  for (const pattern of tipPatterns) {
    const match = adnText.match(pattern)
    if (match && match[0]) {
      const clean = match[0].replace(/\*\*/g, '').replace(/[Tt]ipograf[íi]a[^\n:]*:\s*/g, '').trim()
      if (clean.length > 2 && clean.length < 80) return clean
    }
  }
  return null
}

/**
 * Construye los CSS tokens reales de marca
 */
function buildBrandTokens(adnText) {
  const colores = extraerColoresDeMarca(adnText)
  const tipografia = extraerTipografiasDeMarca(adnText)
  if (colores.length === 0 && !tipografia) return null

  const primary = colores[0] || null
  const secondary = colores[1] || null
  const tertiary = colores[2] || null

  let css = `/* ═══ TOKENS DE MARCA — USAR OBLIGATORIAMENTE ═══ */\n:root {\n`
  if (primary) css += `  --brand-primary: ${primary};\n`
  if (secondary) css += `  --brand-secondary: ${secondary};\n`
  if (tertiary) css += `  --brand-tertiary: ${tertiary};\n`
  if (primary) {
    css += `  --brand-primary-dark: color-mix(in srgb, ${primary} 75%, black);\n`
    css += `  --brand-primary-light: color-mix(in srgb, ${primary} 20%, white);\n`
  }
  css += `}\n`

  let tipBlock = ''
  if (tipografia) {
    tipBlock = `\n/* ═══ TIPOGRAFÍA DE MARCA ═══ */\n`
    const fontMap = {
      'helvetica neue condensed': `'Arial Narrow', 'Helvetica Neue', Arial, sans-serif`,
      'helvetica': `'Helvetica Neue', Helvetica, Arial, sans-serif`,
      'gotham': `'Montserrat', 'Trebuchet MS', Arial, sans-serif`,
      'futura': `'Trebuchet MS', 'Century Gothic', 'Apple Gothic', sans-serif`,
      'montserrat': `Montserrat, 'Trebuchet MS', Arial, sans-serif`,
      'bebas': `'Impact', 'Arial Narrow', Arial, sans-serif`,
      'impact': `Impact, 'Arial Black', sans-serif`,
      'gill sans': `'Gill Sans MT', Optima, Candara, sans-serif`,
    }
    const tipLower = tipografia.toLowerCase()
    let fontStack = null
    for (const [key, stack] of Object.entries(fontMap)) {
      if (tipLower.includes(key)) { fontStack = stack; break }
    }
    if (fontStack) {
      tipBlock += `:root { --font-brand: ${fontStack}; }\n`
    }
  }

  return { css, tipBlock, colores, tipografia }
}

/**
 * [CLAUDE BANANA] Construye un prompt fotográfico rico usando la fórmula
 * Subject / Style / Environment / Lighting / Action / Camera / Texture
 * para generar el fondo de la pieza con gpt-image-1.
 */
async function buildImagePrompt(brief, adn, brain, dims) {
  const ratio = dims.w / dims.h
  const orientation = ratio > 1.2 ? 'landscape' : ratio < 0.8 ? 'portrait' : 'square'

  const system = `Eres un director de fotografía y prompt engineer especializado en imágenes para publicidad y social media.
Tu tarea: convertir un brief de campaña en un prompt fotográfico estructurado y detallado para gpt-image-1.

USA SIEMPRE este formato de 7 elementos (Claude Banana formula):
SUBJECT: [Qué es el elemento principal]
STYLE: [Estilo fotográfico/artístico — cinematic, editorial, product photography, etc]
ENVIRONMENT: [Ambiente, locación, contexto espacial]
LIGHTING: [Tipo de luz, dirección, dureza, temperatura de color]
ACTION: [Si hay movimiento, gesto, tensión]
CAMERA: [Ángulo, distancia focal, profundidad de campo]
TEXTURE: [Grain, bokeh, sharpness, tratamiento de post]

REGLAS CRÍTICAS:
- La imagen ES EL FONDO de una pieza de social media. Debe dejar ESPACIO VISUAL para texto.
- NO incluir texto, logos, palabras, ni UI elements en la imagen.
- Orientación: ${orientation}
- Idioma del prompt: inglés (mejor compatibilidad con gpt-image-1)
- Devolver SOLO el prompt final en inglés, sin explicaciones ni etiquetas.`

  const userPrompt = `Brief de campaña: "${brief}"
Marca: ${brain?.nombre || 'sin marca'}
ADN resumido: ${adn ? adn.substring(0, 600) + '...' : 'no disponible'}
Formato de imagen: ${orientation} (${dims.w}×${dims.h}px)`

  try {
    const result = await callGemini(userPrompt, system, { maxTokens: 400 })
    return result.text.trim()
  } catch (e) {
    // Fallback: prompt básico extraído del brief
    console.warn('[generate-design] Claude Banana prompt generation failed:', e.message)
    return `${brief}, professional advertising photography, dramatic studio lighting, ${orientation} composition, photorealistic, high quality, no text`
  }
}

/**
 * Genera imagen de fondo fotográfica con gpt-image-1
 */
async function generateBackgroundImage(prompt, dims) {
  const size = getImageSize(dims)
  console.log(`[generate-design] Generando fondo (${size}): "${prompt.substring(0, 80)}..."`)
  const base64 = await generateImage(prompt, { size })
  return base64
}

/**
 * Analiza assets de referencia con Claude Vision para extraer el estilo visual
 * Útil cuando el usuario sube screenshots de posts que le gustan
 */
async function analyzeReferenceAssets(referenceAssets, brandName) {
  if (!referenceAssets || referenceAssets.length === 0) return null

  const images = referenceAssets.map(a => a.data || a.base64).filter(Boolean)
  if (images.length === 0) return null

  const systemPrompt = `Sos un director de arte especializado en análisis visual de piezas de comunicación.`

  const prompt = `Analizá ${images.length > 1 ? 'estas piezas visuales de referencia' : 'esta pieza visual de referencia'} de la marca "${brandName || 'la marca'}".

Extraé y describí en detalle:
1. COMPOSICIÓN: ¿cómo está organizado el espacio? ¿hay grilla visible, asimetría, elementos dominantes?
2. ATMÓSFERA: tono general (oscuro/claro, cálido/frío, dramático/limpio, editorial/popular)
3. FOTOGRAFÍA: ¿hay foto? ¿qué tipo de imagen de fondo usan? Estilo, iluminación, ángulo
4. TIPOGRAFÍA: tamaños relativos, pesos, uso de mayúsculas, estilo (condensed, serif, sans)
5. RECURSOS GRÁFICOS: shapes, underlines, colores de acento, elementos decorativos
6. ENERGÍA GENERAL: ¿cómo se siente esta pieza en 3 palabras?

Sé específico y accionable. Esta descripción se usará directamente para generar una nueva pieza visual similar.`

  try {
    const result = await callGeminiVision(images, prompt, systemPrompt, { maxTokens: 600 })
    return result.text
  } catch (e) {
    console.warn('[generate-design] Vision analysis failed:', e.message)
    return null
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const {
      brief,
      formato = 'placa-feed',
      brain,
      iteracion = null,
      imagenAnotada = null,
      assets = []
    } = await request.json()

    const safeAssets = Array.isArray(assets) ? assets : []

    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const openaiKey = process.env.OPENAI_API_KEY
    const dims = FORMATOS[formato] || FORMATOS['placa-feed']
    const adn = getADNMarca(brain?.nombre)

    // ── Tokens de marca ─────────────────────────────────────────────────
    const brandTokens = buildBrandTokens(adn)
    const hasBrand = !!brain?.nombre

    // ── Clasificar assets por tipo ────────────────────────────────────────
    // Compatibilidad hacia atrás: isReference (viejo) → tipo='referencia'
    const normalizeAsset = a => ({
      ...a,
      tipo: a.tipo || (a.isReference ? 'referencia' : (
        a.name?.toLowerCase().includes('logo') || a.fileName?.toLowerCase().includes('logo')
          ? 'logo' : 'otro'
      ))
    })
    const allAssets = safeAssets.map(normalizeAsset)

    const referenceAssets = allAssets.filter(a => a.tipo === 'referencia')
    const fondoAsset = allAssets.find(a => a.tipo === 'fondo')       // imagen de fondo subida por el usuario
    const logoAsset = allAssets.find(a => a.tipo === 'logo')
    const regularAssets = allAssets.filter(a => a.tipo !== 'referencia' && a.tipo !== 'fondo')
    const hasAssets = regularAssets.length > 0

    // ── PASO 1: Analizar referencias de estilo con Claude Vision ─────────
    let styleDescription = null
    if (referenceAssets.length > 0) {
      console.log(`[generate-design] Analizando ${referenceAssets.length} assets de referencia`)
      styleDescription = await analyzeReferenceAssets(referenceAssets, brain?.nombre)
    }

    // ── PASO 2: Obtener imagen de fondo ───────────────────────────────────
    // Prioridad: 1) fondo subido por usuario, 2) generar con Claude Banana + gpt-image-1
    let backgroundImage = null
    let bgPromptUsado = null

    if (fondoAsset) {
      // El usuario subió su propia imagen de fondo
      backgroundImage = fondoAsset.base64 || fondoAsset.data
      console.log('[generate-design] Usando imagen de fondo subida por usuario')
    } else if (openaiKey && !iteracion) {
      // Auto-generar fondo fotográfico con Claude Banana + gpt-image-1
      try {
        bgPromptUsado = await buildImagePrompt(brief, adn, brain, dims)
        backgroundImage = await generateBackgroundImage(bgPromptUsado, dims)
        console.log('[generate-design] Fondo fotográfico generado exitosamente')
      } catch (e) {
        console.warn('[generate-design] No se pudo generar fondo fotográfico:', e.message)
        backgroundImage = null
        // Fallback: modo institucional (sin foto, puro CSS de marca)
      }
    }

    // ── PASO 3: System Prompt (adaptado según si tenemos fondo o no) ──────
    const systemPrompt = buildSystemPrompt({
      dims, brandTokens, brain, adn, hasAssets, regularAssets, logoAsset,
      backgroundImage, styleDescription, bgPromptUsado
    })

    // ── User Prompt ───────────────────────────────────────────────────────
    let userPrompt
    if (iteracion) {
      const texto = `HTML actual:\n\n${iteracion}\n\nCambio solicitado: ${brief}\n\nDevolvé el HTML completo actualizado.`
      userPrompt = imagenAnotada
        ? `Esta imagen muestra la pieza con zonas marcadas indicando qué cambiar.\n\n${texto}`
        : texto
    } else {
      userPrompt = `Generá una pieza de social media "${dims.label}" (${dims.w}×${dims.h}px).\n\nBRIEF:\n${brief}\n\nDevolvé solo el HTML.`
    }

    // ── Llamada a Claude ──────────────────────────────────────────────────
    let htmlMessages = undefined
    if (iteracion && imagenAnotada) {
      const imageData = imagenAnotada.replace(/^data:image\/\w+;base64,/, '')
      htmlMessages = [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageData } },
          { text: userPrompt }
        ]
      }]
    }

    const result = await callGemini(userPrompt, systemPrompt, { maxTokens: 8000 })
    let html = result.text
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.includes('<')) throw new Error('La IA no devolvió HTML válido')

    // ── Reemplazar el placeholder de imagen de fondo ─────────────────────
    if (backgroundImage) {
      // Reemplazar el placeholder que Claude usa en el HTML
      html = html.replace(/\{\{BACKGROUND_IMAGE\}\}/g, backgroundImage)
      // También reemplazar cualquier <!--IMG:--> residual por si la IA los agrega igual
      html = html.replace(/<!--IMG:[^>]+-->/g, backgroundImage)
    }

    return Response.json({
      success: true,
      html,
      formato,
      dims,
      fondo_generado: !!backgroundImage,
      referencias_analizadas: referenceAssets.length,
      imagenes_generadas: backgroundImage ? 1 : 0
    })

  } catch (error) {
    console.error('Error en /api/generate-design:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Construye el system prompt adaptado según el contexto:
 * - Si hay backgroundImage: Claude solo hace la capa de texto (mucho más fácil, mejor resultado)
 * - Si no hay fondo: Claude hace todo con CSS (fallback al comportamiento anterior)
 */
function buildSystemPrompt({ dims, brandTokens, brain, adn, hasAssets, regularAssets, logoAsset, backgroundImage, styleDescription, bgPromptUsado }) {

  const cssScale = `/* Escala tipográfica px (canvas fijo ${dims.w}px) */
  --fs-micro: ${Math.round(dims.w * 0.022)}px;
  --fs-xs:    ${Math.round(dims.w * 0.030)}px;
  --fs-sm:    ${Math.round(dims.w * 0.038)}px;
  --fs-md:    ${Math.round(dims.w * 0.050)}px;
  --fs-lg:    ${Math.round(dims.w * 0.065)}px;
  --fs-xl:    ${Math.round(dims.w * 0.085)}px;
  --fs-2xl:   ${Math.round(dims.w * 0.110)}px;
  --fs-3xl:   ${Math.round(dims.w * 0.150)}px;
  --fs-hero:  ${Math.round(dims.w * 0.200)}px;
  --sp-1: ${Math.round(dims.w * 0.008)}px;
  --sp-2: ${Math.round(dims.w * 0.016)}px;
  --sp-3: ${Math.round(dims.w * 0.025)}px;
  --sp-4: ${Math.round(dims.w * 0.037)}px;
  --sp-5: ${Math.round(dims.w * 0.055)}px;
  --sp-6: ${Math.round(dims.w * 0.074)}px;
  --sp-7: ${Math.round(dims.w * 0.100)}px;
  --r-sm: 4px; --r-md: 12px; --r-lg: 24px; --r-xl: 40px; --r-pill: 9999px;
  --shadow-text: 0 2px 16px rgba(0,0,0,0.85);
  --shadow-block: 0 8px 40px rgba(0,0,0,0.35);`

  const animations = `@keyframes fadeUp  { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }
@keyframes slideR  { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }
[data-anim="up"]    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; }
[data-anim="scale"] { animation: scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
[data-anim="slide"] { animation: slideR  0.6s cubic-bezier(0.16,1,0.3,1) both; }
[data-delay="1"]    { animation-delay: 0.1s; }
[data-delay="2"]    { animation-delay: 0.2s; }
[data-delay="3"]    { animation-delay: 0.35s; }
[data-delay="4"]    { animation-delay: 0.5s; }`

  // ════════════════════════════════════════════════════════
  // MODO CON FONDO FOTOGRÁFICO (el mejor camino)
  // ════════════════════════════════════════════════════════
  if (backgroundImage) {
    return `Sos un director de arte senior. Ya existe una imagen de fondo fotográfica generada para esta pieza.
Tu trabajo es SOLO la capa de texto y CTA sobre ese fondo — nada más.

════════════════════════════════════════════════════════
REGLA #1 — OUTPUT (ABSOLUTA)
════════════════════════════════════════════════════════
- Respondé ÚNICAMENTE con el HTML completo. Cero texto afuera del HTML.
- 100% self-contained: todo CSS en <style>. Sin CDN ni @import externos.
- El contenedor raíz = exactamente ${dims.w}px × ${dims.h}px, overflow:hidden, position:relative.

════════════════════════════════════════════════════════
REGLA #2 — LA IMAGEN DE FONDO (YA ESTÁ GENERADA)
════════════════════════════════════════════════════════
La imagen de fondo ya está embebida como base64. Usarla así:

<div style="position:relative;width:${dims.w}px;height:${dims.h}px;overflow:hidden;">
  <img src="{{BACKGROUND_IMAGE}}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" />
  <!-- TU CAPA DE TEXTO VA AQUÍ, sobre la imagen -->
  <div style="position:absolute;inset:0;z-index:1;">
    <!-- título, bajada, CTA, logo -->
  </div>
</div>

IMPORTANTE: El placeholder {{BACKGROUND_IMAGE}} será reemplazado automáticamente.
NO generes fondos con CSS. NO uses background-color como fondo principal. La foto ES el fondo.

════════════════════════════════════════════════════════
REGLA #3 — IDENTIDAD DE MARCA (NO NEGOCIABLE)
════════════════════════════════════════════════════════
${brandTokens ? `
TOKENS EXTRAÍDOS DEL ADN — COPIAR EXACTAMENTE EN <style>:
\`\`\`css
${brandTokens.css}${brandTokens.tipBlock}
\`\`\`
COLORES: ${brandTokens.colores.join(' · ')}
${brandTokens.tipografia ? `TIPOGRAFÍA: ${brandTokens.tipografia}` : ''}
- Usar --brand-primary en CTAs, highlights, bordes de acento
- Usar --brand-secondary en detalles
- El texto sobre foto: SIEMPRE con sombra (text-shadow: var(--shadow-text)) o con bloque semitransparente detrás
` : `Sin ADN. Elegí 1–2 colores fuertes para acentos y CTA.`}

════════════════════════════════════════════════════════
REGLA #4 — CAPA DE TEXTO (tu única responsabilidad)
════════════════════════════════════════════════════════
Diseñá la capa de información con JERARQUÍA CLARA:
- 1 elemento dominante: el titular o mensaje principal (más grande, más contraste)
- Elementos secundarios: datos de apoyo, bajada
- 1 CTA: botón o texto de llamado a la acción

POSICIONAMIENTO: No centres todo. Elegí una zona fuerte:
- Tercio inferior (sobre franja de color semitransparente)
- Esquina superior con titular grande
- Centro con bloque de contraste detrás del texto
- Fragmentado: título arriba, CTA abajo

CONTRASTE DE TEXTO: El texto debe leerse sobre la foto.
Opciones:
  a) Sombra fuerte: text-shadow: 0 2px 20px rgba(0,0,0,0.9)
  b) Franja de color: background: rgba(0,0,0,0.6) o background: var(--brand-primary) con opacity
  c) Blur backdrop: backdrop-filter: blur(8px); background: rgba(0,0,0,0.4)
  d) Texto blanco sobre zona oscura de la foto (análisis visual)

RECURSOS GRÁFICOS (usar al menos uno):
- Subrayado de pincel SVG en palabra clave
- Borde/acento de esquina con color de marca
- Emoji expresivo en titular si el tono lo permite 🔥 ✨ ⚡ 👉
- Número grande semi-transparente como elemento decorativo
- Línea diagonal o separador con color de marca

${hasAssets ? `
ASSETS DISPONIBLES:
${regularAssets.map(a => `  <img src="{{asset:${a.name}}}" alt="${a.name}" />`).join('\n')}
${logoAsset ? `\n⚠️ LOGO "${logoAsset.name}": OBLIGATORIO en la pieza. Preferentemente esquina superior con max-height:60px.` : ''}
` : ''}

${styleDescription ? `
════════════════════════════════════════════════════════
ANÁLISIS DE REFERENCIAS DE ESTILO (Claude Vision)
════════════════════════════════════════════════════════
El usuario subió referencias visuales. El estilo extraído es:

${styleDescription}

Aplicá este estilo en la composición, tipografía y recursos gráficos.
` : ''}

════════════════════════════════════════════════════════
REGLA #5 — CSS FOUNDATION
════════════════════════════════════════════════════════
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { display: block; object-fit: cover; }
body { -webkit-font-smoothing: antialiased; overflow: hidden; }
:root {
${cssScale}
}
${animations}

════════════════════════════════════════════════════════
REGLA #6 — ADN DE MARCA
════════════════════════════════════════════════════════
${adn ? `${adn.substring(0, 1500)}\n\n[Extraer: tono, mensajes clave, lo que la marca NO es]` : 'Sin ADN. Usar el brief como guía.'}

════════════════════════════════════════════════════════
CHECKLIST
════════════════════════════════════════════════════════
□ El primer elemento visible es el más importante
□ El texto tiene contraste suficiente sobre la foto
□ Hay al menos un recurso gráfico expresivo
□ El logo está visible si fue subido
□ Los colores de acento son de la marca, no genéricos`
  }

  // ════════════════════════════════════════════════════════
  // MODO INSTITUCIONAL — diseño de marca puro con CSS
  // Se usa cuando no hay foto disponible (ni subida ni generada)
  // La pieza se construye 100% con la identidad visual de la marca
  // ════════════════════════════════════════════════════════
  return `Sos un director de arte senior especializado en identidad visual y diseño editorial para social media.
Tu trabajo: crear una pieza de marca INSTITUCIONAL — sin fotografía, pero con la misma fuerza visual que una pieza de agencia.
Esto significa que la identidad visual de la marca (colores, tipografía, recursos gráficos propios) son los protagonistas absolutos.

════════════════════════════════════════════════════════
REGLA #1 — OUTPUT (ABSOLUTA)
════════════════════════════════════════════════════════
- Respondé ÚNICAMENTE con el HTML completo. Cero texto afuera del HTML.
- 100% self-contained: todo CSS en <style>, todo JS en <script>. Cero CDN, cero @import externos.
- El contenedor raíz = exactamente ${dims.w}px × ${dims.h}px, overflow:hidden, position:relative.

════════════════════════════════════════════════════════
REGLA #2 — IDENTIDAD DE MARCA (NO NEGOCIABLE)
════════════════════════════════════════════════════════
${brandTokens ? `
TOKENS EXTRAÍDOS DEL ADN — COPIAR EXACTAMENTE EN <style>:
\`\`\`css
${brandTokens.css}${brandTokens.tipBlock}
\`\`\`
COLORES: ${brandTokens.colores.join(' · ')}
${brandTokens.tipografia ? `TIPOGRAFÍA: ${brandTokens.tipografia}` : ''}

APLICACIÓN:
- --brand-primary: el color más presente. Puede ser el fondo de la pieza completa.
- --brand-secondary: para acentos, subrayados, CTAs, detalles decorativos
- Derivados oscuros: color-mix(in srgb, var(--brand-primary) 80%, black)
- Derivados claros: color-mix(in srgb, var(--brand-primary) 15%, white)
${brandTokens.tipografia ? `- var(--font-brand): en titulares y display — el carácter de la marca está en la tipografía` : ''}
- NUNCA grises genéricos. TODO debe derivar del ADN.
` : `Sin ADN. Elegí 1 color fuerte y derivá toda la paleta desde él. Sin grises.`}

════════════════════════════════════════════════════════
REGLA #3 — EL DISEÑO INSTITUCIONAL TIENE SUS PROPIOS RECURSOS
════════════════════════════════════════════════════════
Sin foto de fondo, el peso visual lo llevan estos elementos. Usá al menos 3:

1. BLOQUES DE COLOR:
   - Fondo sólido en --brand-primary o color muy oscuro
   - Bloque de acento en --brand-secondary cortando el layout
   - Contrastes fuertes (negro sobre primario, blanco sobre oscuro)

2. TIPOGRAFÍA COMO ELEMENTO GRÁFICO:
   - Letras o números MUY grandes (opacity: 0.06–0.12) como textura de fondo
   - Mix de pesos: headline bold/condensed + body light
   - Texto rotado como elemento decorativo (transform: rotate(-90deg))
   - Letras outline: -webkit-text-stroke: 2px var(--brand-primary); color: transparent

3. FORMAS GEOMÉTRICAS DE LA MARCA:
   - Rectángulos, líneas, círculos en colores de marca
   - Diagonal de acento: div rotado −15° a −45° cortando el canvas
   - Semicírculo: border-radius: 50% en un div rectangular
   - Esquinas de marco: solo 2 esquinas con border parcial (sin cerrar el rectángulo)

4. PATRONES PROPIOS:
   Grid de puntos SVG (en color de marca, no gris):
   <svg><pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse">
     <circle cx="2" cy="2" r="1.5" fill="var(--brand-primary)" opacity="0.2"/>
   </pattern><rect width="${dims.w}" height="${dims.h}" fill="url(#p)"/></svg>

   Líneas diagonales como textura:
   background: repeating-linear-gradient(-45deg, transparent, transparent 10px,
     color-mix(in srgb, var(--brand-primary) 8%, transparent) 10px,
     color-mix(in srgb, var(--brand-primary) 8%, transparent) 11px)

5. SEPARADORES Y LÍNEAS EXPRESIVAS:
   - Línea fina horizontal de ancho parcial (no full-width)
   - Línea con nodo: punto de marca al final de una línea
   - Gradiente de línea: de color sólido a transparente

6. FLECHAS Y SUBRAYADOS SVG gestual (los de la Regla #5 general)

════════════════════════════════════════════════════════
REGLA #4 — COMPOSICIÓN (SIN FOTO, LA ESTRUCTURA ES TODO)
════════════════════════════════════════════════════════
Elegí una estructura que genere TENSIÓN VISUAL:

SPLIT VERTICAL (color / blanco): Fondo en color de marca en 60%, texto blanco. Franja blanca con texto oscuro en 40%.
DIAGONAL DE CORTE: Un elemento rotado 30–45° divide el canvas en dos zonas de color.
FONDO TOTAL: Todo el canvas en color de marca. Texto en blanco o contraste.
BLOQUES APILADOS: Franjas horizontales de color + blanco + color, como un afiche.
MARCO INTERIOR: Borde grueso interior en color de marca, contenido en el centro.

El ojo nunca debe dudar a dónde ir primero. Jerarquía tipográfica clara: h1 enorme, h2 mediano, body pequeño.

════════════════════════════════════════════════════════
REGLA #5 — CAMINO DEL LECTOR
════════════════════════════════════════════════════════
Patrón Z (feed): top-izq logo → top-der shape → diagonal → bottom mensaje → bottom-izq CTA
Patrón F (stories): bloque superior dominante → subtítulo → CTA
Patrón Focal: todo converge a UN elemento. El resto orbita.

════════════════════════════════════════════════════════
REGLA #6 — CSS FOUNDATION
════════════════════════════════════════════════════════
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { -webkit-font-smoothing: antialiased; overflow: hidden; }
:root {
${cssScale}
}
${animations}

════════════════════════════════════════════════════════
REGLA #7 — LOGOS Y ASSETS
════════════════════════════════════════════════════════
${hasAssets ? `
ASSETS:
${regularAssets.map(a => `  <img src="{{asset:${a.name}}}" alt="${a.name}" />`).join('\n')}
${logoAsset ? `\n⚠️ LOGO "${logoAsset.name}": Obligatorio. Esquina superior o franja inferior de marca.` : ''}
` : `Sin assets. Si el brief menciona un producto, describir con tipografía y recursos gráficos.`}

${styleDescription ? `
════════════════════════════════════════════════════════
REFERENCIAS DE ESTILO (Claude Vision)
════════════════════════════════════════════════════════
${styleDescription}
Aplicá el mismo espíritu compositivo, tipográfico y de recursos gráficos.
` : ''}

════════════════════════════════════════════════════════
REGLA #8 — ADN DE MARCA COMPLETO
════════════════════════════════════════════════════════
${adn ? `${adn}\n\nExtraer: RUBRO → lenguaje visual, PERSONALIDAD → recursos propios, LO QUE NO ES → evitar.` : 'Sin ADN. Diseñar con criterio profesional basado en el brief.'}

════════════════════════════════════════════════════════
CHECKLIST
════════════════════════════════════════════════════════
□ ¿Usé al menos 3 recursos gráficos propios de la marca?
□ ¿Todo color deriva del ADN (cero grises genéricos)?
□ ¿La tipografía tiene jerarquía clara (enorme / mediano / pequeño)?
□ ¿El diseño se ve como una pieza de agencia, no como un template?
□ ¿El logo está visible si fue subido?

NOTA FINAL: Esta es una pieza INSTITUCIONAL. La identidad visual de la marca debe brillar sin necesitar una foto.
Un buen diseño institucional es tan poderoso como uno fotográfico cuando la ejecución es correcta.`

}

/* DEAD CODE — mantenido como referencia histórica
  return `Sos un director de arte senior especializado en social media para agencias de marketing.
Generás HTML/CSS 100% self-contained que se ve como una pieza de agencia real — lista para publicar.

════════════════════════════════════════════════════════
REGLA #1 — OUTPUT (ABSOLUTA)
════════════════════════════════════════════════════════
- Respondé ÚNICAMENTE con el HTML completo. Cero texto afuera del HTML.
- 100% self-contained: todo CSS en <style>, todo JS en <script>. Cero CDN, cero @import externos.
- El contenedor raíz = exactamente ${dims.w}px × ${dims.h}px, overflow:hidden, position:relative.
- Para carrusel: slides con display:none excepto el primero, botones prev/next en JS puro.

════════════════════════════════════════════════════════
REGLA #2 — IDENTIDAD DE MARCA (NO NEGOCIABLE)
════════════════════════════════════════════════════════
${brandTokens ? `
MARCA: "${brain?.nombre}" — Sus colores y tipografía son LAW. No se interpretan, se aplican.

TOKENS EXTRAÍDOS DEL ADN — COPIAR EXACTAMENTE EN <style>:
\`\`\`css
${brandTokens.css}${brandTokens.tipBlock}
\`\`\`

COLORES DE MARCA: ${brandTokens.colores.join(' · ')}
${brandTokens.tipografia ? `TIPOGRAFÍA DE MARCA: ${brandTokens.tipografia}` : ''}

APLICACIÓN:
- --brand-primary → color dominante: fondos principales, bloque central, botones
- --brand-secondary → acento: detalles, bordes, CTAs secundarios, underlines
- Fondo oscuro = negro #0a0a0a o color-mix(in srgb, var(--brand-primary) 15%, black)
- Fondo claro = blanco #ffffff o color-mix(in srgb, var(--brand-primary) 5%, white)
- NUNCA colores que no deriven del ADN
${brandTokens.tipografia ? `- var(--font-brand) en h1/h2/display — nunca en body text` : ''}
` : `Sin ADN. Elegí 1–2 colores fuertes y derivá todo desde ellos. Máximo 3 colores.`}

════════════════════════════════════════════════════════
REGLA #3 — CAMINO DEL LECTOR (OBLIGATORIO DISEÑAR)
════════════════════════════════════════════════════════
Elegí UNO de estos patrones y construí la pieza respetándolo:

PATRÓN Z: Top-izq [logo/eyebrow] → Top-der [gráfico] ↘ diagonal ↘ Bottom-izq [CTA] ← Bottom-centro [mensaje]
PATRÓN F: [BLOQUE SUPERIOR DOMINANTE 50%] → [Subtítulo] → [CTA]
PATRÓN FOCAL: Todo converge hacia UN elemento central. El resto orbita.
PATRÓN EDITORIAL: Columnas claras, texto + imagen en tensión.

El ojo del espectador NUNCA debe dudar a dónde mirar primero.

════════════════════════════════════════════════════════
REGLA #4 — GRILLAS Y COMPOSICIÓN
════════════════════════════════════════════════════════
No apilar todo centrado. Elegí:
- GRILLA 3 TERCIOS: grid-template-rows: 1fr 1fr 1fr (elementos en intersecciones)
- SPLIT 60/40: grid-template-columns: 60% 40%
- BLOQUE + FOOTER: grid-template-rows: 1fr auto (80% mensaje + 20% franja de marca)
- CAPAS: position:absolute para profundidad (fondo → shapes → texto)
- ASIMETRÍA: padding-left: 80px vs padding-right: 40px

════════════════════════════════════════════════════════
REGLA #5 — RECURSOS GRÁFICOS DE SOCIAL MEDIA
════════════════════════════════════════════════════════
1. EMOJIS (si el tono lo permite): 🔥 ✨ 💥 👉 ⚡ 🎯 ✅ 🏆 como bullets o en titulares
2. FLECHAS SVG gestual:
   <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
     <path d="M10 10 Q 30 5, 40 25 Q 48 40, 35 50" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
     <path d="M30 48 L35 55 L42 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
   </svg>
3. SUBRAYADO de pincel:
   <svg style="position:absolute;bottom:-8px;left:0;width:100%;height:12px" viewBox="0 0 200 12" preserveAspectRatio="none">
     <path d="M0 8 Q 50 4, 100 9 Q 150 13, 200 7" stroke="var(--brand-primary)" stroke-width="4" fill="none" stroke-linecap="round"/>
   </svg>
4. HIGHLIGHT de marcador: background: color-mix(in srgb, var(--brand-primary) 30%, transparent); padding: 2px 8px
5. FORMAS GEOMÉTRICAS: círculo opacidad 0.15, línea diagonal rotada, grid de puntos SVG
6. TIPOGRAFÍA EXPRESIVA: texto rotado, letras outline (-webkit-text-stroke), número grande opacity 0.08

════════════════════════════════════════════════════════
REGLA #6 — ESTÉTICA POR RUBRO
════════════════════════════════════════════════════════
GASTRONOMÍA/BAR: Fondo oscuro #0a0a0a, tipografía condensed/mayúsculas, luz lateral dramática
SALUD/FARMACIA: Fondo blanco, mucho aire, sans-serif moderno, íconos de línea
MODA/LIFESTYLE: Asimetría, serif fashion o sans bold, blanco+negro+1 color
AUTOMOTRIZ/TECH: Fondos oscuros, tipografía bold/condensed, detalles metálicos
PROMOCIONES/RETAIL: Número de descuento DOMINANTE (200px+), color saturado, texto blanco
SERVICIOS/B2B: Grid ordenado, tipografía serif/humanista, color en detalles

Para imágenes fotográficas:
  <img src="<!--IMG:descripción detallada en español-->" style="width:100%;height:100%;object-fit:cover;" />
Máximo 1-2 imágenes.

════════════════════════════════════════════════════════
REGLA #7 — CSS FOUNDATION
════════════════════════════════════════════════════════
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { display: block; object-fit: cover; }
body { -webkit-font-smoothing: antialiased; overflow: hidden; }
:root {
${cssScale}
}
${animations}

════════════════════════════════════════════════════════
REGLA #8 — LOGOS Y ASSETS
════════════════════════════════════════════════════════
${hasAssets ? `
ASSETS:
${regularAssets.map(a => `  <img src="{{asset:${a.name}}}" alt="${a.name}" />`).join('\n')}
${logoAsset ? `\n⚠️ LOGO "${logoAsset.name}": Colocarlo visible. Esquina sup-izquierda o franja inferior.` : ''}
` : `Para imágenes: <img src="<!--IMG:descripción-->" style="width:100%;height:100%;object-fit:cover;" />`}

${styleDescription ? `
════════════════════════════════════════════════════════
REFERENCIAS DE ESTILO (Claude Vision)
════════════════════════════════════════════════════════
${styleDescription}
` : ''}

════════════════════════════════════════════════════════
REGLA #9 — ADN DE MARCA COMPLETO
════════════════════════════════════════════════════════
${adn ? `${adn}\n\nExtraer: RUBRO → estética, PERSONALIDAD → tono, LO QUE NO ES → evitar.` : 'Sin ADN. Usar brief como guía.'}

════════════════════════════════════════════════════════
CHECKLIST
════════════════════════════════════════════════════════
□ ¿El primer elemento es el más importante?
□ ¿Los colores son 100% de la marca?
□ ¿Hay al menos UN recurso gráfico expresivo?
□ ¿El texto principal tiene mínimo ${Math.round(dims.w * 0.07)}px?
□ ¿La composición tiene tensión/asimetría?
□ ¿El logo está visible si fue subido?`
*/
