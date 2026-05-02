/**
 * POST /api/reports
 * Genera reporte ejecutivo completo usando Gemini
 */

import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const { brain, carousel } = await request.json()

    if (!brain || !brain.nombre) {
      return Response.json(
        { error: 'Brand Brain requerido' },
        { status: 400 }
      )
    }

    let system = `Eres estratega de marca. Cliente: ${brain.nombre}`
    if (brain.rubro) system += ` (${brain.rubro})`
    if (brain.propuesta) system += `. Propuesta: ${brain.propuesta}`
    if (brain.publico) system += `. Público: ${brain.publico}`

    const prompt = `Generate executive report for ${brain.nombre}. Include KPIs, positioning analysis, communication recommendations. Return JSON with: {title, summary, kpis[], recommendations[]}`

    const result = await callGeminiJSON(prompt, system, { maxTokens: 4000 })

    return Response.json({ success: true, report: result })
  } catch (error) {
    console.error('Error en /api/reports:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}