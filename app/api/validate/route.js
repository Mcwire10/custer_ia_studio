/**
 * POST /api/validate
 * Valida un mensaje contra la identidad de marca
 */

async function brainToPromptSystem(brain) {
  if (!brain || !brain.nombre) return 'Eres un experto en marketing.'
  let prompt = `Trabajas para ${brain.nombre}`
  if (brain.rubro) prompt += ` (${brain.rubro})`
  if (brain.propuesta) prompt += `. Su propuesta: ${brain.propuesta}`
  if (brain.registro) prompt += `. Tono: ${brain.registro}`
  return prompt
}

export async function POST(request) {
  try {
    const { message, brain } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const system = await brainToPromptSystem(brain) +
      '\nAnaliza si el mensaje se alinea con la marca. Responde SOLO JSON: {aligned: bool, score: 0-100, feedback: string, suggestions: string[]}'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system,
        messages: [
          { role: 'user', content: `Valida este mensaje:\n\n"${message}"` }
        ]
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

    return Response.json({ success: true, validation: result })
  } catch (error) {
    console.error('Error en /api/validate:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
