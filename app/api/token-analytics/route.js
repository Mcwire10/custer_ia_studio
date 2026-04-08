/**
 * GET /api/token-analytics
 * Retorna análisis de tokens y recomendaciones de optimización
 */

import {
  getOptimizationRecommendations,
  getTokenSavingsStats
} from '@/app/lib/token-optimizer'

export async function GET() {
  try {
    const recommendations = getOptimizationRecommendations()
    const savings = getTokenSavingsStats()

    return Response.json({
      success: true,
      recommendations,
      savings,
      insight: generateInsight(recommendations, savings)
    })
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function generateInsight(recommendations, savings) {
  if (Object.keys(savings).length === 0) {
    return '⏳ Acumulando datos... Vuelve después de 10+ llamadas para ver análisis.'
  }

  const lines = [
    `📊 Estadísticas de Tokens:`,
    `   • Total de llamadas: ${savings.totalCalls}`,
    `   • Promedio inicial: ${savings.avgFirst} tokens`,
    `   • Promedio actual: ${savings.avgLast} tokens`,
    `   • Ahorro por llamada: ${savings.savedPerCall} tokens (${savings.savedPercent}%)`,
    `   • Ahorro estimado mensual: $${savings.estimatedMonthlySavings} (a 1000 llamadas/mes)`
  ]

  if (recommendations.length > 0) {
    lines.push(`\n🎯 Optimizaciones disponibles (${recommendations.length}):`)
    for (const rec of recommendations.slice(0, 3)) {
      lines.push(`   [${rec.priority}] ${rec.endpoint}: ${rec.reduction}% ahorrable`)
      lines.push(`      💡 ${rec.suggestion}`)
    }
  } else {
    lines.push('\n✅ Sistema optimizado! No hay mejoras disponibles.')
  }

  return lines.join('\n')
}
