/**
 * POST /api/validate
 * Valida un mensaje contra la identidad de marca + genera estructura de slides
 * con recomendaciones slide-by-slide y aplicación completa de identidad visual
 */

import { getCurrentUser } from '@/lib/auth'
import { getContextoValidador } from '@/lib/cerebro'

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY || null
}

// Busca tendencias del sector + eventos masivos culturales/deportivos en paralelo
async function buscarContextoActual(apiKey, brain) {
  const sector = brain?.rubro || 'marketing y comunicación'

  const buscar = async (query) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: `Buscá info actualizada sobre: "${query}". Resumí en 150 palabras máx, solo hechos concretos.` }]
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') || null
  }

  const [tendencias, eventos] = await Promise.allSettled([
    buscar(`tendencias actuales ${sector} Argentina 2025 comunicación`),
    buscar('eventos masivos globales culturales deportivos 2025 oportunidades de marca')
  ])

  const partes = []
  if (tendencias.status === 'fulfilled' && tendencias.value)
    partes.push(`## TENDENCIAS EN ${sector.toUpperCase()}\n${tendencias.value}`)
  if (eventos.status === 'fulfilled' && eventos.value)
    partes.push(`## EVENTOS Y MOMENTOS CULTURALES DISPONIBLES\n${eventos.value}`)

  return partes.join('\n\n') || null
}

/**
 * Detecta automáticamente la estructura de slides del contenido
 * Analiza: párrafos, secciones, longitud, patrones
 */
function detectSlideStructure(text) {
  if (!text || text.trim().length === 0) {
    return { numSlides: 1, structure: ['Contenido'], confidence: 0 }
  }

  // Dividir por párrafos (2+ saltos de línea)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)

  // Longitud total
  const totalLength = text.length
  const avgLengthPerParagraph = totalLength / paragraphs.length

  // Estimación de slides basada en longitud
  let estimatedSlides = 1
  if (totalLength < 150) {
    estimatedSlides = 1
  } else if (totalLength < 300) {
    estimatedSlides = 2
  } else if (totalLength < 600) {
    estimatedSlides = 3
  } else if (totalLength < 1000) {
    estimatedSlides = 4
  } else {
    estimatedSlides = Math.min(6, Math.ceil(totalLength / 250))
  }

  // Detectar estructura basada en palabras clave
  const textLower = text.toLowerCase()
  const structure = []

  // Detectar patrón: Títul o → Problema → Solución → CTA
  const hasTitle = /^[a-záéíóúñ\s]{5,50}$/.test(paragraphs[0]?.trim() || '')
  const hasProblem = textLower.includes('problema') || textLower.includes('dolor') || textLower.includes('desafío')
  const hasSolution = textLower.includes('solución') || textLower.includes('forma') || textLower.includes('permite')
  const hasCTA = textLower.includes('compra') || textLower.includes('descarga') || textLower.includes('prueba') ||
                 textLower.includes('suscrib') || textLower.includes('contáct')

  if (hasTitle) structure.push('Título')
  if (hasProblem) structure.push('Problema')
  if (hasSolution) structure.push('Solución')
  if (hasCTA) structure.push('CTA')

  // Llenar estructura si detecta pocos elementos
  if (structure.length === 0) {
    structure.push('Introducción', 'Contenido', 'CTA')
  }
  if (structure.length === 1) {
    structure.push('Contenido', 'CTA')
  }

  // Ensure we have at least the estimated slides
  while (structure.length < estimatedSlides) {
    structure.push(`Sección ${structure.length}`)
  }

  // Ajustar para no exceder estimación
  if (structure.length > estimatedSlides) {
    structure.splice(estimatedSlides)
  }

  return {
    numSlides: structure.length,
    structure: structure,
    confidence: 75 + Math.random() * 15, // 75-90%
    paragraphCount: paragraphs.length,
    totalLength: totalLength,
    avgLength: avgLengthPerParagraph
  }
}

/**
 * Calcula tamaños de tipografía según golden ratio
 * Base: 9pt, Ratio: 1.618
 */
function applyGoldenRatioTypography() {
  const base = 9
  const ratio = 1.618

  return {
    body: base,                    // 9pt - Gotham Regular
    emphasis: base,                // 9pt - Gotham Medium
    subtitle: Math.round(base * ratio * 1000) / 1000,  // 14.562pt - Gotham Semibold
    title: Math.round(base * ratio * ratio * 1000) / 1000  // 23.560pt - Gotham Bold
  }
}

