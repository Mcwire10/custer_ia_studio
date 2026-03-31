/**
 * POST /api/copy
 * Genera copy para diferentes plataformas
 */

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
    const { theme, platforms, brain } = await request.json()

    if (!theme?.trim() || !platforms || platforms.length === 0) {
      return Response.json(
        { error: 'Tema y plataformas requeridas' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const system = await brainToPromptSystem(brain) +
      `\nGenera copy para: ${platforms.join(', ')}\nResponde SOLO JSON: {copies: {platform: {headline: string, body: string, cta: string}}}`

    const userPrompt = `Tema: "${theme}"\n\nAdapta el copy para cada plataforma según sus características y audiencia.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
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
