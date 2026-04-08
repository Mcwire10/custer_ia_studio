/**
 * POST /api/generate-image-gemini
 * Genera imágenes usando Google Gemini (Imagen capability)
 * Requiere: GEMINI_API_KEY en .env
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getGeminiKey() {
  let apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/GEMINI_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/GEMINI_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

function buildImagePrompt(theme, style, type, brand) {
  let prompt = ''

  if (type === 'producto') {
    prompt = `${theme}. Professional product photography, high quality, photorealistic.
    Clean white or minimalist background, perfect studio lighting, detailed, 8k resolution.
    ${brand?.visual?.colores?.primario ? `Accent color: ${brand.visual.colores.primario}` : ''}
    Professional commercial product photo, sharp focus, bright lighting`
  } else if (type === 'mockup') {
    prompt = `${theme}. Modern graphic design mockup, clean professional layout, ${style || 'minimalist'}.
    ${brand?.basico?.nombre ? `Brand: ${brand.basico.nombre}` : ''}
    Professional design, high quality, 8k resolution, polished appearance`
  } else if (type === 'banner') {
    prompt = `${theme}. Professional advertising banner, eye-catching, ${style || 'modern'}.
    ${brand?.identidad?.claim ? `Tagline: "${brand.identidad.claim}"` : ''}
    Vibrant colors, readable text, professional design, 8k quality, impactful composition`
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

    const apiKey = getGeminiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY no configurada' },
        { status: 500 }
      )
    }

    const imagePrompt = buildImagePrompt(theme, style, type, brand)

    console.log(`🎨 Generando imagen con Gemini...`)
    console.log(`   Tipo: ${type}`)
    console.log(`   Prompt: ${imagePrompt.substring(0, 100)}...`)

    // Usar Gemini API v1beta para generar imágenes
    const gemini_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const gemini_response = await fetch(gemini_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate a high-quality image of: ${imagePrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    })

    if (!gemini_response.ok) {
      const error = await gemini_response.json()
      console.error('Error Gemini:', error)

      // Si falla, intentar con búsqueda de imágenes alternativa
      console.warn('⚠️ Gemini no pudo generar. Intentando alternativa...')
      return Response.json(
        { error: `Gemini error: ${error.error?.message || gemini_response.status}` },
        { status: 500 }
      )
    }

    const gemini_data = await gemini_response.json()

    // Gemini puede devolver texto con URL de imagen o imagen directa
    if (gemini_data.candidates && gemini_data.candidates.length > 0) {
      const content = gemini_data.candidates[0].content

      if (content.parts && content.parts.length > 0) {
        const part = content.parts[0]

        // Si contiene inline_data (imagen), convertir a data URL
        if (part.inlineData && part.inlineData.data) {
          const imageBase64 = part.inlineData.data
          const imageUrl = `data:${part.inlineData.mimeType};base64,${imageBase64}`

          console.log(`✅ Imagen generada por Gemini`)
          return Response.json({
            success: true,
            image: {
              url: imageUrl,
              prompt: imagePrompt,
              type: type,
              style: style,
              model: 'gemini-2.0-flash'
            }
          })
        }

        // Si contiene texto con descripción
        if (part.text) {
          console.log(`📝 Gemini respondió: ${part.text.substring(0, 100)}`)
          // Retornar null para usar gradiente como fallback
          return Response.json({
            success: false,
            message: 'Gemini no generó imagen, usando fallback'
          })
        }
      }
    }

    return Response.json(
      { error: 'Gemini no devolvió imagen válida' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error en /api/generate-image-gemini:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