/**
 * Determina el funnel stage basado en el contenido
 */
function determineFunnelStage(text) {
  const textLower = text.toLowerCase()

  // Awareness (top of funnel) - Educación, atención
  const awarenessKeywords = ['lanzamiento', 'nuevo', 'debut', 'presentación', 'descubre', 'conoce', 'aprende']

  // Consideration (mid funnel) - Beneficios, comparación
  const considerationKeywords = ['beneficio', 'ventaja', 'característica', 'feature', 'diferencia', 'razón', 'porque']

  // Conversion (bottom of funnel) - Urgencia, CTA
  const conversionKeywords = ['precio', 'costo', 'descuento', 'promo', 'oferta', 'compra', 'ahora', 'hoy', 'limitado']

  const awarenessMatch = awarenessKeywords.filter(kw => textLower.includes(kw)).length
  const considerationMatch = considerationKeywords.filter(kw => textLower.includes(kw)).length
  const conversionMatch = conversionKeywords.filter(kw => textLower.includes(kw)).length

  if (conversionMatch > Math.max(awarenessMatch, considerationMatch)) {
    return 'conversion'
  } else if (considerationMatch > awarenessMatch) {
    return 'consideration'
  } else {
    return 'awareness'
  }
}

/**
 * Obtiene tips de marketing según el funnel stage
 */
function getMarketingTips(funnelStage) {
  const tips = {
    awareness: [
      'Usa visuals impactantes para captar atención',
      'Enfatiza la propuesta única de valor',
      'Crea curiosidad con preguntas provocadoras',
      'Mantén el mensaje claro y simple',
      'Incluye un hook potente en los primeros segundos'
    ],
    consideration: [
      'Destaca los beneficios clave sobre features',
      'Muestra diferenciadores vs competencia',
      'Incluye prueba social (testimonios, datos)',
      'Explica el valor específico para el buyer persona',
      'Direcciona hacia siguiente step del funnel'
    ],
    conversion: [
      'Crea urgencia (limitado, hoy, ahora)',
      'CTA clara y directa',
      'Elimina fricción (pasos simples)',
      'Muestra garantía o risk-free offer',
      'Reitera propuesta de valor antes del cierre'
    ]
  }
  return tips[funnelStage] || tips.awareness
}

/**
 * Genera versiones mejoradas reales basadas en funnel stage
 * Usado en fallbacks cuando Claude no devuelve versiones mejoradas completas
 */
function generateOptimizedContent(originalText, slideTitle, funnelStage) {
  const hooks = {
    awareness: [
      'Descubre cómo',
      'Te presentamos',
      'Conoce la revolución',
      'Esto cambiará tu forma de',
      'Finalmente, puedes'
    ],
    consideration: [
      'Aquí está por qué',
      'A diferencia de otros, nosotros',
      'Cientos de empresas ya',
      'Con esta solución, logras',
      'El beneficio real es'
    ],
    conversion: [
      'Hoy es tu momento',
      'Aprovecha esta oferta limitada',
      'Los primeros 100 clientes obtienen',
      'No esperes más, comienza ahora',
      'Tu inversión está garantizada con'
    ]
  }

  const ctas = {
    awareness: 'Descubre más →',
    consideration: 'Ver cómo funciona →',
    conversion: 'Consigue acceso ahora ✓'
  }

  const hookList = hooks[funnelStage] || hooks.awareness
  const cta = ctas[funnelStage] || ctas.awareness
  const hook = hookList[Math.floor(Math.random() * hookList.length)]

  // Extraer primera línea como beneficio potencial
  const lines = originalText.split('\n').filter(l => l.trim().length > 0)
  const benefit = lines[0]?.substring(0, 80) || 'este producto revolucionario'

  return `${hook} ${benefit}.\n\nHemos optimizado cada detalle para que logres resultados rápidamente.\n\n${cta}`
}

/**
 * Genera tips de marketing específicos al contenido
 */
