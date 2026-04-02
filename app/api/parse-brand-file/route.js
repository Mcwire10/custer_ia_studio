/**
 * POST /api/parse-brand-file
 * Procesa archivos de marca (PDF, imagen, documento) y extrae datos con Claude
 */

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    // Convertir archivo a base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determinar tipo de archivo
    const isImage = file.type.startsWith('image/')

    let messageContent = []

    if (isImage) {
      // Para imágenes, usar vision API
      const mediaType = file.type
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64
        }
      })
    }

    messageContent.push({
      type: 'text',
      text: `Extrae TODA la información de branding de este archivo. Sé exhaustivo.

Responde EXACTAMENTE en este formato JSON (sin texto adicional, solo JSON):
{
  "basico": {
    "nombre": "nombre de la marca o null",
    "rubro": "industria o null",
    "ciudad": "ubicación o null",
    "propuesta": "propuesta de valor o null"
  },
  "estrategico": {
    "mision": "misión o null",
    "vision": "visión o null",
    "valores": ["valor1", "valor2"],
    "beneficios_funcionales": "beneficios prácticos o null",
    "beneficios_emocionales": "beneficios emocionales o null"
  },
  "audiencia": {
    "publico_objetivo": "público objetivo o null",
    "audiencia_real": "audiencia real/psicográfica o null",
    "pain_points": ["problema1", "problema2"],
    "gains": ["beneficio1", "beneficio2"],
    "motivaciones": "motivaciones o null",
    "comportamiento_digital": "comportamiento digital o null"
  },
  "identidad": {
    "voz_tono": "voz y tono o null",
    "claim": "claim/manifiesto o null",
    "narrativa": "narrativa o null",
    "territorio_creativo": "territorio creativo o null"
  },
  "visual": {
    "tipografia": "tipografía o null",
    "colores": {
      "primario": "color primario o null",
      "secundario": "color secundario o null",
      "acentos": []
    },
    "estilo_visual": "fotografía/ilustración/etc o null",
    "recursos_graficos": [],
    "sistema_grafico": "sistema gráfico o null",
    "mood_board": "referencias o null"
  },
  "posicionamiento": {
    "competencia": [],
    "diferenciadores": [],
    "propuesta_unica": "propuesta única o null"
  },
  "implementacion": {
    "canales": [],
    "formatos": [],
    "frecuencia": "frecuencia o null"
  },
  "comunicacion": {
    "keywords": [],
    "avoid": [],
    "tonalidad": [],
    "ejemplos": "ejemplos de copy o null"
  }
}`
    })

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
        system: 'Eres un experto en branding estratégico. Responde SOLO con JSON válido. Sin explicaciones, sin markdown, sin comillas adicionales. Solo el JSON.',
        messages: [
          {
            role: 'user',
            content: messageContent
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

    // Limpiar markdown si existe
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parsear JSON
    let brandData = JSON.parse(responseText)

    // Asegurar estructura correcta con valores por defecto
    const defaultBrand = {
      basico: {
        nombre: null,
        rubro: null,
        ciudad: null,
        propuesta: null
      },
      estrategico: {
        mision: null,
        vision: null,
        valores: [],
        beneficios_funcionales: null,
        beneficios_emocionales: null
      },
      audiencia: {
        publico_objetivo: null,
        audiencia_real: null,
        pain_points: [],
        gains: [],
        motivaciones: null,
        comportamiento_digital: null
      },
      identidad: {
        voz_tono: null,
        claim: null,
        narrativa: null,
        territorio_creativo: null
      },
      visual: {
        tipografia: null,
        colores: {
          primario: null,
          secundario: null,
          acentos: []
        },
        estilo_visual: null,
        recursos_graficos: [],
        sistema_grafico: null,
        mood_board: null
      },
      posicionamiento: {
        competencia: [],
        diferenciadores: [],
        propuesta_unica: null
      },
      implementacion: {
        canales: [],
        formatos: [],
        frecuencia: null
      },
      comunicacion: {
        keywords: [],
        avoid: [],
        tonalidad: [],
        ejemplos: null
      }
    }

    // Merge recursivo para mantener estructura
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = { ...target[key], ...source[key] }
        } else {
          target[key] = source[key]
        }
      }
      return target
    }

    brandData = deepMerge(defaultBrand, brandData || {})

    return Response.json({
      success: true,
      brand: brandData
    })
  } catch (error) {
    console.error('Error en /api/parse-brand-file:', error.message)
    return Response.json(
      { error: 'Error procesando archivo: ' + error.message },
      { status: 500 }
    )
  }
}
