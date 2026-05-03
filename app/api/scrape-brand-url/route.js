/**
 * POST /api/scrape-brand-url
 * Extrae TODOS los campos del Brain desde una URL de sitio web
 * Ahora usa Google Gemini
 */

import { callGeminiJSON } from '@/lib/gemini'

const BRAND_EXTRACTION_PROMPT = `Eres un estratega de marca senior. Tu tarea es analizar el contenido de un sitio web y extraer toda la información posible para completar un Brand Brain.

Analiza el contenido HTML, meta tags, colores CSS, tipografías y texto, y devuelve un JSON estructurado con TODOS los campos que puedas inferir.

IMPORTANTE:
- Si un campo no se puede inferir con certeza, déjalo null (no inventes datos)
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
    "estilo_visual": "descriptor del estilo (minimalista, bold, oscuro premium, colorido dinámico, etc.)",
    "recursos_graficos": "qué recursos visuales usa la marca",
    "sistema_grafico": "cómo construye sus piezas visuales",
    "mood_board": "palabras que describen el mood visual"
  },
  "posicionamiento": {
    "competencia": ["competidor1", "competidor2"],
    "diferenciadores": ["diferenciador1", "diferenciador2"],
    "propuesta_unica": "UVP de la marca"
  },
  "comunicacion": {
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "avoid": ["palabra1"],
    "tonalidad": ["tonalidad1", "tonalidad2"],
    "ejemplos": "ejemplo de cómo habla la marca en el sitio"
  }
}`

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: 'URL requerida' }, { status: 400 })
    }

    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl
    }

    console.log(`🔍 Scrapeando: ${cleanUrl}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    let html
    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        },
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      html = await response.text()
    } catch (fetchError) {
      clearTimeout(timeout)
      if (fetchError.name === 'AbortError') {
        return Response.json({ error: 'El sitio tardó demasiado en responder (timeout 15s)' }, { status: 408 })
      }
      throw fetchError
    }

    const extractedContent = extractWebContent(html, cleanUrl)
    console.log(`📊 Contenido extraído: ${extractedContent.length} chars`)

    const brand = await callGeminiJSON(
      `Analiza este sitio web y extrae toda la información de marca posible.\n\nURL: ${cleanUrl}\n\n${extractedContent}`,
      BRAND_EXTRACTION_PROMPT,
      { maxTokens: 4000 }
    )

    console.log(`✅ Marca extraída: ${brand?.basico?.nombre || cleanUrl}`)

    return Response.json({
      success: true,
      brand,
      url: cleanUrl,
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

  const getMeta = (name) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
    return m ? m[1] : null
  }

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  const description = getMeta('description') || getMeta('og:description')
  const ogSiteName = getMeta('og:site_name')
  const ogTitle = getMeta('og:title')

  if (title) sections.push(`TITLE: ${title}`)
  if (ogSiteName) sections.push(`SITE NAME: ${ogSiteName}`)
  if (ogTitle) sections.push(`OG TITLE: ${ogTitle}`)
  if (description) sections.push(`DESCRIPTION: ${description}`)

  const hexColors = [...new Set((html.match(/#[0-9a-fA-F]{3,6}\b/g) || []).slice(0, 20))]
  if (hexColors.length) sections.push(`COLORES ENCONTRADOS: ${hexColors.join(', ')}`)

  const fonts = [...new Set((html.match(/family=([^&"':,]+)/gi) || []).map(f => f.replace('family=', '').split(':')[0].replace(/"/g, '')))]
  if (fonts.length) sections.push(`FUENTES: ${fonts.slice(0, 10).join(', ')}`)

  const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 2 && t.length < 200)
    .slice(0, 15)
  if (headings.length) sections.push(`HEADINGS:\n${headings.join('\n')}`)

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 30 && t.length < 600)
    .slice(0, 10)
  if (paragraphs.length) sections.push(`CONTENIDO:\n${paragraphs.join('\n\n')}`)

  return sections.join('\n\n')
}