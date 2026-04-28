/**
 * POST /api/copy
 * Genera copy estratégico para diferentes plataformas.
 *
 * Flujo:
 * 1. Carga el cerebro (Mentor Ácido + biblioteca teórica + ADN de la marca)
 * 2. Busca tendencias actuales del sector Y eventos masivos culturales/deportivos
 * 3. Claude genera copy alineado a la marca, con referencias bibliográficas y anclado a la actualidad
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoGenerador } from '@/lib/cerebro'

const PLATAFORMAS_CONFIG = {
  instagram: { maxChars: 2200, tono: 'visual, emocional, con hook fuerte en la primera línea' },
  facebook:  { maxChars: 500,  tono: 'conversacional, genera debate o reacción' },
  linkedin:  { maxChars: 1300, tono: 'profesional pero humano, con insight de valor' },
  twitter:   { maxChars: 280,  tono: 'directo, ingenioso, sin desperdicio de palabras' },
  email:     { maxChars: 800,  tono: 'asunto impactante + cuerpo que convierte' },
  whatsapp:  { maxChars: 500,  tono: 'cercano, directo, como si fuera de un amigo' },
  tiktok:    { maxChars: 300,  tono: 'gancho en los primeros 3 segundos, lenguaje generacional' },
}

async function buscarContextoActual(apiKey, marca) {
  const sector = marca?.rubro || 'marketing y comunicación'
  const nombre = marca?.nombre || ''

  // Dos búsquedas en paralelo:
  // A) Tendencias específicas del sector
  // B) Eventos masivos globales/culturales/deportivos aprovechables
  const querySector = `tendencias actuales ${sector} Argentina 2025 comunicación marketing`
  const queryEventos = `eventos masivos globales culturales deportivos 2025 oportunidades de marca`

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
        max_tokens: 800,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Buscá información actualizada sobre: "${query}". Resumí los 3-5 hallazgos más relevantes en máximo 200 palabras. Solo hechos concretos y fechas cuando las tengas.`
        }]
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    // Extraer el texto final de la respuesta (puede haber tool_use + text)
    const textos = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
    return textos || null
  }

  const [tendencias, eventos] = await Promise.allSettled([
    buscar(querySector),
    buscar(queryEventos)
  ])

  const resultado = []
  if (tendencias.status === 'fulfilled' && tendencias.value) {
    resultado.push(`## TENDENCIAS EN ${sector.toUpperCase()}\n${tendencias.value}`)
  }
  if (eventos.status === 'fulfilled' && eventos.value) {
    resultado.push(`## EVENTOS Y MOMENTOS CULTURALES PARA CONECTAR\n${eventos.value}`)
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

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
    }

    // 1. Cargar contexto del cerebro
    const cerebroContext = getContextoGenerador(brain?.nombre)

    // 2. Buscar actualidad en paralelo mientras armamos el resto
    const contextualActual = await buscarContextoActual(apiKey, brain).catch(() => null)

    // 3. Config de plataformas solicitadas
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
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

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude no devolvió JSON válido')

    const result = JSON.parse(jsonMatch[0])

    return Response.json({
      success: true,
      copies: result.copies,
      momento_cultural_usado: result.momento_cultural_usado || null,
      estrategia_general: result.estrategia_general || null,
      contexto_usado: !!contextualActual
    })

  } catch (error) {
    console.error('Error en /api/copy:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
