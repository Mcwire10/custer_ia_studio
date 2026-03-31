/**
 * POST /api/generate
 * Genera un carousel basado en un tema
 */

async function brainToPromptSystem(brain) {
  if (!brain || !brain.nombre) {
    return 'Eres un experto en marketing y diseño.'
  }

  let prompt = 'Eres un experto en marketing, branding y comunicación. '
  prompt += `Trabajas para la marca '${brain.nombre}'`
  if (brain.rubro) prompt += ` (${brain.rubro})`
  if (brain.ciudad) prompt += ` ubicada en ${brain.ciudad}`
  prompt += '. '

  if (brain.propuesta) prompt += `Su propuesta de valor es: ${brain.propuesta}. `
  if (brain.publico) prompt += `Su público objetivo es: ${brain.publico}. `

  if (brain.registro) {
    prompt += `El registro de comunicación es ${brain.registro}. `
  }

  if (brain.keywords && brain.keywords.length > 0) {
    prompt += `Palabras clave de marca: ${brain.keywords.join(', ')}. `
  }

  if (brain.tonalidad && brain.tonalidad.length > 0) {
    prompt += `Tonalidad y voz: ${brain.tonalidad.join('; ')}. `
  }

  prompt += 'Proporciona respuestas concisas, relevantes y alineadas con la marca.'
  return prompt
}

export async function POST(request) {
  try {
    const { topic, format, brain } = await request.json()

    if (!topic) {
      return Response.json(
        { error: 'Topic es requerido' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada en servidor' },
        { status: 500 }
      )
    }

    // Construir system prompt
    const system = await brainToPromptSystem(brain) +
      '\nDebes devolver SOLO un JSON válido con estructura: {topic: string, slides: [{type, title, titleHighlight, body, badge, ...}]}'

    const userPrompt = `Crea un carousel de ${format} sobre: ${topic}\n` +
      'Usa máximo 8 slides. Varía los tipos: hook, bullets, checks, impact, cta, story, mockup, split.\n' +
      'Cada slide debe tener contenido relevante para el tema y la marca.'

    // Llamar a Claude API
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
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // Extraer JSON de la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se encontró JSON en respuesta')
    }

    const carousel = JSON.parse(jsonMatch[0])

    return Response.json({
      success: true,
      carousel
    })
  } catch (error) {
    console.error('Error en /api/generate:', error)
    return Response.json(
      { error: error.message || 'Error generando carousel' },
      { status: 500 }
    )
  }
}
