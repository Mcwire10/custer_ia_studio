/**
 * POST /api/copy
 * Genera copy para diferentes plataformas
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { createStandardSystemPrompt, getMaxTokens } from '@/app/lib/prompt-schemas'
import { getCurrentUser } from '@/lib/auth'

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
  if (!brain || !brain.nombre) return 'Eres un copywriter especializado.'
  let prompt = `Eres copywriter para ${brain.nombre}`
  if (brain.rubro) prompt += ` (${brain.rubro})`
  if (brain.propuesta) prompt += `. Propuesta: ${brain.propuesta}`
  if (brain.registro) prompt += `. Tono: ${brain.registro}`
  return prompt
}

export async function POST(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { theme, platforms, brain } = await request.json()

    if (!theme?.trim() || !platforms || platforms.length === 0) {
      return Response.json(
        { error: 'Tema y plataformas requeridas' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const context = brain?.nombre ? `Brand: ${brain.nombre}${brain.propuesta ? ` (${brain.propuesta})` : ''}` : '';
    const system = createStandardSystemPrompt('copywriter especializado', context, `{copies: {${platforms.map(p => `${p}: {headline, body, cta}`).join(', ')}}}`);

    const userPrompt = `Theme: "${theme}". Create copy for: ${platforms.join(', ')}. Adapt per platform characteristics.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('copy'),
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

    return Response.json({ success: true, copies: result.copies })
  } catch (error) {
    console.error('Error en /api/copy:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
