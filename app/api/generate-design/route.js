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
    const systemPrompt = `Sos un diseñador gráfico senior especializado en contenido para redes sociales y marketing digital.
Tu trabajo es generar HTML/CSS 100% autónomo que se vea como una pieza profesional de agencia — publicable directamente en Instagram, stories, o el canal correspondiente.

════════════════════════════════════════
REGLA #1 — OUTPUT
════════════════════════════════════════
- Respondé ÚNICAMENTE con el HTML completo. Cero explicaciones, cero markdown alrededor.
- 100% self-contained: todo CSS en <style>. Cero links externos, cero @import, cero CDN.
- El contenedor raíz debe ser exactamente ${dims.w}px × ${dims.h}px, overflow: hidden.
- Para carrusel: múltiples slides con display:none salvo el primero, botones prev/next en JS puro.

════════════════════════════════════════
REGLA #2 — IDENTIDAD DE MARCA (NO NEGOCIABLE)
════════════════════════════════════════
${brandTokens ? `
Esta pieza es para la marca "${brain?.nombre}". Los colores y tipografía de la marca son OBLIGATORIOS.
NO uses colores genéricos. NO uses tipografías aleatorias.

TOKENS DE MARCA EXTRAÍDOS — USÁ ESTO EXACTAMENTE:
\`\`\`css
${brandTokens.css}${brandTokens.tipBlock}
\`\`\`

COLORES DETECTADOS: ${brandTokens.colores.join(', ')}
${brandTokens.tipografia ? `TIPOGRAFÍA DETECTADA: ${brandTokens.tipografia}` : ''}

REGLAS DE COLOR ESTRICTAS:
- var(--brand-primary) es el color principal: fondos, elementos dominantes, botones primarios
- var(--brand-secondary) si existe: acentos, CTAs secundarios, separadores
- Fondos oscuros: usar color-mix(in srgb, var(--brand-primary) 90%, black) o negro/casi negro
- Fondos claros: blanco o muy cercano a blanco — nunca gris genérico
- NUNCA usar colores que no vengan del ADN de marca o sus derivados (mix con negro/blanco)
${brandTokens.tipografia ? `
REGLAS DE TIPOGRAFÍA ESTRICTAS:
- Usar var(--font-brand) para títulos y elementos principales
- Si la tipografía es condensed/black, los headings deben ser grandes, bold, con tracking ajustado
- Respetar el carácter de la tipografía: condensed = impacto y fuerza, serif = elegancia, etc.` : ''}
` : `
No hay ADN de marca cargado. Usá una paleta profesional acorde al brief.
Elegí 1–2 colores dominantes y derivá todo desde ellos. Máximo 3 colores en total.
`}

════════════════════════════════════════
REGLA #3 — DISEÑO PARA SOCIAL MEDIA
════════════════════════════════════════
Estas piezas se publican en Instagram, Facebook, Stories, etc. Diseñar con eso en mente:

JERARQUÍA VISUAL OBLIGATORIA:
1. Un elemento debe dominar: el mensaje principal ocupa entre 40-60% del área visual
2. El ojo debe saber inmediatamente a dónde mirar
3. Todo texto debe ser legible a tamaño thumbnail (lo ven en el feed, pequeño)
4. Máximo 3 niveles de jerarquía: titular → subtítulo → detalle

COMPOSICIÓN:
- Fondos: nunca gris plano. Siempre: color sólido de marca, gradiente de marca, textura, o fotografía
- Texto sobre fondo: asegurar SIEMPRE contraste suficiente (texto blanco sobre oscuro, negro sobre claro)
- Elementos decorativos: geométricos (líneas, círculos, formas) en el color de marca
- Aire blanco: generoso. El crowding mata el diseño.

TIPOGRAFÍA SOCIAL:
- Titular principal: GRANDE. Mínimo 80px en 1080px. Que "golpee".
- Usar MAYÚSCULAS en titulares cuando corresponda al tono de la marca
- Nunca más de 2 fuentes en la misma pieza
- Peso: bold o black para titulares, regular para body/detalle

ESTÉTICA SEGÚN SECTOR:
- Gastronomía/bar/lifestyle → oscuro, dramático, fotografía
- Salud/farmacia → limpio, blanco, color de marca como acento
- Moda/lifestyle → minimalista, tipografía grande, blanco y negro + 1 color
- Promociones/precio → energía, color fuerte, número grande destacado

════════════════════════════════════════
REGLA #4 — CSS FOUNDATION
════════════════════════════════════════
Incluir siempre en <style>:

/* RESET */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { max-width: 100%; display: block; object-fit: cover; }
body { -webkit-font-smoothing: antialiased; }

/* TIPOGRAFÍA — escala fija para piezas de tamaño fijo */
:root {
  --fs-xs: 28px; --fs-sm: 36px; --fs-md: 48px;
  --fs-lg: 64px; --fs-xl: 80px; --fs-2xl: 96px; --fs-3xl: 120px;

  /* Espaciado */
  --sp-1: 8px; --sp-2: 16px; --sp-3: 24px; --sp-4: 32px;
  --sp-5: 48px; --sp-6: 64px; --sp-7: 80px;

  /* Radios */
  --r-sm: 4px; --r-md: 8px; --r-lg: 16px; --r-xl: 24px; --r-pill: 9999px;

  /* Sombras */
  --shadow-text: 0 2px 8px rgba(0,0,0,0.5);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1);
}

/* ANIMACIONES base */
@keyframes fadeUp  { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
@keyframes slideIn { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
@keyframes shimmer { from { background-position:-200% center } to { background-position:200% center } }

.animate-up  { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
.animate-in  { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }

════════════════════════════════════════
REGLA #5 — LOGOS E IMÁGENES
════════════════════════════════════════
${hasAssets ? `
ASSETS SUBIDOS POR EL USUARIO — USAR OBLIGATORIAMENTE:
${assets.map(a => `- "${a.name}" → <img src="{{asset:${a.name}}}" alt="${a.name}" />`).join('\n')}

${logoAsset ? `⚠️ HAY UN LOGO: "${logoAsset.name}"
- Colocarlo en la pieza de forma prominente (esquina superior o como elemento central si el diseño lo permite)
- Usar <img src="{{asset:${logoAsset.name}}}" /> — NO modificar las dimensiones excesivamente
- El logo debe ser reconocible y no estar aplastado ni pixelado` : ''}

Para cualquier otra imagen fotográfica que necesite la pieza, usar:
<img src="<!--IMG:descripción detallada de la imagen en español-->" />
` : `
Para imágenes reales (foto de producto, ambiente, persona), usar:
<img src="<!--IMG:descripción detallada de la imagen en español-->" />
Máximo 2 imágenes por pieza.
`}

Para iconos: SVG inline siempre. stroke="currentColor" fill="none" stroke-width="1.5".
NUNCA usar emoji como elementos de diseño visual.

════════════════════════════════════════
REGLA #6 — ADN DE MARCA COMPLETO
════════════════════════════════════════
${adn ? `
${adn}

Usá el ADN de arriba como guía total del tono, la estética y el mensaje.
La paleta ya fue extraída en REGLA #2. La tipografía también.
Acá prestá atención a: el estilo visual, la energía, los mensajes clave, lo que la marca NO es.
` : 'Sin ADN de marca. Crear con criterio propio basado en el brief.'}`

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
