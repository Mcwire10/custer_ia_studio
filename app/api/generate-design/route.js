/**
 * POST /api/generate-design
 * Flujo:
 * 1. Extrae colores/tipografía del ADN de marca programáticamente
 * 2. IA genera HTML/CSS con los tokens de marca inyectados como CSS real
 * 3. Placeholders <!--IMG:--> se resuelven con web search + gpt-image-1
 * 4. Assets {{asset:nombre}} se reemplazan en el frontend
 */

import { getCurrentUser } from '@/lib/auth'
import { getADNMarca } from '@/lib/cerebro'
import { callGemini, generateImage } from '@/lib/gemini'

const FORMATOS = {
  'placa-feed':   { w: 1080, h: 1080, label: 'Placa Feed (1:1)' },
  'stories':      { w: 1080, h: 1920, label: 'Stories (9:16)' },
  'banner-email': { w: 600,  h: 200,  label: 'Banner Email' },
  'carrusel':     { w: 1080, h: 1080, label: 'Carrusel (múltiples slides)' },
  'flyer':        { w: 800,  h: 1200, label: 'Flyer vertical' },
}

/**
 * Extrae colores hex del texto del ADN (busca patrones #RRGGBB o #RGB)
 */
function extraerColoresDeMarca(adnText) {
  if (!adnText) return []
  const matches = adnText.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g) || []
  // Deduplicar y normalizar a uppercase
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
 * Construye los CSS tokens reales de marca para inyectar en el prompt
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
    // Derivar oscuro y claro del primario para uso en fondos y textos
    css += `  --brand-primary-dark: color-mix(in srgb, ${primary} 75%, black);\n`
    css += `  --brand-primary-light: color-mix(in srgb, ${primary} 20%, white);\n`
  }
  css += `}\n`

  let tipBlock = ''
  if (tipografia) {
    tipBlock = `\n/* ═══ TIPOGRAFÍA DE MARCA ═══ */\n/* Tipografía principal: ${tipografia} */\n/* Mapear a font-family equivalente del sistema o usar como referencia */\n`

    // Mapear tipografías conocidas a stacks del sistema
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
 * Busca imagen en internet usando Gemini con Google Search.
 */
async function buscarImagenProducto(descripcion) {
  const { callGeminiWithSearch } = await import('@/lib/gemini')
  const prompt = `Buscá una imagen PNG o JPG de "${descripcion}" en internet.
Necesito la URL directa de la imagen (preferentemente en fondo blanco o transparente).
Devolvé SOLO la URL de la imagen. Si no encontrás nada válido, devolvé "NO_ENCONTRADA".`
  try {
    const result = await callGeminiWithSearch(prompt, null, { maxTokens: 300 })
    const urlMatch = result.text.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?/i)
    return urlMatch ? urlMatch[0] : null
  } catch (e) {
    return null
  }
}

/**
 * Descarga imagen y la convierte a base64
 */
async function urlABase64(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error('No se pudo descargar la imagen')
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/png'
  return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
}

/**
 * Obtiene imagen: web search primero, gpt-image-1 como fallback
 */
