/**
 * POST /api/competition
 * Analiza competencia y compara con tu marca
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
  if (!brain || !brain.nombre) return 'Eres un analista de mercado.'
  let prompt = `Eres analista de mercado. Tu cliente es ${brain.nombre}`
  if (brain.rubro) prompt += ` (${brain.rubro})`
  if (brain.propuesta) prompt += `. Su propuesta: ${brain.propuesta}`
  return prompt
}

export async function POST(request) {
  try {
    const { competitors, brain } = await request.json()

    if (!competitors || competitors.length === 0) {
      return Response.json(
        { error: 'Lista de competidores requerida' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const context = brain?.nombre ? `vs ${brain.nombre}${brain.propuesta ? ` (${brain.propuesta})` : ''}` : '';
    const system = createStandardSystemPrompt('market analyst', context, '{competitors: [{name, strengths, weaknesses, positioning, score}]}');

    const userPrompt = `Analyze competitors: ${competitors.join(', ')}. Compare positioning, strengths, weaknesses. Score 0-100 each.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('competition'),
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

    return Response.json({ success: true, analysis: result.competitors })
  } catch (error) {
    console.error('Error en /api/competition:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
