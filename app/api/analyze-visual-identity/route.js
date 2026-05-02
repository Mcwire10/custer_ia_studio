/**
 * POST /api/analyze-visual-identity
 * Analiza identidad visual de múltiples imágenes usando Gemini Vision
 */

import { callGeminiVisionJSON } from '@/lib/gemini'

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

    console.log(`🎨 Analizando ${images.length} imágenes para ${brandName || 'untitled'}`)

    const prompt = `Analyze ${images.length} brand images for "${brandName || 'untitled'}" visual identity.
Return JSON: {colores:[{hex,rgb,nombre,uso,frecuencia}],tipografia:[{familia,peso,uso,estilo}],fotografia:{},elementos_graficos:{},sistema_visual:{},recomendaciones:{},resumen:""}
INSTRUCTIONS: Be specific with hex codes, identify real typefaces, extract 5-7 main colors, detail photography treatment, note repeated graphic elements. Respond ONLY valid JSON.`

    const systemPrompt = 'Eres experto en diseño y branding visual. Analiza imágenes con detalle profesional. Responde SOLO JSON válido sin markdown.'

    let visualAnalysis = await callGeminiVisionJSON(images, prompt, systemPrompt, { maxTokens: 6000 })

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