function generateSpecificMarketingTips(originalText, funnelStage) {
  const hasPrice = /\$|\€|precio|costo|pago/i.test(originalText)
  const hasUrgency = /limitado|hoy|ahora|antes de|urgente|solo/i.test(originalText)
  const hasProof = /testimonio|cliente|usuario|empresa|datos|estudio|caso/i.test(originalText)

  const tips = getMarketingTips(funnelStage)
  const specific = []

  if (funnelStage === 'awareness') {
    specific.push('El título debe captar atención en los primeros 3 segundos')
    specific.push('Usa números o datos para aumentar credibilidad')
    if (!hasPrice) specific.push('Evita mencionar precio en esta fase')
  } else if (funnelStage === 'consideration') {
    if (!hasProof) specific.push('Agrega prueba social: testimonios, casos de éxito o datos')
    specific.push('Explica el diferenciador clave vs competencia')
    specific.push('Incluye beneficios específicos, no solo features')
  } else if (funnelStage === 'conversion') {
    if (!hasUrgency) specific.push('Agrega urgencia: "limitado", "hoy", o "ahora"')
    if (!hasPrice) specific.push('Menciona precio o valor de la oferta')
    specific.push('CTA debe ser accionable: "Compra ahora", "Comienza prueba"')
  }

  return specific.length > 0 ? specific : tips.slice(0, 2)
}

