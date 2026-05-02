/**
 * POST /api/generate-design
 * Genera una pieza visual completa como HTML/CSS autónomo.
 * Claude recibe el brief + ADN de marca y devuelve HTML listo para renderizar.
 */

import { getCurrentUser } from '@/lib/auth'
import { getADNMarca } from '@/lib/cerebro'

const FORMATOS = {
  'placa-feed':    { w: 1080, h: 1080, label: 'Placa Feed (1:1)' },
  'stories':       { w: 1080, h: 1920, label: 'Stories (9:16)' },
  'banner-email':  { w: 600,  h: 200,  label: 'Banner Email' },
  'carrusel':      { w: 1080, h: 1080, label: 'Carrusel (múltiples slides)' },
  'flyer':         { w: 800,  h: 1200, label: 'Flyer vertical' },
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const { brief, formato = 'placa-feed', brain, iteracion = null } = await request.json()

    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })

    const dims = FORMATOS[formato] || FORMATOS['placa-feed']
    const adn = getADNMarca(brain?.nombre)

    const systemPrompt = `Sos un diseñador gráfico senior especializado en piezas digitales para redes sociales y marketing.
Tu trabajo es generar HTML/CSS autónomo, sin dependencias externas, que represente fielmente la pieza solicitada.

REGLAS DE OUTPUT:
- Respondé ÚNICAMENTE con el HTML completo. Sin explicaciones, sin markdown, sin comentarios fuera del HTML.
- El HTML debe ser 100% autónomo: todo el CSS inline o en <style>. Cero links externos, cero Google Fonts por URL (usá font-family genéricas o @font-face con base64 si es crítico).
- El tamaño del root debe ser exactamente ${dims.w}px × ${dims.h}px con overflow: hidden.
- Usá flexbox o grid para el layout. Que se vea profesional y listo para entregar.
- Si el brief pide múltiples slides de carrusel, generá cada slide como una sección con display:none excepto la primera, y agregá botones prev/next en JS puro para navegar.

${adn ? `ADN DE LA MARCA:\n${adn}\n\nUsá la paleta de colores, tipografía y estilo visual de la marca en el diseño.` : 'Usá una paleta profesional y moderna si no hay ADN de marca disponible.'}`

    const userPrompt = iteracion
      ? `Tenés este HTML generado previamente:\n\n${iteracion}\n\nAplicá este cambio: ${brief}\n\nDevolvé el HTML completo actualizado.`
      : `Generá una pieza de tipo "${dims.label}" (${dims.w}×${dims.h}px) con este brief:\n\n${brief}\n\nDevolvé solo el HTML.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    let html = data.content[0]?.text || ''

    // Limpiar si Claude envolvió en markdown
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.includes('<html') && !html.includes('<div') && !html.includes('<body')) {
      throw new Error('Claude no devolvió HTML válido')
    }

    return Response.json({ success: true, html, formato, dims })

  } catch (error) {
    console.error('Error en /api/generate-design:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
