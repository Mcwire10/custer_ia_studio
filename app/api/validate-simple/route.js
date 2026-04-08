/**
 * POST /api/validate-simple
 * Validador funcional MOCK - No requiere API keys
 * Para testing y demo
 */

export async function POST(request) {
  try {
    const {
      content,
      content_type = 'copy',
      brand = {},
      objetivo = 'general',
      target_platform = 'instagram'
    } = await request.json()

    if (!content?.trim()) {
      return Response.json({ error: 'Contenido vacío' }, { status: 400 })
    }

    // Análisis MOCK pero realista
    const analysis = generateMockAnalysis(content, content_type, brand, objetivo, target_platform)

    return Response.json({
      success: true,
      coach_analysis: analysis,
      metadata: {
        content_type,
        objective: objetivo,
        platform: target_platform,
        analysis_type: 'mock'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return Response.json(
      { error: error.message || 'Error en validación' },
      { status: 500 }
    )
  }
}

function generateMockAnalysis(content, contentType, brand, objetivo, platform) {
  const contentLength = content.length
  const hasEmojis = /\p{Emoji}/u.test(content)
  const hasCTA = /llamada|clic|compra|descarga|visita|haz clic|da click/i.test(content)
  const hasNumbers = /\d+/.test(content)
  const hasQuestion = /\?/.test(content)

  return {
    analisis_estrategico: {
      objetivo_detectado: objetivo,
      stage_funnel: objetivo === 'awareness' ? 'activación' : objetivo === 'consideration' ? 'evaluación' : 'conversión',
      emociones_a_generar: getEmotionsForObjective(objetivo),
      plataforma: platform,
      fortalezas: [
        hasEmojis ? '✅ Usa emojis (mejora engagement 35%)' : '⚠️ Sin emojis (engagement -25%)',
        hasCTA ? '✅ Tiene CTA clara' : '⚠️ Falta CTA clara',
        hasNumbers ? '✅ Incluye números (credibilidad)' : '⚠️ Agrega números específicos',
        hasQuestion ? '✅ Pregunta retórica (engagement)' : '⚠️ Haz una pregunta'
      ],
      score_alignment: Math.round(60 + Math.random() * 30)
    },

    version_optimizada: `${content}

${!hasCTA ? '\n👉 [Agrega CTA clara: Clica aquí / Descubre más / Compra ahora]' : ''}
${!hasEmojis ? '\n✨ Agrega emojis relevantes para mayor engagement' : ''}`,

    explicaciones: [
      {
        cambio: hasCTA ? 'CTA es clara y accionable' : 'Agregamos CTA específica al final',
        principio_marketing: hasCTA ? 'CTA clara = conversión directa' : 'Sin CTA, el 80% no sabe qué hacer',
        contexto_marca: brand?.nombre ? `En ${brand.nombre}, las CTAs explícitas aumentan conversión 45%` : 'Las CTAs directas funcionan mejor',
        emocion_generada: 'Urgencia / Acción',
        score: hasCTA ? 85 : 45
      },
      {
        cambio: hasEmojis ? 'Emojis presentes ✓' : 'Agregar emojis estratégicos',
        principio_marketing: 'Emojis aumentan engagement 40% en redes',
        contexto_marca: platform === 'instagram' ? 'Instagram: emojis = 2.5x más likes' : `En ${platform}: emojis mejoran visibilidad`,
        emocion_generada: 'Diversión / Accesibilidad',
        score: hasEmojis ? 90 : 50
      },
      {
        cambio: contentLength < 100 ? 'Texto muy corto' : contentLength > 500 ? 'Considera acortar' : 'Extensión óptima',
        principio_marketing: platform === 'instagram' ? '100-200 caracteres óptimo' : '150-300 caracteres recomendado',
        contexto_marca: `Tu audiencia en ${platform} prefiere contenido conciso`,
        emocion_generada: 'Claridad / Velocidad',
        score: contentLength > 50 && contentLength < 300 ? 85 : 60
      },
      {
        cambio: hasNumbers ? 'Números específicos' : 'Agrega números concretos',
        principio_marketing: 'Números específicos = 3x más credibilidad',
        contexto_marca: brand?.nombre ? `${brand.nombre}: "50% descuento" vs "descuento" = 2x conversión` : 'Números generan confianza',
        emocion_generada: 'Confianza / Certeza',
        score: hasNumbers ? 88 : 55
      }
    ],

    estrategia_futura: {
      siguiente_paso: `Próxima vez, ${objetivo === 'awareness' ? 'enfoca en viralidad y reach' : objetivo === 'consideration' ? 'profundiza beneficios y casos de uso' : 'simplifica el proceso de compra'}`,
      patrones_exitosos: [
        'Contenido que generó más engagement el mes pasado',
        'Horarios de posting más efectivos: 10-12am, 6-8pm',
        'Formato que convierte mejor: video > carrusel > static'
      ],
      testing_recomendado: [
        'A/B test: con emoji vs sin emoji',
        'Test: CTA a principio vs final',
        'Test: pregunta retórica sí/no'
      ]
    },

    recomendaciones_video: contentType === 'reel' ? {
      hook_primeros_2s: 'Los primeros 2 segundos son críticos. Usa hook de sorpresa o curiosidad',
      duracion_recomendada: '15-45 segundos',
      pacing: 'Corta: cambio de escena cada 1-2 segundos',
      cta_placement: 'Al final, clara y sin ambigüedad',
      audio_trend: 'Usa audio trending (no copyrighted)',
      captions_recommendation: 'Subtítulos en blanco, fuente grande (visible en móvil pequeño)'
    } : null
  }
}

function getEmotionsForObjective(objetivo) {
  const emotions = {
    awareness: ['sorpresa', 'curiosidad', 'interés'],
    consideration: ['confianza', 'valor', 'identidad'],
    conversion: ['urgencia', 'fomo', 'acción']
  }
  return emotions[objetivo] || emotions.awareness
}
