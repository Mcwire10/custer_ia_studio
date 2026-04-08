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

import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url || !url.startsWith('http')) {
      return Response.json({ error: 'URL inválida' }, { status: 400 })
    }

    // Validate URL is accessible
    let html
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000
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

    // Parse HTML
    const dom = new JSDOM(html)
    const doc = dom.window.document

    // ============= EXTRACT META DATA =============
    const meta = {
      title: doc.querySelector('title')?.textContent || '',
      description: doc.querySelector('meta[name="description"]')?.content || '',
      ogImage: doc.querySelector('meta[property="og:image"]')?.content || '',
      favicon: doc.querySelector('link[rel="icon"]')?.href || '',
      lang: doc.documentElement.getAttribute('lang') || 'es'
    }

    // ============= EXTRACT COLORS FROM CSS =============
    const colors = extractColorsFromCSS(doc)

    // ============= EXTRACT FONTS FROM CSS =============
    const fonts = extractFontsFromCSS(doc)

    // ============= EXTRACT CONTENT STRUCTURE =============
    const structure = extractContentStructure(doc)

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
 * Extract colors from CSS and inline styles
 */
function extractColorsFromCSS(doc) {
  const colors = {}
  const colorRegex =
    /#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\([0-9,\s]+\)|rgba\([0-9,.\s]+\)|hsl\([0-9,\s%]+\)/gi

  // From style tags
  const styleTags = doc.querySelectorAll('style')
  styleTags.forEach(tag => {
    const matches = tag.textContent.match(colorRegex)
    if (matches) {
      matches.forEach(color => {
        const hex = colorToHex(color)
        colors[hex] = (colors[hex] || 0) + 1
      })
    }
  })

  // From inline styles on major elements
  doc.querySelectorAll('[style*="color"]').forEach(el => {
    const style = el.getAttribute('style')
    if (style) {
      const matches = style.match(colorRegex)
      if (matches) {
        matches.forEach(color => {
          const hex = colorToHex(color)
          colors[hex] = (colors[hex] || 0) + 1
        })
      }
    }
  })

  // Get top colors
  const topColors = Object.entries(colors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hex, count]) => ({
      hex,
      name: getColorName(hex),
      confidence: Math.min(100, 50 + count * 10)
    }))

  return topColors
}

/**
 * Extract fonts from CSS
 */
function extractFontsFromCSS(doc) {
  const fonts = {}

  // From style tags
  const styleTags = doc.querySelectorAll('style')
  styleTags.forEach(tag => {
    const fontMatches = tag.textContent.match(/font-family:\s*['"]?([^;'"\n]+)['"]?;/gi)
    if (fontMatches) {
      fontMatches.forEach(match => {
        const family = match.match(/font-family:\s*['"]?([^;'"\n]+)['"]?;/i)[1]?.trim()
        if (family && family.length > 2) {
          const cleanFamily = family.split(',')[0].replace(/['"]/g, '').trim()
          fonts[cleanFamily] = (fonts[cleanFamily] || 0) + 1
        }
      })
    }
  })

  // From computed styles on main elements
  const mainElements = doc.querySelectorAll('h1, h2, p, body')
  mainElements.forEach(el => {
    const computed = getComputedStyle ? getComputedStyle(el).fontFamily : null
    if (computed) {
      const cleanFamily = computed.split(',')[0].replace(/['"]/g, '').trim()
      fonts[cleanFamily] = (fonts[cleanFamily] || 0) + 1
    }
  })

  // Get top fonts
  const topFonts = Object.entries(fonts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([family, count]) => ({
      family: family || 'sans-serif',
      confidence: Math.min(100, 60 + count * 10),
      type: detectFontType(family)
    }))

  return topFonts
}

/**
 * Extract content structure
 */
function extractContentStructure(doc) {
  const headings = []
  const ctas = []
  const sections = []

  // Headings
  doc.querySelectorAll('h1, h2, h3').forEach(h => {
    const text = h.textContent.trim().substring(0, 100)
    if (text) headings.push(text)
  })

  // CTAs
  doc.querySelectorAll('a[href], button').forEach(el => {
    const text = el.textContent.trim().substring(0, 50)
    if (
      text &&
      (text.toLowerCase().includes('compra') ||
        text.toLowerCase().includes('descargar') ||
        text.toLowerCase().includes('probar') ||
        text.toLowerCase().includes('contacto') ||
        text.toLowerCase().includes('más'))
    ) {
      ctas.push(text)
    }
  })

  // Sections
  doc.querySelectorAll('section, article, main, [role="main"]').forEach(sec => {
    const text = sec.textContent.trim().substring(0, 150)
    if (text) sections.push(text)
  })

  return {
    headings: headings.slice(0, 5),
    ctas: ctas.slice(0, 3),
    sections: sections.length,
    hasNavigation: !!doc.querySelector('nav'),
    hasFooter: !!doc.querySelector('footer')
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
