/**
 * POST /api/copy
 * Genera copy estratégico para diferentes plataformas.
 *
 * Flujo:
 * 1. Carga el cerebro (Mentor Ácido + biblioteca teórica + ADN de la marca)
 * 2. Busca tendencias actuales del sector Y eventos masivos culturales/deportivos usando Gemini
 * 3. Genera copy alineado a la marca, con referencias bibliográficas y anclado a la actualidad
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoGenerador } from '@/lib/cerebro'
import { getContextoActual } from '@/lib/contexto-actual'
import { callGeminiJSON, callGeminiWithSearch } from '@/lib/gemini'

const PLATAFORMAS_CONFIG = {
  instagram: { maxChars: 2200, tono: 'visual, emocional, con hook fuerte en la primera línea' },
  facebook:  { maxChars: 500,  tono: 'conversacional, genera debate o reacción' },
  linkedin:  { maxChars: 1300, tono: 'profesional pero humano, con insight de valor' },
  twitter:   { maxChars: 280,  tono: 'directo, ingenioso, sin desperdicio de palabras' },
  email:     { maxChars: 800,  tono: 'asunto impactante + cuerpo que convierte' },
  whatsapp:  { maxChars: 500,  tono: 'cercano, directo, como si fuera de un amigo' },
  tiktok:    { maxChars: 300,  tono: 'gancho en los primeros 3 segundos, lenguaje generacional' },
}

async function buscarContextoActual(marca) {
  const sector = marca?.rubro || 'marketing y comunicación'

  const promptSector = `Buscá información actualizada sobre tendencias actuales ${sector} Argentina 2025 comunicación marketing. Resumí los 3-5 hallazgos más relevantes en máximo 200 palabras. Solo hechos concretos y fechas cuando las tengas.`
  const promptEventos = `Buscá información sobre eventos masivos globales culturales deportivos 2025 oportunidades de marca. Resumí los 3-5 eventos más relevantes en máximo 150 palabras. Solo fechas y oportunidades concretas.`

  const [tendenciasRes, eventosRes] = await Promise.allSettled([
    callGeminiWithSearch(promptSector, null, { maxTokens: 800 }),
    callGeminiWithSearch(promptEventos, null, { maxTokens: 800 })
  ])

  const resultado = []
  if (tendenciasRes.status === 'fulfilled' && tendenciasRes.value?.text) {
    resultado.push(`## TENDENCIAS EN ${sector.toUpperCase()}\n${tendenciasRes.value.text}`)
  }
  if (eventosRes.status === 'fulfilled' && eventosRes.value?.text) {
    resultado.push(`## EVENTOS Y MOMENTOS CULTURALES PARA CONECTAR\n${eventosRes.value.text}`)
  }

  return resultado.join('\n\n') || null
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { theme, platforms, brain } = await request.json()

    if (!theme?.trim() || !platforms?.length) {
      return Response.json({ error: 'Tema y plataformas requeridas' }, { status: 400 })
    }

    const cerebroContext = getContextoGenerador(brain?.nombre)
    const contextualActual = await getContextoActual().catch(() => null)

    const especsPorPlataforma = platforms
      .map(p => {
        const config = PLATAFORMAS_CONFIG[p.toLowerCase()] || { maxChars: 500, tono: 'claro y directo' }
        return `- **${p}**: ${config.maxChars} chars máx. Tono: ${config.tono}`
      })
      .join('\n')

    const systemPrompt = [
      cerebroContext,
      contextualActual ? `---\n\n# CONTEXTO DE ACTUALIDAD\nUsá esto como materia prima para anclar el copy a lo que está pasando ahora. Conectá la marca con estos momentos cuando sea natural y potente — no forzado.\n\n${contextualActual}` : null
    ].filter(Boolean).join('\n\n---\n\n')

    const userPrompt = `
Escribí copy para la marca sobre el tema: **"${theme}"**

PLATAFORMAS Y ESPECIFICACIONES:
${especsPorPlataforma}

INSTRUCCIONES:
1. Cada pieza debe sonar genuinamente diferente según la plataforma — no es el mismo texto adaptado, es una idea nativa de cada formato.
2. Si encontraste un evento masivo o momento cultural relevante, usalo como puente creativo cuando tenga sentido real con la marca.
3. Cerrá cada copy con la referencia bibliográfica que más aplique a la decisión creativa tomada (formato: Ref: Título, Autor).
4. El copy de la Opción Disruptiva para cada plataforma debe dar miedo aprobar — pero tiene que funcionar.

Respondé en JSON válido con esta estructura exacta:
{
  "copies": {
    "[plataforma]": {
      "opcion_directa": {
        "headline": "",
        "body": "",
        "cta": "",
        "referencia": ""
      },
      "opcion_narrativa": {
        "headline": "",
        "body": "",
        "cta": "",
        "referencia": ""
      },
      "opcion_disruptiva": {
        "headline": "",
        "body": "",
        "cta": "",
        "referencia": ""
      },
      "insight_creativo": ""
    }
  },
  "momento_cultural_usado": "",
  "estrategia_general": ""
}
`

    const response = await callGeminiJSON(userPrompt, systemPrompt, { maxTokens: 4000 })

    return Response.json({
      success: true,
      copies: response.copies,
      momento_cultural_usado: response.momento_cultural_usado || null,
      estrategia_general: response.estrategia_general || null,
      contexto_usado: !!contextualActual
    })

  } catch (error) {
    console.error('Error en /api/copy:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}