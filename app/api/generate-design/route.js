/**
 * POST /api/generate-design
 * Flujo:
 * 1. Claude genera HTML/CSS de la pieza con placeholders para imágenes: <!--IMG:descripción-->
 * 2. gpt-image-1 genera cada imagen en paralelo (base64)
 * 3. Las imágenes se inyectan en el HTML final
 */

import { getCurrentUser } from '@/lib/auth'
import { getADNMarca } from '@/lib/cerebro'

const FORMATOS = {
  'placa-feed':   { w: 1080, h: 1080, label: 'Placa Feed (1:1)' },
  'stories':      { w: 1080, h: 1920, label: 'Stories (9:16)' },
  'banner-email': { w: 600,  h: 200,  label: 'Banner Email' },
  'carrusel':     { w: 1080, h: 1080, label: 'Carrusel (múltiples slides)' },
  'flyer':        { w: 800,  h: 1200, label: 'Flyer vertical' },
}

/**
 * Busca la imagen de un producto en internet usando Claude web search.
 * Devuelve la URL de la imagen o null si no encuentra.
 */
async function buscarImagenProducto(descripcion, apiKey) {
  const query = `${descripcion} PNG producto fondo blanco site:*.com`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Buscá una imagen PNG de "${descripcion}" en internet. Necesito la URL directa de la imagen del producto (preferentemente en fondo blanco o transparente). Devolvé SOLO la URL de la imagen, sin explicaciones. Si no encontrás ninguna URL de imagen válida, devolvé null.`
      }]
    })
  })

  if (!res.ok) return null
  const data = await res.json()
  const texto = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()

  // Extraer URL de imagen de la respuesta
  const urlMatch = texto.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?/i)
  return urlMatch ? urlMatch[0] : null
}

/**
 * Descarga una imagen desde una URL y la convierte a base64.
 */
async function urlABase64(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error('No se pudo descargar la imagen')
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/png'
  const b64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${b64}`
}

/**
 * Genera imagen con gpt-image-1 como fallback si no se encontró en internet.
 */
async function generarImagenOpenAI(descripcion, openaiKey) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: descripcion,
      n: 1,
      size: '1024x1024',
      output_format: 'base64'
    })
  })
  if (!res.ok) throw new Error('Error OpenAI imagen')
  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI no devolvió imagen')
  return `data:image/png;base64,${b64}`
}

/**
 * Obtiene imagen: primero busca en internet, si no encuentra usa gpt-image-1.
 */
async function obtenerImagen(descripcion, apiKey, openaiKey) {
  // 1. Intentar buscar la imagen real del producto en internet
  try {
    const url = await buscarImagenProducto(descripcion, apiKey)
    if (url) {
      const base64 = await urlABase64(url)
      return { base64, fuente: 'web' }
    }
  } catch (e) {
    console.warn('[generate-design] búsqueda web falló:', e.message)
  }

  // 2. Fallback: generar con gpt-image-1
  if (openaiKey) {
    try {
      const base64 = await generarImagenOpenAI(descripcion, openaiKey)
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

    const { brief, formato = 'placa-feed', brain, iteracion = null, imagenAnotada = null } = await request.json()

    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })

    const dims = FORMATOS[formato] || FORMATOS['placa-feed']
    const adn = getADNMarca(brain?.nombre)

    const systemPrompt = `Sos un diseñador gráfico senior especializado en piezas digitales para redes sociales y marketing.
Tu trabajo es generar HTML/CSS autónomo, sin dependencias externas, que represente fielmente la pieza solicitada.

REGLAS DE OUTPUT:
- Respondé ÚNICAMENTE con el HTML completo. Sin explicaciones, sin markdown, sin comentarios fuera del HTML.
- El HTML debe ser 100% autónomo: todo el CSS inline o en <style>. Cero links externos.
- El tamaño del root debe ser exactamente ${dims.w}px × ${dims.h}px con overflow: hidden.
- Usá flexbox o grid para el layout. Que se vea profesional y listo para entregar.
- Si el brief pide múltiples slides de carrusel, generá cada slide como sección con display:none excepto la primera, con botones prev/next en JS puro.
${openaiKey ? `
IMÁGENES:
- Cuando la pieza necesite una imagen real (foto de producto, persona, fondo fotográfico, ambiente), usá este placeholder exacto en el HTML: <!--IMG:descripción detallada de la imagen en español-->
- Ponelo como valor del atributo src de un <img>: <img src="<!--IMG:descripción-->" ...>
- Máximo 2 imágenes por pieza. Solo cuando realmente sumen al diseño.
- Para íconos y formas geométricas usá SVG inline o CSS puro, no imágenes.` : '- No uses imágenes externas. Usá SVG inline o CSS para elementos visuales.'}

${adn ? `ADN DE LA MARCA:\n${adn}\n\nUsá la paleta de colores, tipografía y estilo visual de la marca.` : 'Usá una paleta profesional y moderna.'}`

    // Construir mensaje — con imagen anotada si viene
    let userMessage
    if (iteracion) {
      const texto = `Tenés este HTML previo:\n\n${iteracion}\n\nAplicá este cambio: ${brief}\n\nDevolvé el HTML completo actualizado.`
      if (imagenAnotada) {
        userMessage = [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imagenAnotada.replace(/^data:image\/\w+;base64,/, '') } },
          { type: 'text', text: `Esta imagen muestra la pieza con zonas marcadas indicando qué cambiar.\n\n${texto}` }
        ]
      } else {
        userMessage = texto
      }
    } else {
      userMessage = `Generá una pieza "${dims.label}" (${dims.w}×${dims.h}px):\n\n${brief}\n\nDevolvé solo el HTML.`
    }

    // 1. Claude genera el HTML con placeholders
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const claudeData = await claudeRes.json()
    let html = claudeData.content[0]?.text || ''
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.includes('<')) throw new Error('Claude no devolvió HTML válido')

    // 2. Extraer placeholders y resolver imágenes (web search primero, gpt-image-1 como fallback)
    const placeholders = [...html.matchAll(/<!--IMG:([^>]+)-->/g)]

    if (placeholders.length > 0) {
      const imagenes = await Promise.allSettled(
        placeholders.map(([, desc]) => obtenerImagen(desc.trim(), apiKey, openaiKey))
      )

      const resumen = []
      placeholders.forEach(([match], i) => {
        const resultado = imagenes[i]
        if (resultado.status === 'fulfilled' && resultado.value) {
          html = html.replace(`src="${match}"`, `src="${resultado.value.base64}"`)
          html = html.replace(match, resultado.value.base64)
          resumen.push({ desc: placeholders[i][1], fuente: resultado.value.fuente })
        } else {
          // Fallback: placeholder SVG gris
          const svgFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='16' font-family='sans-serif'%3EImagen%3C/text%3E%3C/svg%3E`
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
