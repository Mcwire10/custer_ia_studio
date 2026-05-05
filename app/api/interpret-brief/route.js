/**
 * POST /api/interpret-brief
 * Lee un brief en lenguaje natural y devuelve:
 * - formato: qué tipo de pieza generar (placa-feed / stories / carrusel / flyer / banner-email)
 * - slides: cantidad de slides si es carrusel
 * - resumen: descripción corta de lo interpretado
 * - briefExpandido: brief mejorado/expandido con detalles de estructura
 */

import { getCurrentUser } from '@/lib/auth'
import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const { brief, brain } = await request.json()
    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const system = `Sos un productor creativo de una agencia de marketing. Tu tarea: interpretar pedidos de piezas de comunicación y clasificarlos.`

    const prompt = `Interpretá este pedido de pieza creativa:

"${brief}"

Marca/cliente: ${brain?.nombre || 'sin especificar'}
Rubro: ${brain?.rubro || 'sin especificar'}

Respondé en JSON con este formato exacto:
{
  "formato": "placa-feed" | "stories" | "carrusel" | "flyer" | "banner-email",
  "slides": 3,  // solo si formato=carrusel, número de slides (mín 2, máx 10)
  "resumen": "Una oración describiendo qué se va a generar",
  "piezas": 1,  // cuántas piezas independientes (generalmente 1, pero puede ser más)
  "sugerencias": ["Sugerencia 1 para mejorar el brief", "Sugerencia 2"]
}

Reglas para elegir formato:
- "placa-feed": post cuadrado para feed de Instagram, Facebook, LinkedIn
- "stories": vertical 9:16 para Stories o Reels, TikTok
- "carrusel": múltiples slides (cuando el brief menciona: pasos, tips numerados, antes/después, lista de ítems)
- "flyer": vertical tipo afiche, para eventos, promociones con mucho texto
- "banner-email": horizontal ancho para encabezados de emails

Detectá señales clave:
- "carrusel", "slides", "pasos", "tips", "consejos", "serie", "N items/puntos" → carrusel
- "stories", "reel", "vertical", "efímero" → stories
- "feed", "placa", "cuadrado", "post" → placa-feed
- "flyer", "afiche", "evento", "invitación" → flyer
- "email", "newsletter", "mailing" → banner-email
- Si no hay señal clara y es para social media → placa-feed

Para carrusel, detectá la cantidad: "3 pasos" → slides: 3, "5 tips" → slides: 5. Default: 5.`

    const result = await callGeminiJSON(prompt, system, { maxTokens: 400 })

    return Response.json({
      success: true,
      formato: result.formato || 'placa-feed',
      slides: result.slides || null,
      resumen: result.resumen || '',
      piezas: result.piezas || 1,
      sugerencias: result.sugerencias || []
    })

  } catch (error) {
    console.error('Error en /api/interpret-brief:', error)
    // Fallar silenciosamente — el frontend tiene fallback
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
