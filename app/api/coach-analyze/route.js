/**
 * POST /api/coach-analyze
 * Coach de Marketing & Diseño - Análisis educativo profundo
 *
 * Actúa como un COACH real que:
 * ✅ Explica el POR QUÉ de cada cambio
 * ✅ Usa contexto completo de la marca
 * ✅ Enseña mientras mejora
 * ✅ Sugiere estrategia futura
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

export async function POST(request) {
  try {
    const {
      content,
      content_type = 'copy',           // copy | reel | post | carousel
      brand,
      objetivo = 'general',            // awareness | consideration | conversion
      target_platform = 'instagram'
    } = await request.json()

    if (!content?.trim()) {
      return Response.json({ error: 'Contenido vacío' }, { status: 400 })
    }

    if (!brand?.nombre) {
      return Response.json({ error: 'Datos de marca requeridos' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    // ============= CONSTRUCCIÓN DEL CONTEXTO DE MARCA =============
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

AUDIENCIA TARGET:
- Público: ${brand.publico || 'N/A'}
- Pain Points: ${brand.pain_points?.join(', ') || 'N/A'}
- Motivaciones: ${brand.motivaciones || 'N/A'}

HISTORIAL & MÉTRICAS:
- Instagram: ${brand.metricas_redes?.instagram_seguidores || 0} followers, ${brand.metricas_redes?.instagram_engagement || 0}% engagement
- Mejor horario: ${brand.metricas_redes?.mejor_horario || 'N/A'}
- Campaña exitosa: ${brand.campana_exitosa?.nombre || 'N/A'} (${brand.campana_exitosa?.resultado || 'N/A'})
- ROI promedio: ${brand.metricas_negocio?.roi_promedio || 'N/A'}

VIDEO & REELS:
- Duración óptima: ${brand.video_reels?.duracion_optima || 'N/A'}
- Hook style: ${brand.video_reels?.hook_style || 'N/A'}
- Audio favorito: ${brand.video_reels?.audio_favorito?.join(', ') || 'N/A'}
- Pacing: ${brand.video_reels?.pacing_transiciones || 'N/A'}
`

    // ============= PROMPT AL COACH =============
    const systemPrompt = `Eres un COACH DE MARKETING & DISEÑO experto. Tu misión es ENSEÑAR mientras mejoras.

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
- Contexto de marca: "Tu CTR fue X%", "Tu audiencia prefiere Y"
- Emoción que genera cada cambio
- Referencia al historial: "Tuviste éxito con esto"
- Siguiente paso recomendado (coaching)

${content_type === 'reel' ? `
ESPECIAL PARA REELS:
- Analiza hook (primeros 2 segundos)
- Recomienda audio trending
- Sugiere pacing + transiciones
- Caption styling para móvil (legible)
- Duración recomendada
- CTA clear al final
` : ''}

RESPONDE SIEMPRE EN JSON VÁLIDO. No agregues texto fuera del JSON.

ESTRUCTURA JSON ESPERADA:
{
  "analisis_estrategico": {
    "objetivo_detectado": "awareness|consideration|conversion",
    "stage_funnel": "activación|evaluación|conversión",
    "emociones_a_generar": ["emoción1", "emoción2"],
    "plataforma": "instagram|tiktok|linkedin|facebook"
  },

  "version_optimizada": "Texto mejorado listo para copiar/pegar",

  "explicaciones": [
    {
      "cambio": "Cambio 1 breve",
      "principio_marketing": "Principio aplicado",
      "contexto_marca": "Dato específico de TU marca/historial",
      "emocion": "Qué siente usuario",
      "referencia_historial": "Si tuviste éxito con esto antes"
    }
  ],

  "estrategia_futura": {
    "siguiente_paso": "Qué hacer después",
    "como_testear": "A/B test específico",
    "metrica_clave": "Qué medir"
  },

  ${content_type === 'reel' ? `
  "recomendaciones_video": {
    "hook_sugerido": "Tipo de hook para primeros 2 seg",
    "duracion_optima": "Segundos",
    "audio_trending": "Nombre de audio specific",
    "transicion_clave": "Tipo de transición",
    "caption_style": "Instrucciones para captions",
    "cta_recomendado": "CTA claro al final"
  },
  ` : ''}

  "coaching_final": "1-2 líneas de coaching motivacional"
}
`

    // ============= LLAMADA A CLAUDE =============
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `[${content_type.toUpperCase()}] Objetivo: ${objetivo} | Plataforma: ${target_platform}

Contenido a analizar:
"""
${content}
"""

Analiza como coach educativo. Explica el POR QUÉ de cada cambio.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // ============= PARSING DE RESPUESTA =============
    let result = null
    try {
      // Intentar parsear directo
      result = JSON.parse(responseText)
    } catch (e) {
      // Si falla, limpiar markdown y buscar JSON
      let cleanedText = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/\n/g, ' ')
        .replace(/,\s*\]/g, ']')
        .replace(/,\s*\}/g, '}')
        .trim()

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0])
        } catch (parseError) {
          // Fallback: respuesta mínima válida
          result = {
            analisis_estrategico: {
              objetivo_detectado: objetivo,
              stage_funnel: objetivo === 'awareness' ? 'activación' : objetivo === 'consideration' ? 'evaluación' : 'conversión',
              emociones_a_generar: objetivo === 'awareness' ? ['curiosidad', 'empoderamiento'] : ['confianza', 'seguridad']
            },
            version_optimizada: content,
            explicaciones: [
              {
                cambio: 'Contenido alineado con marca',
                principio_marketing: 'Coherencia de mensaje',
                contexto_marca: `Tu marca ${brand.nombre} se posiciona como ${brand.propuesta}`,
                emocion: 'Confianza',
                referencia_historial: brand.campana_exitosa?.nombre ? `Similar a tu éxito en: ${brand.campana_exitosa.nombre}` : 'Patrón probado'
              }
            ],
            estrategia_futura: {
              siguiente_paso: `Testea esta versión en ${target_platform}`,
              como_testear: 'Mide engagement en primeras 24 horas',
              metrica_clave: 'CTR y comentarios (indican conexión emocional)'
            },
            coaching_final: `Cada pequeño cambio que alinea con tu identidad suma. Sigue iterando.`
          }
        }
      } else {
        throw new Error('No se pudo parsear respuesta de Claude')
      }
    }

    // ============= ENRIQUECIMIENTO =============
    if (!result.coaching_final) {
      result.coaching_final = `Los mejores creadores constantemente refinan su voz. Sigue siendo auténtico.`
    }

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
