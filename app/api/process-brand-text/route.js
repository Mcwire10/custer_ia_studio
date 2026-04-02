/**
 * POST /api/process-brand-text
 * Procesa texto para extraer datos de marca
 */

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: 'Texto requerido' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
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
        max_tokens: 2000,
        system: 'Eres un experto en branding estratégico. Extrae TODA la información disponible del texto. Responde SOLO con JSON válido, sin explicaciones, sin markdown. Para arrays, usa [] si no hay información.',
        messages: [
          {
            role: 'user',
            content: `Analiza este documento de marca en detalle. Extrae toda la información disponible y devuelve EXACTAMENTE este JSON (usa null para campos no encontrados, [] para arrays vacíos):

{
  "basico": {
    "nombre": "nombre de la marca",
    "rubro": "industria/sector",
    "ciudad": "ubicación geográfica",
    "propuesta": "propuesta de valor principal"
  },
  "estrategico": {
    "mision": "misión de la marca",
    "vision": "visión de la marca",
    "valores": ["valor1", "valor2", "valor3"],
    "beneficios_funcionales": "beneficios prácticos/funcionales",
    "beneficios_emocionales": "beneficios emocionales/psicológicos"
  },
  "audiencia": {
    "publico_objetivo": "descripción demográfica del público",
    "audiencia_real": "descripción psicográfica/real de la audiencia",
    "pain_points": ["problema1", "problema2"],
    "gains": ["beneficio1", "beneficio2"],
    "motivaciones": "motivaciones de compra",
    "comportamiento_digital": "cómo se comporta digitalmente"
  },
  "identidad": {
    "voz_tono": "pilares de comunicación y tono",
    "claim": "claim o manifiesto de la marca",
    "narrativa": "narrativa de marca / storytelling",
    "territorio_creativo": "espacio donde la marca se mueve"
  },
  "visual": {
    "tipografia": "descripción de tipografías",
    "colores": {
      "primario": "color primario",
      "secundario": "color secundario",
      "acentos": ["acento1", "acento2"]
    },
    "estilo_visual": "fotografía, ilustración, abstracto, etc",
    "recursos_graficos": ["recurso1", "recurso2"],
    "sistema_grafico": "descripción del sistema gráfico",
    "mood_board": "referencias de inspiración"
  },
  "posicionamiento": {
    "competencia": ["competidor1", "competidor2"],
    "diferenciadores": ["diferenciador1", "diferenciador2"],
    "propuesta_unica": "qué les hace únicos"
  },
  "implementacion": {
    "canales": ["canal1", "canal2"],
    "formatos": ["formato1", "formato2"],
    "frecuencia": "frecuencia de publicación"
  },
  "comunicacion": {
    "keywords": ["palabra1", "palabra2"],
    "avoid": ["evitar1", "evitar2"],
    "tonalidad": ["tono1", "tono2"],
    "ejemplos": "ejemplos de copy o mensajes"
  }
}

INSTRUCCIONES ESPECÍFICAS:
- Sé exhaustivo en la búsqueda de información
- Para valores y arrays, extrae al menos 2-3 elementos si están disponibles
- Describe características reales basadas en el documento
- Si un campo no tiene información clara, usa null
- Mantén respuestas concisas pero informativas

DOCUMENTO:
${text}`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    let responseText = data.content[0].text.trim()

    // Limpiar markdown
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parsear JSON
    let brandData = JSON.parse(responseText)

    // Asegurar estructura correcta
    const defaultBrand = {
      nombre: null,
      rubro: null,
      ciudad: null,
      propuesta: null,
      publico: null,
      tipografia: null,
      registro: null,
      keywords: [],
      avoid: [],
      tonalidad: [],
      ejemplos: null
    }

    brandData = { ...defaultBrand, ...brandData }

    return Response.json({
      success: true,
      brand: brandData
    })
  } catch (error) {
    console.error('Error en /api/process-brand-text:', error.message)
    return Response.json(
      { error: 'Error procesando texto: ' + error.message },
      { status: 500 }
    )
  }
}