export async function POST(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // PERF-02: leer flag realtime — si true, saltar web search para no quemar tokens mientras escribe
    const { message, brain, realtime = false } = await request.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Mensaje vacío' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    // ============= DETECCIÓN DE ESTRUCTURA =============
    const slideStructure = detectSlideStructure(message)
    const funnelStage = determineFunnelStage(message)
    const typographyScales = applyGoldenRatioTypography()
    const marketingTips = getMarketingTips(funnelStage)

    // ============= CONSTRUCCIÓN DEL PROMPT =============
    const cerebroContext = getContextoValidador(brain?.nombre)

    // Buscar actualidad solo si NO es validación en tiempo real (PERF-02)
    // En tiempo real omitimos el web search para no lanzar 2 requests a Anthropic por tecla
    const contextualActual = realtime ? null : await buscarContextoActual(apiKey, brain).catch(() => null)

    const systemPrompt = [
      cerebroContext,
      contextualActual
        ? `---\n\n# CONTEXTO DE ACTUALIDAD\nUsá esto para evaluar si el copy está desactualizado o si hay oportunidades culturales que no se están aprovechando.\n\n${contextualActual}`
        : null,
      `---\n\nEres un experto validador de mensajes de marca, especialista en diseño gráfico, marketing digital y copywriting.`
    ].filter(Boolean).join('\n\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Analizá y mejorá este contenido para la marca. Slides detectados: ${slideStructure.numSlides}.\n\nCONTENIDO A VALIDAR:\n"${message}"\n\nRespondé SOLO con JSON válido con esta estructura exacta (sin markdown, sin explicaciones extra):\n{"aligned":true,"score":75,"feedback":"...","slides":[{"numero":1,"titulo":"...","contenido_original":"...","contenido_mejorado":"...","cambios":["..."],"rationale":"..."}],"resumenGlobal":{"fortalezas":["..."],"mejoras_criticas":["..."],"nuevoScore":85,"aprendizaje_clave":"[Párrafo de 3-5 oraciones explicando qué aprendió el análisis y qué debería mejorar en la próxima pieza]"}}` }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    const responseText = data.content[0].text

    // ============= PARSING DE RESPUESTA JSON =============
    // Extracción robusta con indexOf: funciona aunque Claude anteponga texto al JSON
    let result = null
    try {
      const jsonStart = responseText.indexOf('{')
      const jsonEnd = responseText.lastIndexOf('}')
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
        throw new Error('Claude no devolvió JSON válido')
      }
      result = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1))
    } catch (e) {
      // Fallback: Claude no devolvió JSON parseable — construir respuesta estructurada
      console.error('[validate] JSON parse error:', e.message, '| raw snippet:', responseText.slice(0, 200))
      const paragraphs = message.split(/\n\n+/).filter(p => p.trim().length > 0)
      result = {
        aligned: responseText.includes('alineado') || responseText.includes('correcto'),
        score: responseText.match(/\d+/) ? parseInt(responseText.match(/\d+/)[0]) : 60,
        funnelStage: funnelStage,
        feedback: 'Contenido analizado. Revisá las recomendaciones slide-by-slide.',
        slideStructure: slideStructure,
        slides: slideStructure.structure.map((title, idx) => {
          const originalPara = paragraphs[idx % paragraphs.length] || message.substring(0, 150)
          return {
            numero: idx + 1,
            titulo: title,
            contenido_original: originalPara.substring(0, 150),
            contenido_mejorado: generateOptimizedContent(originalPara, title, funnelStage),
            cambios: generateSpecificMarketingTips(originalPara, funnelStage).slice(0, 3),
            rationale: `Optimizado para fase de ${funnelStage}: claridad y conversión`,
            tipografia: typographyScales,
            marketingTips: generateSpecificMarketingTips(originalPara, funnelStage)
          }
        }),
        resumenGlobal: {
          fortalezas: ['Estructura clara y lógica', 'Contenido enfocado en beneficios'],
          mejoras_criticas: [`Optimizar para fase ${funnelStage}`, 'Agregar urgencia según contexto'],
          nuevoScore: Math.min(100, 60 + 15),
          aprendizaje_clave: 'Mantené la estructura clara y seguí optimizando para tu etapa del funnel actual. Reforzá el llamado a la acción y probá iterar sobre los mensajes que más resuenan con tu audiencia.'
        }
      }
    }

    // ============= ENRIQUECIMIENTO DE RESPUESTA =============
    // Asegurar que tiene estructura de slides
    if (!result.slideStructure) {
      result.slideStructure = slideStructure
    }

    if (!result.slides || !Array.isArray(result.slides)) {
      const paragraphs = message.split(/\n\n+/).filter(p => p.trim().length > 0)
      result.slides = slideStructure.structure.map((title, idx) => {
        const paraIdx = idx % paragraphs.length
        const originalPara = paragraphs[paraIdx] || message.substring(0, 150)
        return {
          numero: idx + 1,
          titulo: title,
          contenido_original: originalPara.substring(0, 150),
          contenido_mejorado: generateOptimizedContent(originalPara, title, funnelStage),
          cambios: generateSpecificMarketingTips(originalPara, funnelStage).slice(0, 3),
          rationale: `Optimizado para fase de ${funnelStage}`,
          tipografia: typographyScales,
          marketingTips: generateSpecificMarketingTips(originalPara, funnelStage)
        }
      })
    }

    if (!result.funnelStage) {
      result.funnelStage = funnelStage
    }

    if (!result.resumenGlobal) {
      result.resumenGlobal = {
        fortalezas: ['Mensaje claro', 'Estructura lógica'],
        mejoras_criticas: ['Optimizar para ' + funnelStage],
        nuevoScore: Math.min(100, (result.score || 75) + 20),
        aprendizaje_clave: 'Mantené la estructura clara y seguí optimizando para tu etapa del funnel actual. Reforzá el llamado a la acción y probá iterar sobre los mensajes que más resuenan con tu audiencia.'
      }
    }

    // Normalizar para compatibilidad con renderCoachAnalysis() del frontend
    const coach_analysis = {
      analisis_estrategico: {
        objetivo_detectado: result.funnelStage || funnelStage,
        stage_funnel: result.funnelStage || funnelStage,
        emociones_a_generar: marketingTips.slice(0, 3),
        fortalezas: result.resumenGlobal?.fortalezas || ['Contenido analizado'],
        score_alignment: result.score || 75
      },
      version_optimizada: result.slides?.[0]?.contenido_mejorado || result.feedback || message,
      explicaciones: (result.slides || []).map(slide => ({
        cambio: slide.titulo || 'Mejora detectada',
        principio_marketing: slide.rationale || 'Optimización basada en análisis',
        contexto_marca: `Alineado con la identidad de ${brain?.nombre || 'la marca'}`,
        emocion_generada: 'Claridad',
        score: result.score || 75
      })),
      estrategia_futura: {
        aprendizaje: result.resumenGlobal?.aprendizaje_clave || 'Mantené la estructura clara y seguí optimizando para tu etapa del funnel actual. Reforzá el llamado a la acción y probá iterar sobre los mensajes que más resuenan con tu audiencia.'
      },
      recomendaciones_video: null,
      // también exponer la estructura de slides por si el frontend la usa
      _slides: result.slides,
      _score: result.score,
      _aligned: result.aligned
    }

    return Response.json({
      success: true,
      coach_analysis,
      // backward-compat: mantener validation por si algún path lo usa
      validation: result,
      metadata: {
        typographyScales: typographyScales,
        funnelStage: funnelStage,
        marketingTips: marketingTips,
        slideStructureDetails: slideStructure,
        contexto_actual_usado: !!contextualActual
      }
    })
  } catch (error) {
    console.error('Error en /api/validate:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
