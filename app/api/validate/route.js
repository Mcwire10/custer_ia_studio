/**
 * POST /api/validate
 * Mentor Ácido Creativo analiza el copy y devuelve diagnóstico + 3 versiones mejoradas.
 * Una sola llamada a Gemini — sin web search, sin slide detection.
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoValidador } from '@/lib/cerebro'
import { getContextoActual } from '@/lib/contexto-actual'
import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    // DEVELOPMENT BYPASS
    const user = await getCurrentUser()
    if (!user) {
      // Permitir sin auth en desarrollo
      console.log('🔓 Validate: sin autenticación (modo dev)')
    }

    const { message, brain, realtime = false } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    const cerebroContext = getContextoValidador(brain?.nombre)
    const contextualActual = realtime ? null : await getContextoActual().catch(() => null)

    const systemPrompt = [
      cerebroContext,
      contextualActual ? `---\n\n${contextualActual}` : null
    ].filter(Boolean).join('\n\n')

    let result

    if (realtime) {
      const prompt = `Analizá brevemente este contenido y devolvé solo un JSON con: {"score": número del 0 al 100, "feedback": "diagnóstico de 2-3 oraciones", "aligned": true/false}\n\nCONTENIDO:\n"${message}"`

      const response = await callGeminiJSON(prompt, systemPrompt, { maxTokens: 300 })
      result = {
        score: response.score,
        feedback: response.feedback,
        aligned: response.aligned
      }
    } else {
      const prompt = `Analizá este contenido como el Mentor Ácido Creativo que sos. Sé directo, específico y útil.

CONTENIDO A VALIDAR:
"${message}"

INSTRUCCIONES CLAVE:
1. Detectá el tipo de pieza (ADS, Social Media feed, Stories, Reels, WhatsApp, Email, etc.) y la etapa del funnel (Awareness, Consideración, Conversión, RMKT) leyendo el contenido — no lo inventes, inferílo.
2. En la opción DIRECTA: mantené EXACTAMENTE la misma cantidad de elementos visuales que el original (misma cantidad de bullets, líneas, secciones, items). Si el original tiene 4 bullets, la directa tiene 4 bullets. Si tiene headline + 3 items + CTA, la directa tiene headline + 3 items + CTA. Esto es crítico para mantener coherencia visual en los diseños.
3. Las opciones Narrativa y Disruptiva pueden tener estructura diferente.

Respondé SOLO con JSON válido:
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

      const response = await callGeminiJSON(prompt, systemPrompt, { maxTokens: 4000 })
      result = {
        score: response.score,
        aligned: response.aligned,
        tipo_contenido: response.tipo_contenido,
        etapa_funnel: response.etapa_funnel,
        diagnostico: response.diagnostico,
        cambios: response.cambios,
        opciones: response.opciones,
        aprendizaje_clave: response.aprendizaje_clave
      }
    }

    return Response.json({ success: true, coach_analysis: result, ...result })

  } catch (error) {
    console.error('Error en /api/validate:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}