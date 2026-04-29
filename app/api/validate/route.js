/**
 * POST /api/validate
 * Mentor Ácido Creativo analiza el copy y devuelve diagnóstico + 3 versiones mejoradas.
 * Una sola llamada a Claude — sin web search, sin slide detection.
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoValidador } from '@/lib/cerebro'

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { message, brain, realtime = false } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
    }

    const systemPrompt = getContextoValidador(brain?.nombre)

    // Realtime: análisis rápido sin estructura completa (para el preview mientras escribe)
    const userPrompt = realtime
      ? `Analizá brevemente este contenido y devolvé solo un JSON con: {"score": número del 0 al 100, "feedback": "diagnóstico de 2-3 oraciones", "aligned": true/false}\n\nCONTENIDO:\n"${message}"`
      : `Analizá este contenido como el Mentor Ácido Creativo que sos. Sé directo, específico y útil.

CONTENIDO A VALIDAR:
"${message}"

INSTRUCCIONES CLAVE:
1. Detectá el tipo de pieza (ADS, Social Media feed, Stories, Reels, WhatsApp, Email, etc.) y la etapa del funnel (Awareness, Consideración, Conversión, RMKT) leyendo el contenido — no lo inventes, inferílo.
2. En la opción DIRECTA: mantené EXACTAMENTE la misma cantidad de elementos visuales que el original (misma cantidad de bullets, líneas, secciones, items). Si el original tiene 4 bullets, la directa tiene 4 bullets. Si tiene headline + 3 items + CTA, la directa tiene headline + 3 items + CTA. Esto es crítico para mantener coherencia visual en los diseños.
3. Las opciones Narrativa y Disruptiva pueden tener estructura diferente.

Respondé SOLO con JSON válido, sin markdown:
{
  "score": número del 0 al 100,
  "aligned": true o false,
  "tipo_contenido": "tipo detectado: ADS Facebook/Instagram | Social Media Feed | Stories | Reels | WhatsApp | Email | otro",
  "etapa_funnel": "etapa detectada: Awareness | Consideración | Conversión | RMKT | mixto",
  "diagnostico": "diagnóstico ácido pero constructivo, 3-5 oraciones. Qué funciona, qué no, por qué.",
  "cambios": [
    {
      "titulo": "nombre del cambio",
      "principio_marketing": "qué principio de marketing aplica y por qué (cita libro si aplica)",
      "contexto_marca": "cómo conecta con el ADN de la marca"
    }
  ],
  "opciones": {
    "directa": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Libro, Autor",
      "nota_estructura": "breve nota de qué estructura mantuvo del original"
    },
    "narrativa": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Libro, Autor"
    },
    "disruptiva": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Libro, Autor"
    }
  },
  "aprendizaje_clave": "párrafo de 3-5 oraciones: qué aprendió este análisis, qué patrón repetido hay en el copy, qué debería mejorar el usuario en la próxima pieza"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: realtime ? 300 : 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const responseText = data.content[0]?.text || ''

    const jsonStart = responseText.indexOf('{')
    const jsonEnd = responseText.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Claude no devolvió JSON válido')
    }

    const result = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1))

    return Response.json({ success: true, coach_analysis: result, ...result })

  } catch (error) {
    console.error('Error en /api/validate:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
