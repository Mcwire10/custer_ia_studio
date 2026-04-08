/**
 * Token Optimizer - Loop de automejora para reducir tokens
 * Rastrea, analiza y optimiza automáticamente el uso de tokens
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const TOKEN_LOG_FILE = join(process.cwd(), '.claude/token-metrics.json')
const OPTIMIZATION_RULES = {
  processBrandText: {
    maxTokens: 2000,
    target: 1200, // Objetivo de tokens
    currentPromptSize: 0
  },
  generate: {
    maxTokens: 2000,
    target: 1500,
    currentPromptSize: 0
  },
  validate: {
    maxTokens: 500,
    target: 300,
    currentPromptSize: 0
  },
  copy: {
    maxTokens: 500,
    target: 350,
    currentPromptSize: 0
  },
  competition: {
    maxTokens: 500,
    target: 350,
    currentPromptSize: 0
  },
  reports: {
    maxTokens: 500,
    target: 300,
    currentPromptSize: 0
  },
  analyzeVisualIdentity: {
    maxTokens: 2500,
    target: 1800,
    currentPromptSize: 0
  }
}

/**
 * Rastrea el uso de tokens en cada llamada
 */
export function logTokenUsage(endpoint, promptTokens, completionTokens, totalTokens, success = true) {
  try {
    let metrics = { calls: [], summary: {} }

    try {
      const existing = readFileSync(TOKEN_LOG_FILE, 'utf8')
      metrics = JSON.parse(existing)
    } catch (e) {
      // Crear nuevo archivo
    }

    // Agregar nuevo registro
    metrics.calls.push({
      endpoint,
      timestamp: new Date().toISOString(),
      promptTokens,
      completionTokens,
      totalTokens,
      success,
      reduction: 0 // Se calcula después
    })

    // Mantener solo últimas 1000 llamadas
    if (metrics.calls.length > 1000) {
      metrics.calls = metrics.calls.slice(-1000)
    }

    // Calcular métricas por endpoint
    metrics.summary = calculateMetrics(metrics.calls)

    writeFileSync(TOKEN_LOG_FILE, JSON.stringify(metrics, null, 2))
    return metrics.summary
  } catch (e) {
    console.error('Error logging tokens:', e)
  }
}

/**
 * Calcula métricas agregadas
 */
function calculateMetrics(calls) {
  const byEndpoint = {}

  for (const call of calls) {
    if (!byEndpoint[call.endpoint]) {
      byEndpoint[call.endpoint] = {
        count: 0,
        totalTokens: 0,
        avgTokens: 0,
        minTokens: Infinity,
        maxTokens: 0,
        successRate: 0,
        trend: [] // Últimas 10 llamadas
      }
    }

    const ep = byEndpoint[call.endpoint]
    ep.count++
    ep.totalTokens += call.totalTokens
    ep.minTokens = Math.min(ep.minTokens, call.totalTokens)
    ep.maxTokens = Math.max(ep.maxTokens, call.totalTokens)
    ep.successRate = (ep.count - 1) / ep.count * ep.successRate + (call.success ? 1 : 0) / ep.count
    ep.trend.push(call.totalTokens)
    if (ep.trend.length > 10) ep.trend.shift()
    ep.avgTokens = ep.totalTokens / ep.count
  }

  return byEndpoint
}

/**
 * Obtiene recomendaciones de optimización
 */
export function getOptimizationRecommendations() {
  try {
    const existing = readFileSync(TOKEN_LOG_FILE, 'utf8')
    const metrics = JSON.parse(existing)
    const summary = metrics.summary

    const recommendations = []

    for (const [endpoint, data] of Object.entries(summary)) {
      const target = OPTIMIZATION_RULES[endpoint.toLowerCase().replace('-', '')]?.target
      if (target && data.avgTokens > target) {
        const reduction = Math.round(((data.avgTokens - target) / data.avgTokens) * 100)
        recommendations.push({
          endpoint,
          currentAvg: Math.round(data.avgTokens),
          target,
          reduction,
          priority: reduction > 30 ? 'HIGH' : 'MEDIUM',
          suggestion: generateSuggestion(endpoint, data)
        })
      }
    }

    return recommendations.sort((a, b) => b.priority === 'HIGH' ? -1 : 1)
  } catch (e) {
    return []
  }
}

/**
 * Genera sugerencias específicas de optimización
 */
function generateSuggestion(endpoint, data) {
  const suggestions = {
    'processBrandText': 'Reduce el system prompt. Quita explicaciones detalladas y enfócate en instrucciones concisas.',
    'generate': 'Limita las variaciones de formato. Genera menos tipos de anuncio por llamada.',
    'validate': 'Simplifica el análisis. Solo valida puntos críticos del mensaje.',
    'copy': 'Reduce ejemplos en el prompt. Solo incluye 1-2 ejemplos en lugar de 3-4.',
    'competition': 'Analiza menos competidores. Enfócate en los 3 más relevantes.',
    'reports': 'Resume secciones. Elimina análisis profundos de tendencias.',
    'analyzeVisualIdentity': 'Reduce detalles de análisis. Solo extrae colores y tipografía principales.'
  }

  return suggestions[endpoint] || 'Revisa y simplifica el prompt del sistema.'
}

/**
 * Obtiene estadísticas de ahorro
 */
export function getTokenSavingsStats() {
  try {
    const existing = readFileSync(TOKEN_LOG_FILE, 'utf8')
    const metrics = JSON.parse(existing)

    if (metrics.calls.length < 10) {
      return { message: 'Insuficientes datos para calcular ahorros' }
    }

    // Comparar primeras 10 llamadas vs últimas 10
    const firstCalls = metrics.calls.slice(0, 10)
    const lastCalls = metrics.calls.slice(-10)

    const avgFirst = firstCalls.reduce((sum, c) => sum + c.totalTokens, 0) / 10
    const avgLast = lastCalls.reduce((sum, c) => sum + c.totalTokens, 0) / 10

    const savedPerCall = avgFirst - avgLast
    const savedPercent = (savedPerCall / avgFirst) * 100

    return {
      totalCalls: metrics.calls.length,
      avgFirst: Math.round(avgFirst),
      avgLast: Math.round(avgLast),
      savedPerCall: Math.round(savedPerCall),
      savedPercent: Math.round(savedPercent),
      estimatedMonthlySavings: Math.round(savedPerCall * 1000 * 0.02) // Estimado a $0.02 por 1M tokens
    }
  } catch (e) {
    return {}
  }
}
