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

    // Extraer colores y estilos del análisis visual
    let brandColors = {
      primary: '#6860EE',
      secondary: '#F5A623',
      accent: '#FF6B6B'
    }
    let brandTypography = 'sans-serif'
    let visualStyle = 'moderno'

    if (brain.visualAssets?.analysis) {
      const analysis = brain.visualAssets.analysis
      if (analysis.colores && analysis.colores.length > 0) {
        const primary = analysis.colores.find(c => c.uso === 'primario')
        const secondary = analysis.colores.find(c => c.uso === 'secundario')
        if (primary) brandColors.primary = primary.hex.split('(')[0].trim()
        if (secondary) brandColors.secondary = secondary.hex.split('(')[0].trim()
      }
      if (analysis.tipografia && analysis.tipografia.length > 0) {
        brandTypography = analysis.tipografia[0].familia || 'sans-serif'
      }
      if (analysis.fotografia?.estilo) {
        visualStyle = analysis.fotografia.estilo
      }
    }

    // Usar colores de la marca guardada si existen
    if (brain.color_primario) {
      brandColors.primary = brain.color_primario.split('(')[0].trim()
    }
    if (brain.color_secundario) {
      brandColors.secondary = brain.color_secundario.split('(')[0].trim()
    }
    if (brain.tipografia_principal) {
      brandTypography = brain.tipografia_principal
    }

    // Construir system prompt
    const system = await brainToPromptSystem(brain) +
      `\nDebes generar mockups visuales de anuncios usando ESTOS colores de marca:
      - Primario: ${brandColors.primary}
      - Secundario: ${brandColors.secondary}
      - Tipografía: ${brandTypography}
      - Estilo visual: ${visualStyle}

      Devuelve SOLO JSON: {topic: string, ads: [{type, headline, body, cta, bgGradient, textColor, accentColor, imageIndex}]}
      Usa SIEMPRE los colores y estilos de la marca.`

    // Preparar info sobre imágenes
    let imagesInfo = ''
    if (brain.visualAssets?.images && brain.visualAssets.images.length > 0) {
      imagesInfo = `\nIMAGENES DISPONIBLES PARA USAR: ${brain.visualAssets.images.length} imágenes subidas`
      if (brain.visualAssets.analysis?.fotografia) {
        imagesInfo += `\nAnálisis visual: ${brain.visualAssets.analysis.fotografia.estilo || 'moderno'}`
      }
      imagesInfo += '\nPara CADA anuncio, incluye: "imageIndex": N (número de imagen a usar, 0-' + (brain.visualAssets.images.length - 1) + ')'
    }

    const userPrompt = `Crea ${format === 'carrusel' ? '6' : '4'} mockups de anuncios publicitarios para: ${topic}
      REQUISITOS OBLIGATORIOS:
      - Usa SOLO estos colores: Primario ${brandColors.primary}, Secundario ${brandColors.secondary}
      - Tipografía: ${brandTypography}
      - Estilo visual: ${visualStyle}
      ${imagesInfo}
      - Varía formatos: Instagram Post, Story, Facebook, LinkedIn
      - Cada anuncio DEBE TENER: titular impactante, descripción corta, CTA
      - Los textos deben ser puntuales y coherentes con la marca
      - IMPORTANTE: Si no hay imágenes, deja imageIndex vacío y sugiere qué tipo de imagen buscar`

    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
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

    // Extraer JSON de la respuesta - más robusto
    let adData = null
    try {
      // Intentar encontrar JSON válido
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        adData = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Error parseando JSON:', e)
    }

    if (!adData || !adData.ads || adData.ads.length === 0) {
      throw new Error('No se pudo generar los anuncios. Respuesta: ' + responseText.substring(0, 200))
    }

    // Convertir datos en HTML mockups
    const generateGradient = (primary, secondary) => {
      return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
    }

    const adsWithHTML = (adData.ads || []).map((ad, idx) => {
      let html = ''
      const adType = (ad.type || 'instagram').toLowerCase().trim()
      const gradient = ad.bgGradient || generateGradient(brandColors.primary, brandColors.secondary)
      const textColor = ad.textColor || 'white'
      const accentColor = ad.accentColor || brandColors.secondary

      // Obtener imagen si Claude indicó cuál usar
      let bgImageStyle = ''
      let imageSuggestion = ''

      if (brain.visualAssets?.images && brain.visualAssets.images.length > 0) {
        // Claude debería indicar qué imagen usar
        let imageIndex = ad.imageIndex !== undefined ? parseInt(ad.imageIndex) : null

        if (imageIndex === null) {
          // Si no indica, usar según el índice del anuncio
          imageIndex = idx % brain.visualAssets.images.length
        } else if (imageIndex < 0 || imageIndex >= brain.visualAssets.images.length) {
          imageIndex = idx % brain.visualAssets.images.length
        }

        const selectedImage = brain.visualAssets.images[imageIndex]
        if (selectedImage) {
          // Usar data del imagen si existe
          const imageData = selectedImage.data || selectedImage
          if (imageData && imageData.length > 50) { // Validar que sea base64
            bgImageStyle = `background-image: linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('${imageData}'); background-size: cover; background-position: center;`
          }
        }
      }

      if (!bgImageStyle && ad.imageSuggestion) {
        imageSuggestion = ad.imageSuggestion
      }

      if (adType.includes('instagram') || adType === 'instagram') {
        html = `
          <div style="width: 100%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="aspect-ratio: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; ${bgImageStyle || `background: ${gradient};`}">
              <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 4px; width: fit-content;">
                <div style="font-size: 14px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Instagram Post</div>
              </div>
              <div style="background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 16px;">${ad.headline || ''}</div>
                <div style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">${ad.body || ''}</div>
                <button style="background: ${accentColor}; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 16px;">${ad.cta || 'Ver más'}</button>
              </div>
            </div>
          </div>
        `
      } else if (adType.includes('story') || adType === 'story') {
        html = `
          <div style="width: 100%; max-width: 350px; aspect-ratio: 9/16; background: ${gradient}; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: space-between; padding: 40px 20px; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 20px;">${ad.headline || ''}</div>
            </div>
            <div style="text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 14px; line-height: 1.6; margin-bottom: 30px;">${ad.body || ''}</div>
            </div>
            <button style="background: ${accentColor}; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 14px;">${ad.cta || 'Tap para más'}</button>
          </div>
        `
      } else if (adType.includes('facebook') || adType === 'facebook') {
        html = `
          <div style="width: 100%; max-width: 600px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="background: ${gradient}; aspect-ratio: 1.91 / 1; display: flex; align-items: center; justify-content: center; color: white; padding: 40px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; line-height: 1.2;">${ad.headline || ''}</div>
            </div>
            <div style="padding: 20px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 500;">Patrocinado</div>
              <div style="font-size: 16px; line-height: 1.5; color: #1f2937; margin-bottom: 16px;">${ad.body || ''}</div>
              <button style="background: ${accentColor}; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%; font-size: 15px;">${ad.cta || 'Más información'}</button>
            </div>
          </div>
        `
      } else if (adType.includes('linkedin') || adType === 'linkedin') {
        html = `
          <div style="width: 100%; max-width: 600px; background: white; border: 1px solid #d0d3d7; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
              <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Patrocinado</div>
              <div style="font-size: 16px; font-weight: 600; color: #000;">${ad.headline || ''}</div>
            </div>
            <div style="background: ${gradient}; padding: 40px; color: white; text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 24px; font-weight: 700;">${ad.body || ''}</div>
            </div>
            <div style="padding: 16px;">
              <button style="background: ${accentColor}; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px;">${ad.cta || 'Más información'}</button>
            </div>
          </div>
        `
      } else {
        // Default a Instagram si no reconoce el tipo
        html = `
          <div style="width: 100%; max-width: 500px; background: ${gradient}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="aspect-ratio: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <div>
                <div style="font-size: 14px; font-weight: 500; opacity: 0.8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Anuncio</div>
                <div style="font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 16px;">${ad.headline || ''}</div>
              </div>
              <div>
                <div style="font-size: 15px; line-height: 1.5; margin-bottom: 20px;">${ad.body || ''}</div>
                <button style="background: ${accentColor}; color: white; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 16px;">${ad.cta || 'Ver más'}</button>
              </div>
            </div>
          </div>
        `
      }

      return {
        type: ad.type,
        headline: ad.headline,
        body: ad.body,
        cta: ad.cta,
        html: html,
        bgGradient: ad.bgGradient,
        accentColor: ad.accentColor
      }
    })

    return Response.json({
      success: true,
      topic: adData.topic,
      ads: adsWithHTML
    })
  } catch (error) {
    console.error('Error en /api/generate:', error)
    return Response.json(
      { error: error.message || 'Error generando carousel' },
      { status: 500 }
    )
  }
}
