/**
 * POST /api/competition
 * Analiza competencia y compara con tu marca usando Gemini
 */

import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const { competitors, brain } = await request.json()

    if (!competitors || competitors.length === 0) {
      return Response.json(
        { error: 'Lista de competidores requerida' },
        { status: 400 }
      )
    }

    let system = 'Eres analista de mercado.'
    if (brain?.nombre) {
      system = `Eres analista de mercado. Tu cliente es ${brain.nombre}`
      if (brain.rubro) system += ` (${brain.rubro})`
      if (brain.propuesta) system += `. Su propuesta: ${brain.propuesta}`
    }

    const prompt = `Analyze competitors: ${competitors.join(', ')}. Compare positioning, strengths, weaknesses. Score 0-100 each. Return JSON: {competitors: [{name, strengths, weaknesses, positioning, score}]}`

    const result = await callGeminiJSON(prompt, system, { maxTokens: 4000 })

    return Response.json({ success: true, analysis: result.competitors })
  } catch (error) {
    console.error('Error en /api/competition:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}