/**
 * POST /api/process-brand-text
 * Procesa texto para extraer datos de marca
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { logTokenUsage } from '@/app/lib/token-optimizer'
import { COMPACT_SCHEMA_INSTRUCTION, getMaxTokens } from '@/app/lib/prompt-schemas'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: 'Texto requerido' }, { status: 400 })
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

    // Llamar a Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: getMaxTokens('process-brand-text'),
        system: 'Eres experto en branding estratégico. Extrae TODA información del texto. Responde SOLO JSON válido sin markdown.',
        messages: [
          {
            role: 'user',
            content: `Extract brand information from this text and return JSON with any found fields. Structure:
- basico: {nombre, rubro, ciudad, propuesta}
- estrategico: {mision, vision, valores[], beneficios_funcionales, beneficios_emocionales}
- audiencia: {publico_objetivo, audiencia_real, pain_points[], gains[], motivaciones, comportamiento_digital}
- identidad: {voz_tono, claim, narrativa, territorio_creativo}
- visual: {tipografia, colores: {primario, secundario, acentos[]}, estilo_visual, recursos_graficos, sistema_grafico, mood_board}
- posicionamiento: {competencia[], diferenciadores[], propuesta_unica}
- implementacion: {canales[], formatos[], frecuencia}
- comunicacion: {keywords[], avoid[], tonalidad[], ejemplos, registro}

Return ONLY JSON. Use null for missing fields.\n\nTEXT:\n${text}`
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

    // Parsear JSON con fallback robusto
    let brandData = null
    try {
      // Intentar parsear directo
      brandData = JSON.parse(responseText)
    } catch (parseError) {
      // Si falla, intentar extraer JSON válido
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          brandData = JSON.parse(jsonMatch[0])
        } catch (e) {
          // Última opción: devolver estructura por defecto
          console.error('No se pudo parsear JSON:', parseError.message)
          brandData = {}
        }
      } else {
        brandData = {}
      }
    }

    // Asegurar estructura correcta
    const defaultBrand = {
      nombre: null,
      rubro: null,
      ciudad: null,
      propuesta: null,
      publico: null,
      tipografia: null,
      registro: null,
      keywords: [],
      avoid: [],
      tonalidad: [],
      ejemplos: null
    }

    brandData = { ...defaultBrand, ...brandData }

    // Log token usage para optimización automática
    const promptTokens = data.usage?.input_tokens || 0
    const completionTokens = data.usage?.output_tokens || 0
    logTokenUsage('processBrandText', promptTokens, completionTokens, promptTokens + completionTokens, true)

    return Response.json({
      success: true,
      brand: brandData,
      _meta: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      }
    })
  } catch (error) {
    console.error('Error en /api/process-brand-text:', error.message)
    return Response.json(
      { error: 'Error procesando texto: ' + error.message },
      { status: 500 }
    )
  }
}