async function obtenerImagen(descripcion, openaiKey) {
  try {
    const url = await buscarImagenProducto(descripcion)
    if (url) {
      const base64 = await urlABase64(url)
      return { base64, fuente: 'web' }
    }
  } catch (e) {
    console.warn('[generate-design] búsqueda web falló:', e.message)
  }
  if (openaiKey) {
    try {
      const base64 = await generateImage(descripcion)
      return { base64, fuente: 'generada' }
    } catch (e) {
      console.warn('[generate-design] gpt-image-1 falló:', e.message)
    }
  }
  return null
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const { brief, formato = 'placa-feed', brain, iteracion = null, imagenAnotada = null, assets = [] } = await request.json()

    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const openaiKey = process.env.OPENAI_API_KEY
    const dims = FORMATOS[formato] || FORMATOS['placa-feed']
    const adn = getADNMarca(brain?.nombre)

    // ── Extraer tokens de marca del ADN ──────────────────────────────
    const brandTokens = buildBrandTokens(adn)
    const hasBrand = !!brain?.nombre

    // ── Assets disponibles ───────────────────────────────────────────
    const hasAssets = assets && assets.length > 0
    const logoAsset = hasAssets ? assets.find(a =>
      a.name?.toLowerCase().includes('logo') ||
      a.fileName?.toLowerCase().includes('logo')
    ) : null

    // ── System Prompt ────────────────────────────────────────────────
    const systemPrompt = `Sos un director de arte senior especializado en social media para agencias de marketing.
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
Antes de escribir código, elegí UNO de estos patrones de lectura y construí la pieza respetándolo:

PATRÓN Z (feed cuadrado, impacto directo):
  Top-izquierda [logo/eyebrow] → Top-derecha [elemento gráfico]
       ↘ diagonal ↘
  Bottom-izquierda [CTA] ← Bottom-centro [mensaje principal]
  → Ideal para: promociones, ofertas, noticias de marca

PATRÓN F (stories/vertical, info jerárquica):
  [BLOQUE SUPERIOR DOMINANTE — 50% del canvas]
  [Subtítulo o dato secundario]
  [CTA o detalle final]
  → Ideal para: contenido educativo, how-to, info de producto

PATRÓN FOCAL (cualquier formato, máximo impacto):
  Todo converge hacia UN elemento central (número grande, palabra clave, imagen)
  El resto orbita alrededor
  → Ideal para: lanzamientos, frases de marca, momentos emocionales

PATRÓN EDITORIAL (grilla visible, contenido rico):
  Columnas claras, texto + imagen en tensión
  → Ideal para: carruseles, contenido de valor, marcas premium

REGLA: El ojo del espectador NUNCA debe dudar a dónde mirar primero.
El elemento más importante ocupa el mayor espacio visual o tiene el mayor contraste.

════════════════════════════════════════════════════════
REGLA #4 — GRILLAS Y COMPOSICIÓN
════════════════════════════════════════════════════════
Usá CSS Grid o posicionamiento absoluto para crear composiciones con TENSIÓN VISUAL.
No apilar todo centrado verticalmente. Elegí una de estas estructuras:

GRILLA 3 TERCIOS (rule of thirds):
  display: grid; grid-template-rows: 1fr 1fr 1fr; /* o columns */
  → Elementos en intersecciones de los tercios, no en el centro exacto

SPLIT 60/40:
  display: grid; grid-template-columns: 60% 40%; /* o rows */
  → Un lado con imagen/color de fondo, otro con texto sobre contraste

BLOQUE DOMINANTE + FOOTER:
  display: grid; grid-template-rows: 1fr auto;
  → 80% del canvas = mensaje/imagen, 20% = franja de marca en color sólido

CAPAS (posicionamiento absoluto):
  position: absolute; → Elementos superpuestos para profundidad
  → Fondo (imagen/color) → Capa media (shapes) → Frente (texto)

ASIMETRÍA INTENCIONAL:
  padding-left: 80px; /* padding-right: 40px */
  → Texto no centrado crea dinamismo y modernidad

════════════════════════════════════════════════════════
REGLA #5 — RECURSOS GRÁFICOS DE SOCIAL MEDIA
════════════════════════════════════════════════════════
Estas piezas viven en Instagram/Facebook/TikTok. Usar los recursos visuales del lenguaje nativo:

1. EMOJIS Y CARACTERES EXPRESIVOS (usar cuando el tono de marca lo permita):
   - En titulares para añadir emoción: 🔥 ✨ 💥 👉 ⚡ 🎯 💡 ✅ 🏆
   - Como bullet points en listas: ✦ ◆ → ▸ ●
   - Font-size: igual al texto circundante. Position: inline.

2. FLECHAS SVG (inline, dibujadas a mano — estilo gestuales):
   Flecha curva descendente:
   <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
     <path d="M10 10 Q 30 5, 40 25 Q 48 40, 35 50" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
     <path d="M30 48 L35 55 L42 48" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
   </svg>

   Flecha recta con cuerpo:
   <svg width="80" height="24" viewBox="0 0 80 24" fill="currentColor">
     <path d="M0 10 H60 L48 2 M60 12 L48 22" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
   </svg>

3. SUBRAYADOS Y HIGHLIGHTS (sobre texto clave):
   Subrayado de pincel (orgánico, gestual):
   <svg style="position:absolute;bottom:-8px;left:0;width:100%;height:12px" viewBox="0 0 200 12" preserveAspectRatio="none">
     <path d="M0 8 Q 50 4, 100 9 Q 150 13, 200 7" stroke="var(--brand-primary)" stroke-width="4" fill="none" stroke-linecap="round"/>
   </svg>

   Highlight de marcador (rectángulo semitransparente detrás del texto):
   background: color-mix(in srgb, var(--brand-primary) 30%, transparent);
   padding: 2px 8px; display: inline;

4. FORMAS GEOMÉTRICAS DECORATIVAS:
   Círculo de acento: border-radius:50%; background:var(--brand-primary); opacity:0.15;
   Línea diagonal: transform: rotate(-15deg); height:3px; background:var(--brand-secondary);
   Punto de grid: width:6px; height:6px; border-radius:50%; background:currentColor; opacity:0.4;

   Grid de puntos (textura decorativa):
   <svg width="120" height="120" viewBox="0 0 120 120">
     <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
       <circle cx="2" cy="2" r="2" fill="currentColor" opacity="0.3"/>
     </pattern>
     <rect width="120" height="120" fill="url(#dots)"/>
   </svg>

5. MARCOS Y BORDES EXPRESIVOS:
   Borde de esquina (solo esquinas, no marco completo):
   Implementar con ::before y ::after posicionados en absolute
   border-top: 3px solid var(--brand-primary); border-left: 3px solid var(--brand-primary);
   width:40px; height:40px; → en cada esquina

   Línea separadora con acento:
   border-bottom: 2px solid var(--brand-primary); width: 60px; /* no full-width */

6. TIPOGRAFÍA EXPRESIVA:
   - Mix de pesos en la misma línea: <span style="font-weight:900">PALABRA</span> normal
   - Texto rotado como elemento decorativo: transform: rotate(-90deg); writing-mode: vertical-lr;
   - Letras outline: -webkit-text-stroke: 2px var(--brand-primary); color: transparent;
   - Número grande como elemento gráfico: font-size:200px; opacity:0.08; position:absolute;

════════════════════════════════════════════════════════
REGLA #6 — ESTÉTICA POR RUBRO (leer el ADN para detectar cuál aplica)
════════════════════════════════════════════════════════
GASTRONOMÍA / BAR / BEBIDAS:
  → Fondo muy oscuro (#0a0a0a o negro profundo)
  → Tipografía condensed o serif clásica, MAYÚSCULAS
  → Color de marca como bloque de acento (no como fondo)
  → Fotografía dramática con luz lateral si hay imagen
  → Texturas: grano, ruido, líneas finas
  → Energía: nocturna, sofisticada, directa

SALUD / FARMACIA / BIENESTAR:
  → Fondo blanco o muy claro
  → Color de marca como acento limpio
  → Tipografía sans-serif moderna, legible
  → Mucho aire blanco (60%+ del canvas)
  → Íconos de línea (no rellenos)
  → Energía: confianza, claridad, cuidado

MODA / LIFESTYLE / ESTÉTICA:
  → Asimetría y tensión compositiva
  → Tipografía con personalidad (serif fashion o sans bold)
  → Blanco y negro + 1 color como regla de 3
  → Fotografía en primer plano
  → Energía: aspiracional, editorial, silencioso

AUTOMOTRIZ / TECNOLOGÍA:
  → Fondos oscuros con degradés sutiles
  → Tipografía bold/condensed, precisión
  → Detalles metálicos (gradientes plateados o grises)
  → Energía: potencia, innovación, precisión

PROMOCIONES / RETAIL / OFERTAS:
  → Número de descuento como elemento DOMINANTE (200px+)
  → Color de marca saturado como fondo
  → Texto blanco sobre color o negro sobre blanco
  → Urgencia sin caos: jerarquía clara
  → Energía: impacto, acción, ahora

SERVICIOS / PROFESIONAL / B2B:
  → Grid ordenado, mucho espacio
  → Tipografía serif o humanista
  → Color de marca en detalles, no en masas
  → Energía: confianza, expertise, orden

════════════════════════════════════════════════════════
REGLA #7 — CSS FOUNDATION (incluir siempre)
════════════════════════════════════════════════════════
/* RESET */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { display: block; object-fit: cover; }
body { -webkit-font-smoothing: antialiased; overflow: hidden; }

:root {
  /* Escala tipográfica px (canvas fijo ${dims.w}px) */
  --fs-micro: ${Math.round(dims.w * 0.022)}px;
  --fs-xs:    ${Math.round(dims.w * 0.030)}px;
  --fs-sm:    ${Math.round(dims.w * 0.038)}px;
  --fs-md:    ${Math.round(dims.w * 0.050)}px;
  --fs-lg:    ${Math.round(dims.w * 0.065)}px;
  --fs-xl:    ${Math.round(dims.w * 0.085)}px;
  --fs-2xl:   ${Math.round(dims.w * 0.110)}px;
  --fs-3xl:   ${Math.round(dims.w * 0.150)}px;
  --fs-hero:  ${Math.round(dims.w * 0.200)}px;

  /* Espaciado */
  --sp-1: ${Math.round(dims.w * 0.008)}px;
  --sp-2: ${Math.round(dims.w * 0.016)}px;
  --sp-3: ${Math.round(dims.w * 0.025)}px;
  --sp-4: ${Math.round(dims.w * 0.037)}px;
  --sp-5: ${Math.round(dims.w * 0.055)}px;
  --sp-6: ${Math.round(dims.w * 0.074)}px;
  --sp-7: ${Math.round(dims.w * 0.100)}px;

  /* Radios */
  --r-sm: 4px; --r-md: 12px; --r-lg: 24px; --r-xl: 40px; --r-pill: 9999px;

  /* Sombras */
  --shadow-text: 0 2px 12px rgba(0,0,0,0.6);
  --shadow-block: 0 8px 40px rgba(0,0,0,0.25);
}

/* Animaciones */
@keyframes fadeUp  { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }
@keyframes slideR  { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:translateX(0) } }
@keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }

[data-anim="up"]    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; }
[data-anim="scale"] { animation: scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
[data-anim="slide"] { animation: slideR  0.6s cubic-bezier(0.16,1,0.3,1) both; }
[data-delay="1"]    { animation-delay: 0.1s; }
[data-delay="2"]    { animation-delay: 0.2s; }
[data-delay="3"]    { animation-delay: 0.35s; }
[data-delay="4"]    { animation-delay: 0.5s; }

════════════════════════════════════════════════════════
REGLA #8 — LOGOS Y ASSETS
════════════════════════════════════════════════════════
${hasAssets ? `
ASSETS DISPONIBLES — USAR EN EL HTML:
${assets.map(a => `  <img src="{{asset:${a.name}}}" alt="${a.name}" />`).join('\n')}

${logoAsset ? `
⚠️ LOGO DETECTADO: "${logoAsset.name}"
OBLIGATORIO: Colocarlo en la pieza. Opciones:
  a) Esquina superior izquierda (más común en social): position:absolute; top:var(--sp-4); left:var(--sp-4); max-height:60px; width:auto;
  b) Franja inferior de marca: dentro del footer de color, centrado o alineado a la izquierda
  c) Como elemento central si la pieza es de branding puro
Nunca: aplastado, pixelado, o escondido en un rincón de 20px.
` : ''}
Para imágenes fotográficas adicionales:
  <img src="<!--IMG:descripción detallada de la imagen-->" style="width:100%;height:100%;object-fit:cover;" />
` : `
Para imágenes fotográficas:
  <img src="<!--IMG:descripción detallada en español-->" style="width:100%;height:100%;object-fit:cover;" />
Máximo 1-2 imágenes.`}

SVG inline para íconos y elementos gráficos — NUNCA imágenes externas para decoración.
Los emojis están PERMITIDOS cuando el ADN de marca lo avala (tono informal, joven, expresivo).

════════════════════════════════════════════════════════
REGLA #9 — ADN DE MARCA COMPLETO
════════════════════════════════════════════════════════
${adn ? `
${adn}

INSTRUCCIÓN: Leer el ADN completo y extraer:
1. El RUBRO → aplicar estética del rubro (Regla #6)
2. La PERSONALIDAD → determinar si el tono pide emojis, mayúsculas, recursos gestuales
3. LO QUE NO ES → evitar esos elementos aunque "queden bien" en abstracto
4. Los MENSAJES CLAVE → usarlos como inspiración para el copy de la pieza
La paleta ya está en Regla #2. La tipografía también. Acá: tono, estética, mensajes.
` : 'Sin ADN. Crear con criterio profesional basado en el brief y el formato.'}

════════════════════════════════════════════════════════
REGLA #10 — CHECKLIST ANTES DE ENTREGAR
════════════════════════════════════════════════════════
Antes de cerrar el HTML, verificar mentalmente:
□ ¿El primer elemento que ves es el más importante?
□ ¿Los colores son 100% de la marca (no grises genéricos)?
□ ¿Hay al menos UN recurso gráfico expressivo (flecha, underline, shape, emoji, número grande)?
□ ¿El texto más importante tiene mínimo ${Math.round(dims.w * 0.07)}px?
□ ¿La composición tiene tensión/asimetría (no todo centrado)?
□ ¿El logo está visible si fue subido?
□ ¿Hay contraste suficiente texto/fondo?
□ ¿Se puede leer en thumbnail (80×80px mental)?`

    // ── User Prompt ───────────────────────────────────────────────────
    let userPrompt
    if (iteracion) {
      const texto = `HTML actual:\n\n${iteracion}\n\nCambio solicitado: ${brief}\n\nDevolvé el HTML completo actualizado.`
      if (imagenAnotada) {
        // Gemini recibe la imagen como parte del mensaje
        userPrompt = `Esta imagen muestra la pieza con zonas marcadas indicando qué cambiar.\n\n${texto}`
      } else {
        userPrompt = texto
      }
    } else {
      userPrompt = `Generá una pieza de social media "${dims.label}" (${dims.w}×${dims.h}px).\n\nBRIEF:\n${brief}\n\nDevolvé solo el HTML.`
    }

    // ── Llamada a la IA ───────────────────────────────────────────────
    const messages = []
    if (iteracion && imagenAnotada) {
      // Si hay imagen anotada, enviarla como vision
      const imageData = imagenAnotada.replace(/^data:image\/\w+;base64,/, '')
      messages.push({
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: imageData } },
          { text: userPrompt }
        ]
      })
    }

    const result = await callGemini(userPrompt, systemPrompt, { maxTokens: 8000 })
    let html = result.text
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.includes('<')) throw new Error('La IA no devolvió HTML válido')

    // ── Resolver placeholders de imágenes ─────────────────────────────
    const placeholders = [...html.matchAll(/<!--IMG:([^>]+)-->/g)]

    if (placeholders.length > 0) {
      const imagenes = await Promise.allSettled(
        placeholders.map(([, desc]) => obtenerImagen(desc.trim(), openaiKey))
      )

      const resumen = []
      placeholders.forEach(([match], i) => {
        const resultado = imagenes[i]
        if (resultado.status === 'fulfilled' && resultado.value) {
          html = html.replace(`src="${match}"`, `src="${resultado.value.base64}"`)
          html = html.replace(match, resultado.value.base64)
          resumen.push({ desc: placeholders[i][1], fuente: resultado.value.fuente })
        } else {
          const svgFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23555' font-size='18' font-family='sans-serif'%3EImagen%3C/text%3E%3C/svg%3E`
          html = html.replace(`src="${match}"`, `src="${svgFallback}"`)
          html = html.replace(match, svgFallback)
          resumen.push({ desc: placeholders[i][1], fuente: 'fallback' })
        }
      })

      return Response.json({ success: true, html, formato, dims, imagenes: resumen })
    }

    return Response.json({ success: true, html, formato, dims, imagenes_generadas: 0 })

  } catch (error) {
    console.error('Error en /api/generate-design:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
