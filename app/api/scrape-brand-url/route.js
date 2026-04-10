/**
 * POST /api/scrape-brand-url
 * Extrae TODOS los campos del Brain desde una URL de sitio web
 * Claude lee el HTML completo y devuelve el objeto brand estructurado
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Prompt para extraer todos los campos del Brain desde contenido web
const BRAND_EXTRACTION_PROMPT = `Eres un estratega de marca senior. Tu tarea es analizar el contenido de un sitio web y extraer toda la información posible para completar un Brand Brain.

Analiza el contenido HTML, meta tags, colores CSS, tipografías y texto, y devuelve un JSON estructurado con TODOS los campos que puedas inferir.

IMPORTANTE:
- Si un campo no se puede inferir con certeza, dejarlo null (no inventes datos)
- Para colores: prioriza los que encuentres en CSS (background-color, color, border-color). Devuélvelos en formato HEX (#RRGGBB)
- Para tipografías: busca font-family en CSS y Google Fonts en <link> tags
- Para tono/voz: inferir del lenguaje usado en el sitio (formal/informal, técnico/simple, etc.)
- Para audiencia: inferir del producto/servicio y lenguaje del sitio
- Para rubro: inferir del tipo de negocio

Devuelve SOLO este JSON sin markdown ni explicaciones:

{
  "basico": {
    "nombre": "nombre comercial de la marca (del title, h1 o og:site_name)",
    "rubro": "sector o industria (ej: Agencia de Marketing Digital)",
    "ciudad": "ciudad o país si se menciona",
    "propuesta": "propuesta de valor principal (del h1 o hero text)"
  },
  "estrategico": {
    "mision": "misión si se menciona explícitamente",
    "vision": "visión si se menciona",
    "valores": ["valor1", "valor2", "valor3"],
    "beneficios_funcionales": "qué hace / funcionalidades clave",
    "beneficios_emocionales": "cómo hace sentir al cliente"
  },
  "audiencia": {
    "publico_objetivo": "a quién va dirigido (demografía, perfil)",
    "audiencia_real": "quién realmente compra (si se puede inferir)",
    "pain_points": ["problema1", "problema2"],
    "gains": ["beneficio1", "beneficio2"],
    "motivaciones": "qué motiva a la audiencia a elegir esta marca",
    "comportamiento_digital": "cómo consume contenido digital este público"
  },
  "identidad": {
    "voz_tono": "cómo habla la marca (formal, amigable, experto, cercano, etc.)",
    "claim": "tagline o claim si aparece en el sitio",
    "narrativa": "historia o narrativa de la marca si se menciona",
    "territorio_creativo": "universo visual y conceptual de la marca"
  },
  "visual": {
    "tipografia": "tipografía principal detectada en CSS/Google Fonts",
    "colores": {
      "primario": "#RRGGBB — color dominante del sitio",
      "secundario": "#RRGGBB — segundo color más usado",
      "acentos": ["#RRGGBB"]
    },
    "estilo_visual": "estilo del diseño (minimalista, bold, corporativo, etc.)",
    "recursos_graficos": "elementos visuales usados (iconos, ilustraciones, fotografía, etc.)",
    "sistema_grafico": "descripción del sistema visual del sitio",
    "mood_board": "palabras que describen el mood visual (ej: oscuro, premium, elegante)"
  },
  "posicionamiento": {
    "competencia": ["competidor1", "competidor2"],
    "diferenciadores": ["qué los hace únicos"],
    "propuesta_unica": "UVP — propuesta única de valor"
  },
  "implementacion": {
    "canales": ["Instagram", "LinkedIn", "Email"],
    "formatos": ["Reels", "Carrusel", "Stories"],
    "frecuencia": "frecuencia de publicación si se menciona"
  },
  "comunicacion": {
    "keywords": ["palabra clave1", "palabra clave2"],
    "avoid": ["qué evitar en la comunicación"],
    "tonalidad": ["característica tonal 1", "característica tonal 2"],
    "ejemplos": "ejemplo de copy o frase del sitio que refleje el estilo"
  }
}`

export async function POST(request) {
  try {
    // Aceptar tanto JSON como FormData
    let url
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      url = body.url
    } else {
      const formData = await request.formData()
      url = formData.get('url')
    }

    if (!url) {
      return Response.json({ error: 'URL es requerida' }, { status: 400 })
    }

    // Normalizar URL
    if (!url.startsWith('http')) url = 'https://' + url

    try {
      new URL(url)
    } catch {
      return Response.json({ error: 'URL no válida' }, { status: 400 })
    }

    console.log(`📡 Analizando sitio web: ${url}`)

    // Fetch del HTML con timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let html = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
        },
        signal: controller.signal
      })
      clearTimeout(timeout)
      html = await response.text()
    } catch (fetchError) {
      clearTimeout(timeout)
      if (fetchError.name === 'AbortError') {
        return Response.json({ error: 'El sitio tardó demasiado en responder (timeout 15s)' }, { status: 408 })
      }
      throw fetchError
    }

    // Extraer contenido relevante del HTML
    const extractedContent = extractWebContent(html, url)

    console.log(`📊 Contenido extraído: ${extractedContent.length} chars`)

    // Enviar a Claude para extraer campos del Brain
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      system: BRAND_EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analiza este sitio web y extrae toda la información de marca posible.\n\nURL: ${url}\n\n${extractedContent}`
        }
      ]
    })

    let responseText = message.content[0].text.trim()

    // Limpiar markdown si existe
    responseText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let brand
    try {
      brand = JSON.parse(responseText)
    } catch (parseError) {
      // Si falla el parse, intentar extraer JSON del texto
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        brand = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Claude no devolvió JSON válido')
      }
    }

    console.log(`✅ Marca extraída: ${brand?.basico?.nombre || url}`)

    return Response.json({
      success: true,
      brand,
      url,
      // También devolver content para compatibilidad con flujo anterior
      content: extractedContent
    })

  } catch (error) {
    console.error('Error en /api/scrape-brand-url:', error)
    return Response.json(
      { error: error.message || 'Error analizando el sitio web' },
      { status: 500 }
    )
  }
}

function extractWebContent(html, url) {
  const sections = []

  // 1. Meta tags esenciales
  const getMeta = (name) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
    return m ? m[1] : null
  }

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  const description = getMeta('description') || getMeta('og:description')
  const ogSiteName = getMeta('og:site_name')
  const ogTitle = getMeta('og:title')
  const keywords = getMeta('keywords')

  if (title) sections.push(`TÍTULO DEL SITIO: ${title}`)
  if (ogSiteName) sections.push(`NOMBRE DE MARCA (og:site_name): ${ogSiteName}`)
  if (ogTitle) sections.push(`TÍTULO OG: ${ogTitle}`)
  if (description) sections.push(`DESCRIPCIÓN: ${description}`)
  if (keywords) sections.push(`KEYWORDS: ${keywords}`)

  // 2. JSON-LD structured data (muy rico en información)
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const match of jsonLdMatches) {
    try {
      const data = JSON.parse(match[1])
      sections.push(`DATOS ESTRUCTURADOS JSON-LD: ${JSON.stringify(data, null, 2).slice(0, 1000)}`)
    } catch {}
  }

  // 3. Colores del CSS inline y style tags
  const styleContent = []
  const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
  for (const match of styleMatches) {
    styleContent.push(match[1])
  }

  // También buscar style attributes inline
  const inlineStyles = html.match(/style=["'][^"']*(?:color|background|border)[^"']*["']/gi) || []

  const allCss = [...styleContent, ...inlineStyles].join('\n')

  // Extraer colores hex del CSS
  const hexColors = [...new Set(allCss.match(/#[0-9a-fA-F]{3,6}\b/g) || [])]
    .filter(c => c.length >= 4) // descartar #XXX muy cortos que sean IDs
    .slice(0, 20)

  // Extraer colores rgb/rgba del CSS
  const rgbColors = (allCss.match(/rgba?\([^)]+\)/g) || []).slice(0, 10)

  if (hexColors.length > 0) sections.push(`COLORES HEX DETECTADOS EN CSS: ${hexColors.join(', ')}`)
  if (rgbColors.length > 0) sections.push(`COLORES RGB EN CSS: ${rgbColors.join(', ')}`)

  // 4. Tipografías de Google Fonts y CSS
  const googleFonts = html.match(/fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi) || []
  const fontFamilyCSS = allCss.match(/font-family\s*:\s*([^;}{]+)/gi) || []

  if (googleFonts.length > 0) {
    const fontNames = googleFonts.map(f => {
      const m = f.match(/family=([^&"']+)/)
      return m ? decodeURIComponent(m[1]).replace(/\+/g, ' ').split(':')[0] : null
    }).filter(Boolean)
    sections.push(`TIPOGRAFÍAS GOOGLE FONTS: ${fontNames.join(', ')}`)
  }

  if (fontFamilyCSS.length > 0) {
    const fonts = fontFamilyCSS.slice(0, 5).map(f => f.replace('font-family:', '').trim())
    sections.push(`TIPOGRAFÍAS CSS: ${fonts.join(' | ')}`)
  }

  // 5. Headings (camino del lector / jerarquía de información)
  const headings = []
  const headingMatches = html.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi)
  for (const match of headingMatches) {
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    if (text && text.length > 2 && text.length < 200) {
      headings.push(`H${match[1]}: ${text}`)
    }
  }
  if (headings.length > 0) sections.push(`ENCABEZADOS DEL SITIO:\n${headings.slice(0, 20).join('\n')}`)

  // 6. Párrafos principales (contenido de marca)
  const paragraphs = []
  const pMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  for (const match of pMatches) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text && text.length > 40 && text.length < 500) {
      paragraphs.push(text)
    }
  }
  if (paragraphs.length > 0) sections.push(`PÁRRAFOS PRINCIPALES:\n${paragraphs.slice(0, 12).join('\n\n')}`)

  // 7. Botones y CTAs (revelan intención de compra y audiencia)
  const ctaTexts = []
  const btnMatches = html.matchAll(/<(?:button|a)[^>]*class="[^"]*(?:btn|cta|button|action)[^"]*"[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)
  for (const match of btnMatches) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text && text.length > 2 && text.length < 100) ctaTexts.push(text)
  }
  // También capturar cualquier botón
  const allBtns = html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)
  for (const match of allBtns) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text && text.length > 2 && text.length < 80) ctaTexts.push(text)
  }
  if (ctaTexts.length > 0) sections.push(`TEXTOS DE BOTONES Y CTAs: ${[...new Set(ctaTexts)].slice(0, 10).join(' | ')}`)

  // 8. Listas (valores, beneficios, features)
  const listItems = []
  const liMatches = html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)
  for (const match of liMatches) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text && text.length > 5 && text.length < 200) listItems.push(text)
  }
  if (listItems.length > 0) sections.push(`ITEMS DE LISTAS (features/beneficios/valores):\n${listItems.slice(0, 15).join('\n')}`)

  // 9. Footer info (contacto, ubicación, redes)
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i)
  if (footerMatch) {
    const footerText = footerMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
    if (footerText) sections.push(`FOOTER: ${footerText}`)
  }

  // 10. Links a redes sociales
  const socialLinks = html.match(/href=["'][^"']*(?:instagram|facebook|twitter|linkedin|tiktok|youtube)[^"']*["']/gi) || []
  if (socialLinks.length > 0) {
    const networks = socialLinks.map(l => {
      const m = l.match(/(?:instagram|facebook|twitter|linkedin|tiktok|youtube)/i)
      return m ? m[0] : null
    }).filter(Boolean)
    sections.push(`REDES SOCIALES DETECTADAS: ${[...new Set(networks)].join(', ')}`)
  }

  return sections.join('\n\n')
}
