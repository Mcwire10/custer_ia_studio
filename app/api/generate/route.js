/**
 * POST /api/generate
 * Genera un carousel basado en un tema
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getMaxTokens } from '@/app/lib/prompt-schemas'
import { getCurrentUser } from '@/lib/auth'

function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

// Templates de diseño sofisticados con identidad Custer
function getAdvancedTemplates(ad, idx, brandColors, visualStyle, brandTypography = 'Montserrat') {
  const designs = {
    // DISEÑO 1: Minimalista con gradiente y 3D
    minimalist: () => `
      <div style="width: 100%; max-width: 500px; aspect-ratio: 1; background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(104, 96, 238, 0.3); display: flex; flex-direction: column; justify-content: space-between; padding: 40px; color: white; font-family: '${brandTypography}', 'Montserrat', sans-serif; position: relative;">
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; filter: blur(40px);"></div>
        <div style="position: relative; z-index: 2;">
          <div style="font-size: 14px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">Instagram Post</div>
          <h2 style="font-size: 36px; font-weight: 800; margin: 0; line-height: 1.2;">${ad.headline || 'Titular'}</h2>
        </div>
        <div style="position: relative; z-index: 2;">
          <p style="font-size: 15px; line-height: 1.6; opacity: 0.95; margin: 0 0 20px 0;">${ad.body || 'Descripción'}</p>
          <button style="background: ${brandColors.secondary}; color: white; border: none; padding: 14px 28px; border-radius: 50px; font-weight: 700; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(245, 166, 35, 0.3);">${ad.cta || 'Conocer más'}</button>
        </div>
      </div>
    `,

    // DISEÑO 2: Bold con elementos 3D CSS
    bold3d: () => `
      <div style="width: 100%; max-width: 500px; aspect-ratio: 1; background: linear-gradient(180deg, #0D0C1E 0%, ${brandColors.primary} 100%); border-radius: 0px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; color: white; font-family: '${brandTypography}', 'Montserrat', sans-serif; position: relative;">
        <div style="position: absolute; top: 30px; right: 30px; width: 150px; height: 150px; background: ${brandColors.secondary}; opacity: 0.1; border-radius: 50%; filter: blur(60px);"></div>
        <div style="position: absolute; bottom: -50px; left: -50px; width: 250px; height: 250px; background: ${brandColors.primary}; opacity: 0.05; border-radius: 50%; filter: blur(80px);"></div>
        <div style="position: relative; z-index: 2;">
          <div style="font-size: 12px; font-weight: 700; color: ${brandColors.secondary}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">▶ Nuevo</div>
          <h1 style="font-size: 44px; font-weight: 900; margin: 0 0 16px 0; line-height: 1.1; letter-spacing: -1px;">${ad.headline || 'Titular'}</h1>
          <p style="font-size: 16px; opacity: 0.85; margin: 0 0 24px 0; line-height: 1.5;">${ad.body || 'Descripción'}</p>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button style="background: ${brandColors.secondary}; color: #0D0C1E; border: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">${ad.cta || 'Ir'}</button>
            <div style="font-size: 24px;">→</div>
          </div>
        </div>
      </div>
    `,

    // DISEÑO 3: Geométrico con formas
    geometric: () => `
      <div style="width: 100%; max-width: 500px; aspect-ratio: 1; background: linear-gradient(135deg, #0D0C1E 0%, #1a1929 100%); border-radius: 24px; overflow: hidden; display: flex; align-items: center; justify-content: center; color: white; font-family: '${brandTypography}', 'Montserrat', sans-serif; position: relative;">
        <svg style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" viewBox="0 0 500 500" preserveAspectRatio="none">
          <rect x="0" y="0" width="500" height="500" fill="url(#grad)"/>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${brandColors.primary};stop-opacity:0.05" />
              <stop offset="100%" style="stop-color:${brandColors.secondary};stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <circle cx="450" cy="50" r="80" fill="${brandColors.secondary}" opacity="0.1"/>
          <rect x="20" y="400" width="150" height="150" fill="${brandColors.primary}" opacity="0.08" transform="rotate(45 95 475)"/>
        </svg>
        <div style="position: relative; z-index: 2; text-align: center; padding: 40px;">
          <h2 style="font-size: 40px; font-weight: 900; margin: 0 0 16px 0;">${ad.headline || 'Titular'}</h2>
          <p style="font-size: 16px; opacity: 0.8; margin: 0 0 24px 0;">${ad.body || 'Descripción'}</p>
          <button style="background: linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary}); color: white; border: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; text-transform: uppercase;">${ad.cta || 'Descubrir'}</button>
        </div>
      </div>
    `,

    // DISEÑO 4: Glassmorphism moderno
    glassmorphism: () => `
      <div style="width: 100%; max-width: 500px; aspect-ratio: 1; background: linear-gradient(135deg, rgba(13, 12, 30, 0.9), rgba(104, 96, 238, 0.1)); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 48px; color: white; font-family: '${brandTypography}', 'Montserrat', sans-serif;">
        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <div style="width: 8px; height: 8px; background: ${brandColors.secondary}; border-radius: 50%;"></div>
          <div style="width: 8px; height: 8px; background: ${brandColors.secondary}; border-radius: 50%; opacity: 0.5;"></div>
          <div style="width: 8px; height: 8px; background: ${brandColors.secondary}; border-radius: 50%; opacity: 0.2;"></div>
        </div>
        <div>
          <h2 style="font-size: 42px; font-weight: 900; margin: 0 0 12px 0;">${ad.headline || 'Titular'}</h2>
          <p style="font-size: 16px; opacity: 0.85; margin: 0;">${ad.body || 'Descripción'}</p>
        </div>
        <button style="background: rgba(245, 166, 35, 0.2); border: 2px solid ${brandColors.secondary}; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px;">${ad.cta || 'Ir'}</button>
      </div>
    `,

    // DISEÑO 5: Tipografía editorial
    editorial: () => `
      <div style="width: 100%; max-width: 500px; aspect-ratio: 1; background: linear-gradient(180deg, ${brandColors.secondary} 0%, ${brandColors.primary} 100%); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 36px; color: white; font-family: '${brandTypography}', 'Montserrat', sans-serif; position: relative;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);"></div>
        <div style="position: relative; z-index: 2;">
          <div style="font-size: 11px; font-weight: 800; opacity: 0.8; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px;">✨ Destaca</div>
          <h1 style="font-size: 52px; font-weight: 900; margin: 0; line-height: 0.9; text-transform: uppercase;">${(ad.headline || 'Titular').substring(0, 20)}</h1>
        </div>
        <div style="position: relative; z-index: 2;">
          <p style="font-size: 14px; margin: 0 0 20px 0; opacity: 0.9; line-height: 1.6;">${ad.body || 'Descripción'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; text-transform: uppercase; font-weight: 700;">→ ${ad.cta || 'Descubrir'}</span>
            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">→</div>
          </div>
        </div>
      </div>
    `
  }

  // Seleccionar design basado en índice
  const designKeys = Object.keys(designs)
  const selectedDesign = designKeys[idx % designKeys.length]
  return designs[selectedDesign]()
}

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

// Función para generar imagen con Replicate
async function generateImageReplicate(topic, style, type, brand) {
  try {
    const apiKey = process.env.REPLICATE_API_KEY
    if (!apiKey) {
      console.warn('⚠️ REPLICATE_API_KEY no configurada, saltando generación de imágenes')
      return null
    }

    console.log(`🎨 Generando imagen con Replicate para: ${type}`)

    // Construir prompt
    let prompt = ''
    if (type === 'producto') {
      prompt = `${topic}. Professional product photography, photorealistic, high quality.
      Clean background, perfect studio lighting, 8k.
      ${brand?.visual?.colores?.primario ? `Color: ${brand.visual.colores.primario}` : ''}`
    } else if (type === 'banner') {
      prompt = `${topic}. Professional advertising banner, eye-catching, modern.
      ${brand?.identidad?.claim ? `Claim: "${brand.identidad.claim}"` : ''}
      Vibrant colors, readable text, 8k quality`
    } else {
      prompt = `${topic}. Professional ${style || 'modern'} design, high quality, polished, 8k`
    }

    // Llamar a Replicate API
    const replicate_response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-schnell',
        input: {
          prompt: prompt,
          height: 768,
          width: 1024,
          num_outputs: 1,
          scheduler: 'normal',
          num_inference_steps: 4,
          guidance_scale: 3.5
        }
      })
    })

    if (!replicate_response.ok) {
      console.warn(`⚠️ Error Replicate: ${replicate_response.status}`)
      return null
    }

    const prediction = await replicate_response.json()

    if (prediction.id) {
      console.log(`⏳ Procesando imagen (ID: ${prediction.id})...`)

      // Esperar a que se complete
      let completed = false
      let attempts = 0
      let imageUrl = null

      while (!completed && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const status_response = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              'Authorization': `Token ${apiKey}`
            }
          }
        )

        const status_data = await status_response.json()

        if (status_data.status === 'succeeded' && status_data.output) {
          completed = true
          imageUrl = status_data.output[0]
        } else if (status_data.status === 'failed') {
          console.warn(`⚠️ Replicate falló: ${status_data.error}`)
          return null
        }

        attempts++
      }

      if (imageUrl) {
        console.log(`✅ Imagen Replicate generada`)
        return imageUrl
      }
    }

    return null
  } catch (error) {
    console.warn(`⚠️ Error generando imagen Replicate:`, error.message)
    return null
  }
}

export async function POST(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { topic, format, brain: brandData, quantity, conversationHistory } = await request.json()

    if (!topic) {
      return Response.json(
        { error: 'Topic es requerido' },
        { status: 400 }
      )
    }

    // Asegurar que brain es un objeto válido
    const brain = brandData || {}

    // Usar cantidad solicitada o defaults
    const qty = Math.min(quantity || (format === 'carrusel' ? 6 : 4), 10)

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada en servidor' },
        { status: 500 }
      )
    }

    // ============= GENERAR IMÁGENES CON REPLICATE (FLUX) =============
    console.log(`📸 Iniciando generación de imágenes para ${qty} mockups...`)
    let generatedImageUrl = null

    // Generar imagen con Replicate (Flux - alta calidad)
    const imageType = format === 'carrusel' ? 'banner' : 'producto'
    generatedImageUrl = await generateImageReplicate(topic, 'professional', imageType, brain)

    let imageInsertionNotes = ''
    if (generatedImageUrl) {
      imageInsertionNotes = `\nIMAGEN DISPONIBLE: Imagen generada con Replicate integrada en mockups`
      console.log(`✅ Imagen Replicate disponible para mockups`)
    } else {
      console.log(`⚠️ Sin imagen Replicate, continuando con gradientes`)
    }

    // Extraer colores y estilos del análisis visual
    let brandColors = {
      primary: '#6860EE',
      secondary: '#F5A623',
      accent: '#FF6B6B'
    }
    let brandTypography = 'sans-serif'
    let visualStyle = 'moderno'

    if (brain && brain.visualAssets?.analysis) {
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
    if (brain?.color_primario) {
      brandColors.primary = brain.color_primario.split('(')[0].trim()
    }
    if (brain?.color_secundario) {
      brandColors.secondary = brain.color_secundario.split('(')[0].trim()
    }
    if (brain?.tipografia_principal) {
      brandTypography = brain.tipografia_principal
    }

    // Preparar info detallada sobre imágenes
    let visualAnalysisText = ''
    let imagesInfo = ''
    if (brain?.visualAssets?.images && brain.visualAssets.images.length > 0) {
      imagesInfo = `\n⚠️ IMÁGENES DISPONIBLES: ${brain.visualAssets.images.length} referencias de la marca subidas`
      imagesInfo += '\nDEBES ANALIZAR Y USAR ESTAS IMÁGENES para decidir:'
      imagesInfo += '\n- Si usar imágenes reales de productos (imageIndex: número de imagen a usar)'
      imagesInfo += '\n- O si usar recursos gráficos similares al estilo de las referencias'
      imagesInfo += '\nPara CADA anuncio: incluye "imageIndex": N (0-' + (brain.visualAssets.images.length - 1) + ') o null si no usas imagen'
      imagesInfo += '\nTambién incluye "imageStrategy": "product" | "graphic" | "illustration" | "photography"'
      imagesInfo += '\nY "imageDescription": breve descripción de qué imagen se mostraría'

      if (brain?.visualAssets?.analysis?.fotografia) {
        visualAnalysisText = `\nESTILO VISUAL ANALIZADO: ${brain.visualAssets.analysis.fotografia.estilo || 'moderno'}`
        if (brain.visualAssets.analysis.fotografia.composicion) {
          visualAnalysisText += `\nComposición: ${brain.visualAssets.analysis.fotografia.composicion}`
        }
        if (brain.visualAssets.analysis.fotografia.recomendaciones) {
          visualAnalysisText += `\nRecomendaciones: ${brain.visualAssets.analysis.fotografia.recomendaciones}`
        }
      }
    }

    // Construir system prompt (optimized for token efficiency)
    const system = await brainToPromptSystem(brain) +
      `\nGenerate ad mockups as JSON. Respond ONLY JSON valid format.
      IMPORTANT: Use ONLY these brand colors - Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary}.
      For buttons (accentColor): MUST use Secondary color ${brandColors.secondary}.
      For backgrounds: use Primary or gradients of Primary.
      Style: ${visualStyle}.
      ${generatedImageUrl ? `📸 IMAGE AVAILABLE: ${generatedImageUrl}` : 'No generated images.'}
      ${brain?.visualAssets?.images?.length ? `Also have ${brain.visualAssets.images.length} reference images available.` : ''}`

    let userPrompt = `Create EXACTLY ${qty} ad mockups for: ${topic}
Format: Instagram Post, Story, Facebook, LinkedIn. Include impact headline, copy, CTA.
STRICT: All buttons use accentColor: "${brandColors.secondary}". No other colors for CTAs.
${generatedImageUrl ? `IMPORTANT: Use this generated image URL in mockups: ${generatedImageUrl}` : ''}
Return JSON: {topic,ads:[{type,headline,body,cta,imageUrl,imageDescription,bgGradient,textColor,accentColor}]}.
For each ad: include "imageUrl" (the generated image URL if appropriate) or null, plus "imageDescription" explaining the visual.`

    // Agregar contexto de conversaciones previas si está disponible
    if (conversationHistory && conversationHistory.length > 0) {
      userPrompt += `\n\n### Context from Previous Brand Conversations:\n${conversationHistory}\n\nUse this context to align the generated content with previous brand insights and strategies.`
    }

    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('generate'),
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
      const textColor = ad.textColor || '#FFFFFF'
      const accentColor = ad.accentColor || brandColors.secondary
      const imageInfo = ad.imageDescription ? `\n<div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-style: italic;">📸 ${ad.imageDescription}</div>` : ''

      // ============= USAR IMAGEN GENERADA CON FAL.AI =============
      let bgImageStyle = ''
      let useImage = false

      // Prioritario: usar imagen generada por Fal.ai
      if (generatedImageUrl && ad.imageUrl !== false && ad.imageUrl !== 'null') {
        // Usar imagen con overlay oscuro para mejorar legibilidad del texto
        bgImageStyle = `background-image: linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${generatedImageUrl}'); background-size: cover; background-position: center;`
        useImage = true
        console.log(`✅ Mockup ${idx + 1} usando imagen Fal.ai`)
      }
      // Fallback: usar imagen referencia del visualAssets si existe
      else if (brain?.visualAssets?.images && brain.visualAssets.images.length > 0 && ad.imageUrl) {
        const imageIndex = ad.imageUrl && typeof ad.imageUrl === 'number' ? parseInt(ad.imageUrl) : null
        if (imageIndex !== null && imageIndex >= 0 && imageIndex < brain.visualAssets.images.length) {
          const selectedImage = brain.visualAssets.images[imageIndex]
          const imageData = selectedImage?.data || selectedImage
          if (imageData && imageData.length > 50) {
            bgImageStyle = `background-image: linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${imageData}'); background-size: cover; background-position: center;`
            useImage = true
          }
        }
      }

      // Si no hay imagen, usar gradiente de marca
      if (!useImage) {
        bgImageStyle = `background: ${gradient};`
      }

      if (adType.includes('instagram') || adType === 'instagram') {
        // Usar templates avanzados de Custer con tipografía de marca
        html = getAdvancedTemplates(ad, idx, brandColors, visualStyle, brandTypography)
      } else if (adType.includes('story') || adType === 'story') {
        html = `
          <div style="width: 100%; max-width: 350px; aspect-ratio: 9/16; ${bgImageStyle || `background: ${gradient};`} border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: space-between; padding: 40px 20px; color: ${textColor}; font-family: '${brandTypography}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${ad.headline || ''}</div>
            </div>
            <div style="text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 14px; line-height: 1.6; margin-bottom: 30px; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${ad.body || ''}</div>
            </div>
            <button style="background: ${accentColor}; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; font-size: 14px;">${ad.cta || 'Tap para más'}</button>
            ${imageInfo}
          </div>
        `
      } else if (adType.includes('facebook') || adType === 'facebook') {
        html = `
          <div style="width: 100%; max-width: 600px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: '${brandTypography}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="${bgImageStyle || `background: ${gradient};`} aspect-ratio: 1.91 / 1; display: flex; align-items: center; justify-content: center; color: white; padding: 40px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">${ad.headline || ''}</div>
            </div>
            <div style="padding: 20px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 12px; font-weight: 500;">Patrocinado</div>
              <div style="font-size: 16px; line-height: 1.5; color: #1f2937; margin-bottom: 16px;">${ad.body || ''}</div>
              <button style="background: ${accentColor}; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%; font-size: 15px;">${ad.cta || 'Más información'}</button>
              ${imageInfo}
            </div>
          </div>
        `
      } else if (adType.includes('linkedin') || adType === 'linkedin') {
        html = `
          <div style="width: 100%; max-width: 600px; background: white; border: 1px solid #d0d3d7; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-family: '${brandTypography}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
              <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Patrocinado</div>
              <div style="font-size: 16px; font-weight: 600; color: #000;">${ad.headline || ''}</div>
            </div>
            <div style="${bgImageStyle || `background: ${gradient};`} padding: 40px; color: white; text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${ad.body || ''}</div>
            </div>
            <div style="padding: 16px;">
              <button style="background: ${accentColor}; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px;">${ad.cta || 'Más información'}</button>
              ${imageInfo}
            </div>
          </div>
        `
      } else {
        // Default a Instagram si no reconoce el tipo
        html = `
          <div style="width: 100%; max-width: 500px; background: ${gradient}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
            <div style="aspect-ratio: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 40px; color: ${textColor}; font-family: '${brandTypography}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
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
      ads: adsWithHTML,
      imageAnalysis: {
        hasImages: brain.visualAssets?.images?.length > 0,
        imageCount: brain.visualAssets?.images?.length || 0,
        visualStyle: visualStyle,
        recommendation: 'El generador analizó las imágenes de referencia y decidió automáticamente qué imagen real o recurso gráfico usar para cada anuncio'
      }
    })
  } catch (error) {
    console.error('Error en /api/generate:', error)
    return Response.json(
      { error: error.message || 'Error generando carousel' },
      { status: 500 }
    )
  }
}
