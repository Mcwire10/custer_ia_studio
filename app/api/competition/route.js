/**
 * POST /api/competition
 * Analiza competencia y compara con tu marca
 */

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

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const system = await brainToPromptSystem(brain) +
      '\nAnaliza competidores. Responde SOLO JSON: {competitors: [{name: string, strengths: string, weaknesses: string, positioning: string, score: number}]}'

    const userPrompt = `Competidores a analizar: ${competitors.join(', ')}\n\nCompara su posicionamiento, fortalezas y debilidades contra ${brain.nombre}. Da un score de 0-100 para cada uno.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
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
