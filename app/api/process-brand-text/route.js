/**
 * POST /api/process-brand-text
 * Procesa texto para extraer datos de marca usando Gemini
 */

import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: 'Texto requerido' }, { status: 400 })
    }

    const prompt = `Extract brand information from this text and return JSON with any found fields. Structure:
- basico: {nombre, rubro, ciudad, propuesta}
- estrategico: {mision, vision, valores[], beneficios_funcionales, beneficios_emocionales}
- audiencia: {publico_objetivo, audiencia_real, pain_points[], gains[], motivaciones, comportamiento_digital}
- identidad: {voz_tono, claim, narrativa, territorio_creativo}
- visual: {tipografia, colores: {primario, secundario, acentos[]}, estilo_visual, recursos_graficos, sistema_grafico, mood_board}
- posicionamiento: {competencia[], diferenciadores[], propuesta_unica}
- implementacion: {canales[], formatos[], frecuencia}
- comunicacion: {keywords[], avoid[], tonalidad[], ejemplos, registro}

Return ONLY JSON. Use null for missing fields.

TEXT:
${text}`

    const systemPrompt = 'Eres experto en branding estratégico. Extrae TODA información del texto. Responde SOLO JSON válido sin markdown.'

    const result = await callGeminiJSON(prompt, systemPrompt, { maxTokens: 4000 })

    const defaultBrand = {
      nombre: null,
      rubro: null,
      ciudad: null,
      propuesta: null,
      public: null,
      tipografia: null,
      registro: null,
      keywords: [],
      avoid: [],
      tonalidad: [],
      ejemplos: null
    }

    const brandData = { ...defaultBrand, ...result }

    return Response.json({
      success: true,
      brand: brandData,
      _meta: result._usage || {}
    })
  } catch (error) {
    console.error('Error en /api/process-brand-text:', error.message)
    return Response.json(
      { error: 'Error procesando texto: ' + error.message },
      { status: 500 }
    )
  }
}