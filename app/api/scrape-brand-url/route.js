/**
 * POST /api/scrape-brand-url
 * Extrae contenido de brand desde una URL web
 */

export async function POST(request) {
  try {
    const formData = await request.formData()
    const url = formData.get('url')

    if (!url) {
      return Response.json(
        { error: 'URL es requerida' },
        { status: 400 }
      )
    }

    // Validar que sea una URL válida
    try {
      new URL(url)
    } catch {
      return Response.json(
        { error: 'URL no válida' },
        { status: 400 }
      )
    }

    // Fetch del contenido HTML
    console.log(`📡 Obteniendo contenido de: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extraer contenido relevante del HTML
    const content = extractBrandContent(html, url)

    return Response.json({
      success: true,
      content: content,
      url: url
    })
  } catch (error) {
    console.error('Error en /api/scrape-brand-url:', error)
    return Response.json(
      { error: error.message || 'Error extrayendo contenido de URL' },
      { status: 500 }
    )
  }
}

function extractBrandContent(html, url) {
  // Extraer texto relevante del HTML
  let content = ''

  // Extraer metadatos
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  if (titleMatch) content += `Título: ${titleMatch[1]}\n`

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
  if (descMatch) content += `Descripción: ${descMatch[1]}\n`

  // Extraer h1, h2, h3
  const headings = html.match(/<h[123][^>]*>([^<]+)<\/h[123]>/gi) || []
  if (headings.length > 0) {
    content += '\nEncabezados principales:\n'
    headings.slice(0, 10).forEach(h => {
      const text = h.replace(/<[^>]+>/g, '').trim()
      if (text) content += `- ${text}\n`
    })
  }

  // Extraer párrafos principales
  const paragraphs = html.match(/<p[^>]*>([^<]{50,})<\/p>/gi) || []
  if (paragraphs.length > 0) {
    content += '\nContenido principal:\n'
    paragraphs.slice(0, 5).forEach(p => {
      const text = p.replace(/<[^>]+>/g, '').trim()
      if (text.length > 50) content += `${text}\n\n`
    })
  }

  // Extraer texto de botones CTA
  const buttons = html.match(/<button[^>]*>([^<]{10,})<\/button>/gi) || []
  if (buttons.length > 0) {
    content += '\nPrincipales acciones:\n'
    buttons.slice(0, 5).forEach(b => {
      const text = b.replace(/<[^>]+>/g, '').trim()
      if (text) content += `- ${text}\n`
    })
  }

  // Si el contenido es demasiado corto, intentar más agresivamente
  if (content.length < 200) {
    const allText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    content = allText.substring(0, 2000)
  }

  return content || 'No se pudo extraer contenido de la URL'
}
