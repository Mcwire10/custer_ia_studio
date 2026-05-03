/**
 * POST /api/scrape-website
 * Scrapes website for brand colors, typography, and content structure
 *
 * Input:
 * {
 *   url: "https://example.com"
 * }
 *
 * Output:
 * {
 *   success: true,
 *   data: {
 *     url: "https://example.com",
 *     detected_colors: [{hex, name, confidence}],
 *     detected_fonts: [{family, sizes, confidence}],
 *     content_structure: {sections, headings, ctas},
 *     meta: {title, description, ogImage, favicon}
 *   }
 * }
 */

// Disabled: jsdom has ESM issues with Next.js 16
// import fetch from 'node-fetch'
// import { JSDOM } from 'jsdom'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url || !url.startsWith('http')) {
      return Response.json({ error: 'URL inválida' }, { status: 400 })
    }

    // Use global fetch (Node 18+)
    let html
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      html = await response.text()
    } catch (error) {
      return Response.json(
        { error: `No se pudo acceder al sitio: ${error.message}` },
        { status: 400 }
      )
    }

    // Basic HTML parsing without jsdom (regex-based fallback)
    const doc = parseHTMLBasic(html)

    // ============= EXTRACT META DATA =============
    const meta = {
      title: (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || '',
      description: (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [])[1] || '',
      ogImage: (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || [])[1] || '',
      favicon: (html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i) || [])[1] || '',
      lang: (html.match(/<html[^>]*lang=["']([^"']+)["']/i) || [])[1] || 'es'
    }

    // ============= EXTRACT COLORS FROM CSS =============
    const colors = extractColorsFromHTML(html)

    // ============= EXTRACT FONTS FROM CSS =============
    const fonts = extractFontsFromHTML(html)

    // ============= EXTRACT CONTENT STRUCTURE =============
    const structure = extractContentStructureFromHTML(html)

    return Response.json({
      success: true,
      data: {
        url,
        detected_colors: colors,
        detected_fonts: fonts,
        content_structure: structure,
        meta
      }
    })
  } catch (error) {
    console.error('Error en /api/scrape-website:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Basic HTML parser without jsdom
 */
function parseHTMLBasic(html) {
  return {
    querySelector: (sel) => null, // not implemented
    querySelectorAll: (sel) => [] // not implemented
  }
}

/**
 * Extract colors from HTML using regex
 */
function extractColorsFromHTML(html) {
  const colors = {}
  const colorRegex = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi

  const matches = html.match(colorRegex) || []
  matches.forEach(color => {
    const hex = color.length === 4
      ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
      : color.toLowerCase()
    colors[hex] = (colors[hex] || 0) + 1
  })

  return Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex, count]) => ({
      hex,
      name: getColorName(hex),
      confidence: Math.min(100, 50 + count * 10)
    }))
}

/**
 * Extract fonts from HTML using regex
 */
function extractFontsFromHTML(html) {
  const fonts = {}
  const fontMatches = html.match(/font-family:\s*['"]?([^;'"\n]+)['"]?;/gi) || []

  fontMatches.forEach(match => {
    const family = (match.match(/font-family:\s*['"]?([^;'"\n]+)['"]?;/i) || [])[1]?.trim()
    if (family && family.length > 2) {
      const cleanFamily = family.split(',')[0].replace(/['"]/g, '').trim()
      fonts[cleanFamily] = (fonts[cleanFamily] || 0) + 1
    }
  })

  return Object.entries(fonts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([family, count]) => ({
      family: family || 'sans-serif',
      confidence: Math.min(100, 60 + count * 10),
      type: detectFontType(family)
    }))
}

/**
 * Extract content structure from HTML using regex
 */
function extractContentStructureFromHTML(html) {
  const headings = []
  const ctas = []

  // Extract headings
  const headingMatches = html.match(/<h[123][^>]*>([^<]+)<\/h[123]>/gi) || []
  headingMatches.slice(0, 5).forEach(h => {
    const text = (h.match(/>([^<]+)</) || [])[1]?.trim().substring(0, 100)
    if (text) headings.push(text)
  })

  // Extract CTAs
  const ctaMatches = html.match(/<(a|button)[^>]*>([^<]+)<\/(a|button)>/gi) || []
  ctaMatches.forEach(el => {
    const text = (el.match(/>([^<]+)</) || [])[1]?.trim().substring(0, 50)
    if (text && /compra|descargar|probar|contacto|más/i.test(text)) {
      ctas.push(text)
    }
  })

  return {
    headings: headings.slice(0, 5),
    ctas: ctas.slice(0, 3),
    sections: (html.match(/<section|<article|<main/gi) || []).length,
    hasNavigation: /<nav/i.test(html),
    hasFooter: /<footer/i.test(html)
  }
}

/**
 * Convert color to hex
 */
function colorToHex(color) {
  const c = color.toLowerCase()

  // Already hex
  if (c.startsWith('#')) {
    if (c.length === 4) {
      return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
    }
    return c
  }

  // RGB/RGBA
  if (c.startsWith('rgb')) {
    const match = c.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0])
      const g = parseInt(match[1])
      const b = parseInt(match[2])
      return (
        '#' +
        [r, g, b]
          .map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
          })
          .join('')
      )
    }
  }

  // Default
  return '#000000'
}

/**
 * Get color name
 */
function getColorName(hex) {
  const colorNames = {
    '#ffffff': 'Blanco',
    '#000000': 'Negro',
    '#ff0000': 'Rojo',
    '#00ff00': 'Verde',
    '#0000ff': 'Azul',
    '#ffff00': 'Amarillo',
    '#ff00ff': 'Magenta',
    '#00ffff': 'Cyan',
    '#ffa500': 'Naranja',
    '#800080': 'Púrpura',
    '#ffc0cb': 'Rosa',
    '#a52a2a': 'Marrón'
  }

  return colorNames[hex.toLowerCase()] || hex
}

/**
 * Detect font type
 */
function detectFontType(family) {
  if (!family) return 'web-safe'

  family = family.toLowerCase()

  if (family.includes('serif')) return 'serif'
  if (family.includes('sans')) return 'sans-serif'
  if (family.includes('mono')) return 'monospace'

  const googleFonts = ['roboto', 'montserrat', 'open sans', 'lato', 'poppins', 'inter']
  if (googleFonts.some(f => family.includes(f))) return 'google-fonts'

  return 'custom'
}
