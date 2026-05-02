/**
 * POST /api/coach-analyze
 * Coach de Marketing & Diseño - Análisis educativo profundo usando Gemini
 */

import { callGeminiJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const {
      content,
      content_type = 'copy',
      brand,
      objetivo = 'general',
      target_platform = 'instagram'
    } = await request.json()

    if (!content?.trim()) {
      return Response.json({ error: 'Contenido vacío' }, { status: 400 })
    }

    if (!brand?.nombre) {
      return Response.json({ error: 'Datos de marca requeridos' }, { status: 400 })
    }

    const brandContext = `
MARCA: ${brand.nombre}
Rubro: ${brand.rubro}
Propuesta: ${brand.propuesta}

IDENTIDAD VISUAL:
- Colores: ${brand.color_primario || 'N/A'} (primario), ${brand.color_secundario || 'N/A'} (secundario)
- Tipografía: ${brand.tipografia_principal || brand.tipografia || 'N/A'}
- Estilo: ${brand.estilo_visual || 'N/A'}

POSICIONAMIENTO:
- Claim: ${brand.claim || 'N/A'}
- Propuesta Única: ${brand.propuesta_unica || 'N/A'}
- Diferenciadores: ${brand.diferenciadores?.join(', ') || 'N/A'}

TONO DE VOZ:
- Registro: ${brand.registro || 'N/A'}
- Keywords: ${brand.keywords?.join(', ') || 'N/A'}
- Palabras a evitar: ${brand.avoid?.join(', ') || 'N/A'}
- Tonalidad: ${brand.tonalidad?.join(', ') || 'N/A'}

AUDENCIA TARGET:
- Público: ${brand.publico || 'N/A'}
- Pain Points: ${brand.pain_points?.join(', ') || 'N/A'}
- Motivaciones: ${brand.motivaciones || 'N/A'}
`

    let systemPrompt = `Eres un COACH DE MARKETING & DISEÑO experto. Tu misión es ENSEÑAR mientras mejoras.

${brandContext}

Tu rol:
1. ANALIZAR el contenido contra la identidad de marca
2. EXPLICAR por qué cada cambio mejora (educativo, no arrogante)
3. CONTEXTUALIZAR con datos reales de la marca
4. RECOMENDAR estrategia futura (coaching, no órdenes)

NUNCA devuelvas:
- Sugerencias genéricas sin contexto
- "Mejora esto" sin explicar POR QUÉ
- Cambios que no alinean con la identidad

SIEMPRE devuelve:
- Versión mejorada (listo para copiar/pegar)
- Principio de marketing aplicado
- Contexto de marca
- Emoción que genera cada cambio
- Siguiente paso recomendado (coaching)

RESPONDE SIEMPRE EN JSON VÁLIDO.`

    const userPrompt = `[${content_type.toUpperCase()}] Objetivo: ${objetivo} | Plataforma: ${target_platform}

Contenido a analizar:
"""
${content}
"""

Analiza como coach educativo. Explica el POR QUÉ de cada cambio.`

    const result = await callGeminiJSON(userPrompt, systemPrompt, { maxTokens: 3000 })

    return Response.json({
      success: true,
      coach_analysis: result,
      metadata: {
        content_type,
        objetivo,
        target_platform,
        marca: brand.nombre,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error en /api/coach-analyze:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}