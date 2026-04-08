/**
 * POST /api/generate-image-fal
 * Genera imágenes usando Fal.ai (Flux)
 * Soporta: productos, mockups, banners
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getApiKey() {
  let apiKey = process.env.FAL_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/FAL_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/FAL_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

function buildImagePrompt(theme, style, type, brand) {
  // Construir prompt optimizado para generar imágenes
  let prompt = ''

  if (type === 'producto') {
    prompt = `${theme}. Producto de alta calidad, fotorrealista, sobre fondo limpio y minimalista.
    ${brand?.visual?.colores?.primario ? `Colores de marca: ${brand.visual.colores.primario}` : ''}
    Estilo: ${style || 'profesional'}. Luz natural, 8k`
  } else if (type === 'mockup') {
    prompt = `${theme}. Mockup de diseño gráfico, layout moderno, ${style || 'minimalista'}.
    ${brand?.basico?.nombre ? `Marca: ${brand.basico.nombre}` : ''}
    Colores: ${brand?.visual?.colores?.primario || '#000000'}.
    Estilo: limpio, profesional, 8k`
  } else if (type === 'banner') {
    prompt = `${theme}. Banner publicitario horizontal, llamativo, ${style || 'moderno'}.
    ${brand?.basico?.nombre ? `Para: ${brand.basico.nombre}` : ''}
    Claim: ${brand?.identidad?.claim || 'mensaje impactante'}
    Colores vibrantes, texto legible, 8k`
  } else {
    prompt = `${theme}. Estilo: ${style || 'moderno'}. Alta calidad, profesional, 8k`
  }

  return prompt
}

export async function POST(request) {
  try {
    const { theme, style = 'moderno', type = 'producto', brand } = await request.json()

    if (!theme?.trim()) {
      return Response.json(
        { error: 'Tema requerido para generar imagen' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'FAL_API_KEY no configurada. Obtén una en https://fal.ai/dashboard' },
        { status: 500 }
      )
    }

    // Construir prompt optimizado
    const imagePrompt = buildImagePrompt(theme, style, type, brand)

    console.log(`📸 Generando imagen con Fal.ai...`)
    console.log(`   Tipo: ${type}`)
    console.log(`   Prompt: ${imagePrompt.substring(0, 100)}...`)

    // Llamar a Fal.ai (usando el modelo Flux por defecto)
    const fal_response = await fetch('https://api.fal.ai/v1/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        image_size: 'landscape_16_9', // Para banners y mockups
        num_images: 1,
        model: 'fal-ai/flux-pro', // Mejor calidad
        safety_tolerance: 6 // Balance entre creatividad y seguridad
      })
    })

    if (!fal_response.ok) {
      const error = await fal_response.json()
      console.error('Error Fal.ai:', error)
      throw new Error(error.error?.message || `Fal.ai error: ${fal_response.status}`)
    }

    const data = await fal_response.json()

    if (!data.images || data.images.length === 0) {
      throw new Error('No se generó imagen')
    }

    const imageUrl = data.images[0].url

    console.log(`✅ Imagen generada: ${imageUrl.substring(0, 80)}...`)

    return Response.json({
      success: true,
      image: {
        url: imageUrl,
        prompt: imagePrompt,
        type: type,
        style: style,
        model: 'fal-ai/flux-pro'
      }
    })
  } catch (error) {
    console.error('Error en /api/generate-image-fal:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
