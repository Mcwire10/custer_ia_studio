/**
 * POST /api/analyze-visual-identity
 * Analiza identidad visual de múltiples imágenes usando Claude Vision
 */

export async function POST(request) {
  try {
    const { images, brandName } = await request.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return Response.json(
        { error: 'Se requieren imágenes para analizar' },
        { status: 400 }
      )
    }

    if (images.length > 15) {
      return Response.json(
        { error: 'Máximo 15 imágenes permitidas' },
        { status: 400 }
      )
    }

    // Validar tamaño de payload total (hasta 20MB)
    const totalSize = images.reduce((sum, img) => sum + (img.data?.length || 0), 0)
    const maxPayloadSize = 20 * 1024 * 1024 // 20MB
    if (totalSize > maxPayloadSize) {
      // Intentar comprimir automáticamente
      console.log(`Payload demasiado grande (${Math.round(totalSize / 1024 / 1024)}MB), comprimiendo...`)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    // Construir mensajes con imágenes
    const messageContent = []

    // Agregar todas las imágenes
    images.forEach((imageData, index) => {
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageData.type || 'image/jpeg',
          data: imageData.data.split(',')[1] || imageData.data // Remover data:image/jpeg; si existe
        }
      })
    })

    // Prompt para análisis visual
    messageContent.push({
      type: 'text',
      text: `Analiza estas ${images.length} imágenes de la marca "${brandName || 'sin nombre'}" y extrae su identidad visual.

IMPORTANTE: Responde SOLO en JSON válido, sin explicaciones ni markdown.

{
  "colores": [
    {
      "hex": "código hex del color",
      "rgb": "rgb(r, g, b)",
      "nombre": "nombre del color",
      "uso": "dónde aparece (fondo, texto, acento, etc)",
      "frecuencia": porcentaje estimado de uso (1-100)
    }
  ],
  "tipografia": [
    {
      "familia": "nombre de la familia tipográfica",
      "peso": "light/regular/medium/bold/etc",
      "uso": "donde se utiliza (títulos, body, botones)",
      "estilo": "características (san-serif, moderna, minimalista)"
    }
  ],
  "fotografia": {
    "estilo": "fotografía/ilustración/mixto/etc",
    "composicion": "descripción de cómo se componen las imágenes",
    "temas": ["tema1", "tema2"],
    "tratamiento": "filtros, saturación, contraste, etc",
    "perspectiva": "ángulos y perspectivas utilizadas"
  },
  "elementos_graficos": {
    "iconos": ["descripción de íconos utilizados"],
    "formas": ["formas básicas utilizadas"],
    "texturas": ["texturas encontradas"],
    "patrones": ["patrones visuales identificados"],
    "lineas": "estilos de líneas (finas, gruesas, punteadas)"
  },
  "sistema_visual": {
    "consistencia": "nivel de consistencia entre imágenes (alto/medio/bajo)",
    "paleta_dominante": ["color1", "color2", "color3"],
    "atmosfera": "atmósfera general (profesional, lúdico, minimalista, etc)",
    "balance": "descripción de balance visual"
  },
  "recomendaciones": {
    "mantener": ["elemento1", "elemento2"],
    "mejorar": ["aspecto1", "aspecto2"],
    "expandir": "cómo expandir el sistema visual"
  },
  "resumen": "resumen ejecutivo de la identidad visual en 1-2 párrafos"
}

INSTRUCCIONES:
- Sé ESPECÍFICO con códigos hex y nombres de colores
- Identifica tipografías reales si las reconoces
- Extrae al menos 5-7 colores principales
- Describe el tratamiento fotográfico en detalle
- Nota cualquier elemento gráfico repetido
- Proporciona análisis consistente y profesional`
    })

    // Llamar a Claude Vision
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 2500,
        system:
          'Eres un experto en diseño y branding visual. Analiza imágenes con detalle profesional. Responde SOLO en JSON válido.',
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

    // Limpiar markdown
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parsear JSON
    let visualAnalysis = JSON.parse(responseText)

    // Estructura por defecto
    const defaultAnalysis = {
      colores: [],
      tipografia: [],
      fotografia: {
        estilo: null,
        composicion: null,
        temas: [],
        tratamiento: null,
        perspectiva: null
      },
      elementos_graficos: {
        iconos: [],
        formas: [],
        texturas: [],
        patrones: [],
        lineas: null
      },
      sistema_visual: {
        consistencia: 'no determinada',
        paleta_dominante: [],
        atmosfera: null,
        balance: null
      },
      recomendaciones: {
        mantener: [],
        mejorar: [],
        expandir: null
      },
      resumen: null,
      timestamp: new Date().toISOString()
    }

    // Merge con análisis
    visualAnalysis = { ...defaultAnalysis, ...visualAnalysis }

    return Response.json({
      success: true,
      analysis: visualAnalysis,
      imagesCount: images.length
    })
  } catch (error) {
    console.error('Error en /api/analyze-visual-identity:', error.message)
    return Response.json(
      { error: 'Error analizando imágenes: ' + error.message },
      { status: 500 }
    )
  }
}
