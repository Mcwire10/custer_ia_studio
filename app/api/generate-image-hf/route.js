/**
 * POST /api/generate-image-hf
 * Genera imágenes usando Hugging Face Inference API
 * Completamente gratis (sin API key requerida, token opcional para mayor velocidad)
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getHFToken() {
  let token = process.env.HUGGINGFACE_TOKEN
  if (!token) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/HUGGINGFACE_TOKEN=(.+)/)
      if (match) token = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/HUGGINGFACE_TOKEN=(.+)/)
        if (match) token = match[1].trim()
      } catch (e2) {}
    }
  }
  return token || null
}

function buildImagePrompt(theme, style, type, brand) {
  let prompt = ''

  if (type === 'producto') {
    prompt = `${theme}. Professional product photography, high quality, photorealistic.
    Clean white or minimal background, perfect studio lighting, detailed, 8k.
    ${brand?.visual?.colores?.primario ? `Color: ${brand.visual.colores.primario}` : ''}
    Professional commercial product photo`
  } else if (type === 'mockup') {
    prompt = `${theme}. Modern graphic design mockup, clean professional layout, ${style || 'minimalist'}.
    ${brand?.basico?.nombre ? `For brand: ${brand.basico.nombre}` : ''}
    Professional design, high quality, 8k resolution`
  } else if (type === 'banner') {
    prompt = `${theme}. Professional advertising banner, eye-catching, ${style || 'modern'}.
    ${brand?.identidad?.claim ? `Tagline: ${brand.identidad.claim}` : ''}
    Vibrant colors, readable text, professional design, 8k quality`
  } else {
    prompt = `${theme}. ${style || 'Modern'} professional design, high quality, polished, 8k`
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

    const hfToken = getHFToken()
    const imagePrompt = buildImagePrompt(theme, style, type, brand)

    console.log(`🎨 Generando imagen con Hugging Face...`)
    console.log(`   Tipo: ${type}`)
    console.log(`   Prompt: ${imagePrompt.substring(0, 100)}...`)

    // Usar modelo de Hugging Face (Stable Diffusion 2.1 es gratuito)
    const hf_model = 'stabilityai/stable-diffusion-2-1'
    const hf_url = `https://api-inference.huggingface.co/models/${hf_model}`

    const headers = {
      'Content-Type': 'application/json'
    }

    // Agregar token si está disponible (para mayor velocidad)
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`
    }

    const hf_response = await fetch(hf_url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: imagePrompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted, ugly, amateur, bad',
          guidance_scale: 7.5,
          num_inference_steps: 20
        }
      })
    })

    if (!hf_response.ok) {
      const error = await hf_response.text()
      console.error('Error HF:', error)
      throw new Error(`Hugging Face error: ${hf_response.status}`)
    }

    // La respuesta es directamente la imagen en blob
    const imageBuffer = await hf_response.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')
    const imageUrl = `data:image/png;base64,${imageBase64}`

    console.log(`✅ Imagen generada (${imageBase64.length} bytes)`)

    return Response.json({
      success: true,
      image: {
        url: imageUrl,
        prompt: imagePrompt,
        type: type,
        style: style,
        model: hf_model,
        size: imageBase64.length,
        token_used: !!hfToken
      }
    })
  } catch (error) {
    console.error('Error en /api/generate-image-hf:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
