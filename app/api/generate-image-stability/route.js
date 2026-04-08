/**
 * POST /api/generate-image-stability
 * Genera imágenes usando Stability AI (SDXL/Stable Diffusion 3)
 * Gratis: 100 imágenes/mes
 * Soporta: productos, mockups, banners
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getApiKey() {
  let apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/STABILITY_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/STABILITY_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

function buildImagePrompt(theme, style, type, brand) {
  // Construir prompt optimizado para Stability AI
  let prompt = ''

  if (type === 'producto') {
    prompt = `${theme}. Professional product photography, high quality, photorealistic.
    Clean white background or minimal setting. Perfect lighting, 8k resolution.
    ${brand?.visual?.colores?.primario ? `Color accent: ${brand.visual.colores.primario}` : ''}
    Style: ${style || 'professional'}, commercial photography`
  } else if (type === 'mockup') {
    prompt = `${theme}. Modern graphic design mockup, clean layout, ${style || 'minimalist'}.
    ${brand?.basico?.nombre ? `Brand: ${brand.basico.nombre}` : ''}
    Professional design, 8k resolution, high quality`
  } else if (type === 'banner') {
    prompt = `${theme}. Professional advertising banner, eye-catching, ${style || 'modern'}.
    ${brand?.identidad?.claim ? `Tagline: ${brand.identidad.claim}` : ''}
    Vibrant colors, readable text, professional design, 8k quality`
  } else {
    prompt = `${theme}. Professional ${style || 'modern'} design, high quality, 8k resolution, polished`
  }

  return prompt
}

export async function POST(request) {
  try {
    const { theme, style = 'professional', type = 'producto', brand } = await request.json()

    if (!theme?.trim()) {
      return Response.json(
        { error: 'Tema requerido para generar imagen' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'STABILITY_API_KEY no configurada. Obtén una en https://platform.stability.ai/account/keys' },
        { status: 500 }
      )
    }

    // Construir prompt optimizado
    const imagePrompt = buildImagePrompt(theme, style, type, brand)

    console.log(`📸 Generando imagen con Stability AI...`)
    console.log(`   Tipo: ${type}`)
    console.log(`   Prompt: ${imagePrompt.substring(0, 100)}...`)

    // Llamar a Stability AI (usando SDXL 1.0 - mejor calidad, gratis)
    const stability_response = await fetch('https://api.stability.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        negative_prompt: 'blurry, low quality, distorted, ugly, amateur',
        steps: 30,
        cfgScale: 7.0,
        width: 1024,
        height: 768,
        samples: 1,
        sampler: 'K_DPM_2_ANCESTRAL'
      })
    })

    if (!stability_response.ok) {
      const error = await stability_response.json()
      console.error('Error Stability AI:', error)
      throw new Error(error.message || `Stability AI error: ${stability_response.status}`)
    }

    const data = await stability_response.json()

    if (!data.artifacts || data.artifacts.length === 0) {
      throw new Error('No se generó imagen')
    }

    // La imagen viene en base64, necesitamos convertirla a URL data
    const imageBase64 = data.artifacts[0].base64
    const imageUrl = `data:image/png;base64,${imageBase64}`

    console.log(`✅ Imagen generada (${imageBase64.length} bytes)`)

    return Response.json({
      success: true,
      image: {
        url: imageUrl,
        prompt: imagePrompt,
        type: type,
        style: style,
        model: 'stable-diffusion-xl-1024-v1-0',
        size: imageBase64.length
      }
    })
  } catch (error) {
    console.error('Error en /api/generate-image-stability:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
