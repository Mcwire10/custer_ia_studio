/**
 * POST /api/assistant-context
 * Chat contextual en cada módulo que explica fuentes de datos y permite cambiar herramientas
 */

const MODULE_CONTEXT = {
  brain: {
    name: 'Brand Brain',
    description: 'Extrae información completa de marca',
    sources: [
      'Análisis de documentos PDF con Claude Vision',
      'Procesamiento de texto con Claude Opus',
      'Extracción visual de 10-15 imágenes de Instagram'
    ],
    tools: ['Vision API', 'Text Processing', 'Image Analysis'],
    alternativeTools: {
      'Text Processing': ['Manual entry', 'Web scraping'],
      'Image Analysis': ['TikTok', 'Pinterest', 'Facebook', 'LinkedIn'],
      'Vision API': ['OCR local', 'Manual transcription']
    }
  },

  generator: {
    name: 'Generador de Contenido',
    description: 'Genera carousels y contenido creativo',
    sources: [
      'Datos de marca del Brand Brain',
      'Tipografía y colores de análisis visual',
      'Tendencias de IA basadas en datos de marca'
    ],
    tools: ['Brand Data', 'Visual Analysis', 'Creative AI'],
    alternativeTools: {
      'Creative AI': ['Pinterest trends', 'Instagram Reels analysis', 'TikTok trends'],
      'Visual Analysis': ['Canva templates', 'Stock imagery'],
      'Brand Data': ['Updated brand guidelines', 'User feedback']
    }
  },

  validator: {
    name: 'Validador de Mensajes',
    description: 'Valida mensajes contra la identidad de marca',
    sources: [
      'Voz y tono de marca',
      'Valores y misión',
      'Audiencia objetivo',
      'Palabras clave y evitar'
    ],
    tools: ['Brand Guidelines', 'Tone Analysis', 'Compliance Check'],
    alternativeTools: {
      'Brand Guidelines': ['User feedback', 'Focus groups', 'A/B testing'],
      'Tone Analysis': ['Sentiment analysis', 'Language detection'],
      'Compliance Check': ['Manual review', 'Peer feedback']
    }
  },

  copy: {
    name: 'Generador de Copy',
    description: 'Crea copys para diferentes plataformas',
    sources: [
      'Ejemplos de copy aprobados',
      'Voz y tono de marca',
      'Propuesta de valor',
      'Público objetivo real'
    ],
    tools: ['Brand Copy', 'Audience Insights', 'Platform Optimization'],
    alternativeTools: {
      'Brand Copy': ['Competitor analysis', 'Historical campaigns', 'Customer testimonials'],
      'Audience Insights': ['Social listening', 'Google Trends', 'Surveys'],
      'Platform Optimization': ['Native platform features', 'A/B testing']
    }
  },

  competition: {
    name: 'Análisis de Competencia',
    description: 'Analiza creativos de competidores',
    sources: [
      'Meta Ads Library (últimos 20 días)',
      'Pinterest Creative API',
      'Instagram Business Account Data',
      'Análisis de engagement'
    ],
    tools: ['Meta Ads', 'Pinterest API', 'Instagram Analytics'],
    alternativeTools: {
      'Meta Ads': ['TikTok Ads Library', 'LinkedIn Ads', 'Google Ads'],
      'Pinterest API': ['YouTube trends', 'Behance', 'Dribbble'],
      'Instagram Analytics': ['TikTok analytics', 'YouTube analytics', 'Twitter analytics']
    }
  },

  reports: {
    name: 'Reportes',
    description: 'Genera reportes con métricas y análisis',
    sources: [
      'Instagram Business Analytics',
      'Meta Ads Performance Data',
      'Engagement metrics',
      'Growth trends'
    ],
    tools: ['Instagram API', 'Meta Insights', 'Analytics Engine'],
    alternativeTools: {
      'Instagram API': ['TikTok Analytics', 'LinkedIn Analytics', 'YouTube Analytics'],
      'Meta Insights': ['Google Analytics', 'Custom dashboards'],
      'Analytics Engine': ['Hootsuite', 'Later', 'Buffer']
    }
  }
}

export async function POST(request) {
  try {
    const { module, question, currentData, tools_requested } = await request.json()

    if (!module || !question) {
      return Response.json(
        { error: 'Se requieren module y question' },
        { status: 400 }
      )
    }

    const moduleInfo = MODULE_CONTEXT[module]
    if (!moduleInfo) {
      return Response.json(
        { error: `Módulo no reconocido: ${module}` },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    // Construir contexto para Claude
    let systemPrompt = `Eres un asistente experto en branding y marketing digital.
Trabajas en el módulo "${moduleInfo.name}" de una plataforma de gestión de marcas.

Tus responsabilidades:
1. Explicar qué herramientas está usando el módulo actualmente
2. Describir las fuentes de datos que utiliza
3. Sugerir herramientas alternativas si el usuario las solicita
4. Responder preguntas sobre análisis, metodología y mejoras

Sé profesional, conciso y enfocado en el valor para el usuario.`

    let userPrompt = `CONTEXTO DEL MÓDULO "${moduleInfo.name}":
Descripción: ${moduleInfo.description}
Fuentes actuales: ${moduleInfo.sources.join(', ')}
Herramientas: ${moduleInfo.tools.join(', ')}

PREGUNTA DEL USUARIO: ${question}`

    // Si usuario solicita herramientas alternativas
    if (tools_requested && tools_requested.length > 0) {
      userPrompt += `

SOLICITUD DE CAMBIO:
El usuario solicita usar estas herramientas alternativas: ${tools_requested.join(', ')}

Proporciona:
1. Cómo implementaría cada herramienta alternativa
2. Ventajas y desventajas vs las actuales
3. Tiempo estimado para cambiar
4. Recomendación personal`

      // Obtener opciones de herramientas alternativas
      const alternatives = {}
      for (const tool of moduleInfo.tools) {
        if (moduleInfo.alternativeTools[tool]) {
          alternatives[tool] = moduleInfo.alternativeTools[tool]
        }
      }

      userPrompt += `

HERRAMIENTAS ALTERNATIVAS DISPONIBLES:
${JSON.stringify(alternatives, null, 2)}`
    } else {
      // Si es una pregunta normal
      userPrompt += `

Por favor:
1. Explica qué estamos usando actualmente
2. Por qué elegimos estas herramientas
3. Cómo se utilizan en el análisis
4. Si tienes sugerencias de mejora, menciónalas`
    }

    // Llamar a Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const assistantResponse = data.content[0].text

    return Response.json({
      success: true,
      response: assistantResponse,
      module: module,
      moduleInfo: {
        name: moduleInfo.name,
        currentTools: moduleInfo.tools,
        availableAlternatives: moduleInfo.alternativeTools
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error en /api/assistant-context:', error.message)
    return Response.json(
      { error: 'Error procesando pregunta: ' + error.message },
      { status: 500 }
    )
  }
}
