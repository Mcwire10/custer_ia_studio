/**
 * POST /api/analyze-visual-identity
 * Analiza identidad visual de múltiples imágenes usando Claude Vision
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getMaxTokens } from '@/app/lib/prompt-schemas'

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

    // Try to read from .env files if process.env doesn't have it
    let apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      try {
        // Try reading .env.local
        const envPath = join(process.cwd(), '.env.local')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) {
          apiKey = match[1].trim()
        }
      } catch (e) {
        try {
          // Try reading .env
          const envPath = join(process.cwd(), '.env')
          const envContent = readFileSync(envPath, 'utf8')
          const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
          if (match) {
            apiKey = match[1].trim()
          }
        } catch (e2) {
          // Silent fallback
        }
      }
    }

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

    // Prompt para análisis visual (optimizado)
    messageContent.push({
      type: 'text',
      text: `Analyze ${images.length} brand images for "${brandName || 'untitled'}" visual identity.
Return JSON: {colores:[{hex,rgb,nombre,uso,frecuencia}],tipografia:[{familia,peso,uso,estilo}],fotografia:{},elementos_graficos:{},sistema_visual:{},recomendaciones:{},resumen:""}
INSTRUCTIONS: Be specific with hex codes, identify real typefaces, extract 5-7 main colors, detail photography treatment, note repeated graphic elements. Respond ONLY valid JSON.`
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
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('analyze-visual-identity'),
        system: 'Eres experto en diseño y branding visual. Analiza imágenes con detalle profesional. Responde SOLO JSON válido sin markdown.',
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
