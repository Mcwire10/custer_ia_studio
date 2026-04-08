/**
 * POST /api/reports
 * Genera reporte ejecutivo completo
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { createStandardSystemPrompt, getMaxTokens } from '@/app/lib/prompt-schemas'

function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

async function brainToPromptSystem(brain) {
  if (!brain || !brain.nombre) return 'Eres un estratega de marca.'
  let prompt = `Eres estratega de marca. Cliente: ${brain.nombre}`
  if (brain.rubro) prompt += ` (${brain.rubro})`
  if (brain.propuesta) prompt += `. Propuesta: ${brain.propuesta}`
  if (brain.publico) prompt += `. Público: ${brain.publico}`
  return prompt
}

export async function POST(request) {
  try {
    const { brain, carousel } = await request.json()

    if (!brain || !brain.nombre) {
      return Response.json(
        { error: 'Brand Brain requerido' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const context = `Brand: ${brain.nombre}${brain.propuesta ? ` (${brain.propuesta})` : ''}${carousel ? `, ${carousel.slides?.length || 0} slides` : ''}`;
    const system = createStandardSystemPrompt('brand strategist', context, '{title, summary, kpis, recommendations[]}');

    const userPrompt = `Generate executive report for ${brain.nombre}. Include KPIs, positioning analysis, communication recommendations.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('reports'),
        system,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const responseText = data.content[0].text

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON inválido en respuesta')

    const result = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, report: result })
  } catch (error) {
    console.error('Error en /api/reports:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
