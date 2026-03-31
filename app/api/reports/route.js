/**
 * POST /api/reports
 * Genera reporte ejecutivo completo
 */

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

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const system = await brainToPromptSystem(brain) +
      '\nGenera reporte ejecutivo. Responde SOLO JSON: {title: string, summary: string, kpis: {key: value}, recommendations: string[]}'

    const userPrompt = `Genera un reporte estratégico para ${brain.nombre}.
${carousel ? `La marca tiene ${carousel.slides?.length || 0} slides ya generados.` : ''}
Incluye KPIs sugeridos, análisis de posicionamiento y recomendaciones de comunicación.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
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
