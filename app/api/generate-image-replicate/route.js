/**
 * POST /api/generate-image-replicate
 * Genera imágenes usando Replicate API
 * Modelos disponibles: Flux, Stable Diffusion 3, SDXL
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getReplicateKey() {
  let apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/REPLICATE_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/REPLICATE_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

function buildImagePrompt(theme, style, type, brand) {
  let prompt = ''

  if (type === 'producto') {
    prompt = `${theme}. Professional product photography, ultra high quality, photorealistic.
    Clean white or minimalist background, perfect studio lighting, sharp focus, detailed textures, 8k resolution.
    ${brand?.visual?.colores?.primario ? `Color: ${brand.visual.colores.primario}` : ''}
    Commercial product photo, bright professional lighting`
  } else if (type === 'mockup') {
    prompt = `${theme}. Modern graphic design mockup, clean professional layout, ${style || 'minimalist'}.
    ${brand?.basico?.nombre ? `Brand: ${brand.basico.nombre}` : ''}
    Professional design, high quality, polished appearance, 8k resolution`
  } else if (type === 'banner') {
    prompt = `${theme}. Professional advertising banner, eye-catching, ${style || 'modern'}.
    ${brand?.identidad?.claim ? `Claim: "${brand.identidad.claim}"` : ''}
    Vibrant colors, readable text, professional composition, 8k quality, impactful design`
  } else {
    prompt = `${theme}. Professional ${style || 'modern'} design, high quality, polished, 8k resolution`
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

    const apiKey = getReplicateKey()
    if (!apiKey) {
      return Response.json(
        { error: 'REPLICATE_API_KEY no configurada' },
        { status: 500 }
      )
    }

    const imagePrompt = buildImagePrompt(theme, style, type, brand)

    console.log(`🎨 Generando imagen con Replicate...`)
    console.log(`   Tipo: ${type}`)
    console.log(`   Prompt: ${imagePrompt.substring(0, 100)}...`)

    // Usar Flux Schnell (mejor calidad, rápido)
    const model = 'black-forest-labs/flux-schnell'

    const replicate_response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: {
          prompt: imagePrompt,
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
      const error = await replicate_response.json()
      console.error('Error Replicate:', error)
      throw new Error(error.detail || `Replicate error: ${replicate_response.status}`)
    }

    const prediction = await replicate_response.json()

    // Replicate devuelve un prediction ID, necesitamos esperar a que se complete
    if (prediction.id) {
      console.log(`⏳ Esperando generación de imagen (ID: ${prediction.id})...`)

      // Esperar hasta que esté completo (máximo 60 segundos)
      let completed = false
      let attempts = 0
      let imageUrl = null

      while (!completed && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 500)) // Esperar 500ms

        const status_response = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              'Authorization': `Token ${apiKey}`
            }
          }
        )

        const status_data = await status_response.json()

        if (status_data.status === 'succeeded') {
          completed = true
          if (status_data.output && status_data.output.length > 0) {
            imageUrl = status_data.output[0]
          }
        } else if (status_data.status === 'failed') {
          throw new Error(`Replicate generación falló: ${status_data.error}`)
        }

        attempts++
      }

      if (!completed) {
        throw new Error('Timeout esperando generación de imagen')
      }

      if (imageUrl) {
        console.log(`✅ Imagen generada: ${imageUrl.substring(0, 60)}...`)

        // Descargar imagen y convertir a data URL
        try {
          const imageResponse = await fetch(imageUrl)
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer()
            const imageBase64 = Buffer.from(imageBuffer).toString('base64')
            const dataUrl = `data:image/png;base64,${imageBase64}`

            return Response.json({
              success: true,
              image: {
                url: dataUrl,
                prompt: imagePrompt,
                type: type,
                style: style,
                model: 'flux-schnell',
                source_url: imageUrl
              }
            })
          }
        } catch (e) {
          // Si no puede descargar, devolver URL directa
          console.warn('⚠️ No pudo descargar imagen, usando URL directa')
          return Response.json({
            success: true,
            image: {
              url: imageUrl,
              prompt: imagePrompt,
              type: type,
              style: style,
              model: 'flux-schnell',
              direct_url: true
            }
          })
        }
      }
    }

    return Response.json(
      { error: 'No se generó imagen válida' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error en /api/generate-image-replicate:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
