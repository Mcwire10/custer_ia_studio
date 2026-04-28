/**
 * POST /api/validate
 * El Mentor Ácido analiza el contenido, lo destruye con fundamento
 * y entrega 3 versiones listas para usar, alineadas a la marca.
 *
 * Flujo:
 * 1. Carga cerebro (Mentor Ácido + ADN de la marca)
 * 2. Busca actualidad: tendencias del sector + eventos culturales masivos
 * 3. Claude devuelve: diagnóstico + 3 opciones (Directa / Narrativa / Disruptiva)
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoValidador } from '@/lib/cerebro'

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY || null
}

async function buscarContextoActual(apiKey, brain) {
  const sector = brain?.rubro || 'marketing y comunicación'

  const buscar = async (query) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 600,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: `Buscá info actualizada sobre: "${query}". Resumí en 150 palabras máx, solo hechos concretos.` }]
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') || null
  }

  const [tendencias, eventos] = await Promise.allSettled([
    buscar(`tendencias actuales ${sector} Argentina 2025 comunicación marketing redes sociales`),
    buscar('eventos masivos globales culturales deportivos 2025 Argentina oportunidades de marca marketing')
  ])

  const partes = []
  if (tendencias.status === 'fulfilled' && tendencias.value)
    partes.push(`## TENDENCIAS EN ${sector.toUpperCase()}\n${tendencias.value}`)
  if (eventos.status === 'fulfilled' && eventos.value)
    partes.push(`## EVENTOS Y MOMENTOS CULTURALES DISPONIBLES\n${eventos.value}`)

  return partes.join('\n\n') || null
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { message, brain, tipo = 'copy', objetivo = 'general', plataforma = 'instagram' } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Contenido vacío' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
    }

    // 1. Cerebro: Mentor Ácido + ADN de la marca
    const cerebroContext = getContextoValidador(brain?.nombre)

    // 2. Actualidad en paralelo
    const contextualActual = await buscarContextoActual(apiKey, brain).catch(() => null)

    // 3. System prompt
    const systemPrompt = [
      cerebroContext,
      contextualActual
        ? `---\n\n# CONTEXTO DE ACTUALIDAD\nUsá esto para detectar oportunidades perdidas y conectar el contenido con lo que está pasando ahora.\n\n${contextualActual}`
        : null
    ].filter(Boolean).join('\n\n---\n\n')

    const nombreMarca = brain?.nombre || 'la marca'

    const userPrompt = `
Analizá este contenido de ${nombreMarca}:

CONTENIDO A VALIDAR:
"""
${message}
"""

CONTEXTO:
- Tipo: ${tipo}
- Objetivo: ${objetivo}
- Plataforma: ${plataforma}

Tu trabajo como Mentor Ácido:

1. **EL CHALLENGE**: Destrozá el contenido con fundamento. ¿Qué falla? ¿Por qué es genérico o débil? Sé específico y ácido, pero constructivo.

2. **LA ESTRATEGIA**: Antes de reescribir, definí el ángulo correcto para esta marca, este objetivo y esta plataforma. Una línea.

3. **LAS 3 OPCIONES** (listas para copiar y publicar):
   - Directa: enfocada en la venta/acción
   - Narrativa: storytelling puro
   - Disruptiva: el golpe creativo que da miedo aprobar

4. Si hay un momento cultural o evento actual relevante, usalo en al menos una opción.

Respondé ÚNICAMENTE en JSON válido:
{
  "diagnostico": "crítica ácida y específica del contenido original",
  "estrategia": "el ángulo correcto en una línea",
  "opciones": {
    "directa": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Ref: Título, Autor"
    },
    "narrativa": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Ref: Título, Autor"
    },
    "disruptiva": {
      "headline": "",
      "body": "",
      "cta": "",
      "referencia": "Ref: Título, Autor"
    }
  },
  "momento_cultural_usado": "nombre del evento/momento si se usó, sino vacío",
  "score_original": número del 0 al 100
}
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const claudeData = await response.json()
    const responseText = claudeData.content[0]?.text || ''

    let result = null
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) result = JSON.parse(jsonMatch[0])
    } catch (e) {
      throw new Error('El Mentor no devolvió JSON válido')
    }

    if (!result?.opciones) {
      throw new Error('Respuesta incompleta del Mentor')
    }

    return Response.json({
      success: true,
      diagnostico: result.diagnostico,
      estrategia: result.estrategia,
      opciones: result.opciones,
      momento_cultural_usado: result.momento_cultural_usado || null,
      score_original: result.score_original || 0,
      // Compatibilidad con validateInRealTime (tiempo real)
      validation: {
        aligned: (result.score_original || 0) >= 60,
        score: result.score_original || 0,
        feedback: result.diagnostico
      }
    })

  } catch (error) {
    console.error('Error en /api/validate:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
