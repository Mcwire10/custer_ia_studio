/**
 * POST /api/generate-brand-report
 * Genera un reporte consolidado de análisis de marca
 * Consolida datos de formulario + análisis visual en un reporte profesional
 */

import {
  validateBrandTypography,
  consolidateColors,
  checkConsistency,
  assignConfidenceScores,
  generateNextSteps,
  calculateContrast
} from '@/app/lib/brand-validation'

export async function POST(request) {
  try {
    const { brand, visualAssets, source } = await request.json()

    if (!brand) {
      return Response.json(
        { error: 'Brand data is required' },
        { status: 400 }
      )
    }

    // Consolida análisis visual
    const visualAnalysis = visualAssets?.analysis || {}
    const coloresConsolidados = consolidateColors(visualAnalysis.colores || [])
    const tipografiaValidada = validateBrandTypography(
      brand.tipografia_principal || visualAnalysis.tipografia?.[0]?.familia
    )

    // Verifica consistencia entre formulario y análisis
    const { inconsistencias, hallazgos } = checkConsistency(brand, visualAnalysis)

    // Asigna puntuaciones de confianza
    const confianzaScores = assignConfidenceScores(visualAnalysis)

    // Calcula contraste de accesibilidad
    let contrastePrimario = null
    if (coloresConsolidados.primario?.hex) {
      contrastePrimario = calculateContrast(coloresConsolidados.primario.hex, '#FFFFFF')
    }

    // Genera próximos pasos
    const proximosPasos = generateNextSteps({
      colores: coloresConsolidados,
      tipografia: { principal: tipografiaValidada },
      consistencia: {
        score: inconsistencias.length === 0 ? 100 : 70
      }
    })

    // Calcula score de consistencia general
    const consistenciaScore = inconsistencias.length === 0 ? 100 : Math.max(50, 100 - (inconsistencias.length * 20))

    // Genera reporte consolidado
    const report = {
      timestamp: new Date().toISOString(),
      source: source || 'manual',

      // IDENTIDAD VISUAL
      colores: {
        primario: coloresConsolidados.primario ? {
          hex: coloresConsolidados.primario.hex,
          rgb: coloresConsolidados.primario.rgb,
          nombre: coloresConsolidados.primario.nombre,
          confianza: confianzaScores.colores,
          frecuencia: `detectado en ${coloresConsolidados.primario.frecuencia || 1} imagen(s)`,
          contraste_wcag_aa: contrastePrimario ? parseFloat(contrastePrimario) >= 4.5 : null,
          contraste_ratio: contrastePrimario
        } : null,
        secundario: coloresConsolidados.secundario ? {
          hex: coloresConsolidados.secundario.hex,
          rgb: coloresConsolidados.secundario.rgb,
          nombre: coloresConsolidados.secundario.nombre,
          confianza: confianzaScores.colores - 10
        } : null,
        acentos: coloresConsolidados.acentos.map(color => ({
          hex: color.hex,
          rgb: color.rgb,
          nombre: color.nombre,
          confianza: confianzaScores.colores - 20
        })),
        sugerencias: coloresConsolidados.sugerencias || []
      },

      tipografia: {
        principal: {
          familia: tipografiaValidada.familia,
          pesos_recomendados: tipografiaValidada.peso_recomendado,
          fallback: tipografiaValidada.fallback,
          fuente: tipografiaValidada.fuente,
          confianza: tipografiaValidada.confianza,
          variantes_disponibles: tipografiaValidada.variantes_disponibles
        },
        secundaria: visualAnalysis.tipografia?.[1] ? {
          familia: visualAnalysis.tipografia[1].familia,
          confianza: confianzaScores.tipografia - 10
        } : null,
        sugerencias: []
      },

      estilo_visual: {
        clasificacion: visualAnalysis.fotografia?.estilo || brand.estilo_visual || 'moderno',
        elementos_dominantes: visualAnalysis.elementos_graficos?.formas || [],
        emociones: visualAnalysis.emociones || [],
        consistencia: inconsistencias.length === 0 ? 'alto' : 'medio',
        recomendaciones: proximosPasos
      },

      fotografia: visualAnalysis.fotografia ? {
        estilo: visualAnalysis.fotografia.estilo,
        composicion: visualAnalysis.fotografia.composicion,
        tratamiento: visualAnalysis.fotografia.tratamiento,
        recomendaciones: visualAnalysis.fotografia.recomendaciones || []
      } : null,

      // VALIDACIÓN Y CONSISTENCIA
      consistencia: {
        score: consistenciaScore,
        hallazgos: hallazgos,
        inconsistencias: inconsistencias.map(inc => ({
          campo: inc.campo,
          forma: inc.forma,
          analisis: inc.analisis,
          resolucion: `Verificar: ¿${inc.analisis} es la correcta?`
        }))
      },

      // CONFIANZA GENERAL
      confianza: {
        colores: confianzaScores.colores,
        tipografia: confianzaScores.tipografia,
        estilo_visual: confianzaScores.estilo_visual,
        general: confianzaScores.general
      },

      // PRÓXIMOS PASOS
      proximos_pasos: proximosPasos,

      // RESUMEN EJECUTIVO
      resumen: {
        marca: brand.nombre,
        fuentes_de_datos: [
          brand.nombre ? '📝 Datos del formulario' : null,
          visualAssets?.images?.length ? `🖼️ ${visualAssets.images.length} imágenes analizadas` : null,
          visualAnalysis.colores?.length ? '🎨 Colores detectados' : null,
          visualAnalysis.tipografia?.length ? '🔤 Tipografía detectada' : null
        ].filter(Boolean),
        recomendacion: consistenciaScore >= 80 ? '✅ Datos consistentes y listos para usar' : '⚠️ Revisar y confirmar datos detectados',
        estado: confianzaScores.general >= 80 ? 'high' : confianzaScores.general >= 60 ? 'medium' : 'low'
      }
    }

    return Response.json({
      success: true,
      report: report
    })
  } catch (error) {
    console.error('Error generando reporte de marca:', error)
    return Response.json(
      { error: error.message || 'Error generating brand report' },
      { status: 500 }
    )
  }
}
