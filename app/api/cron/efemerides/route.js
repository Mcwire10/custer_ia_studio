/**
 * POST /api/cron/efemerides
 * Busca efemérides y eventos del mes siguiente y los guarda en MySQL.
 * Ejecutado por cron-job.org los últimos días de cada mes a las 9am ART.
 * Protegido con CRON_SECRET header.
 */

import { saveContexto } from '@/lib/contexto-actual'
import { callGeminiWithSearch } from '@/lib/gemini'

function verificarSecret(request) {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

export async function POST(request) {
  if (!verificarSecret(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const hoy = new Date()
  const mesProx = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  const nombreMes = mesProx.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  const query = `Buscá y listá para ${nombreMes} en Argentina:

1. EFEMÉRIDES Y FECHAS ESPECIALES: Día del trabajador, día de la madre, fechas patrias, días internacionales relevantes para marcas de consumo (día del niño, día de la mujer, etc.), semanas temáticas.
2. EVENTOS DEPORTIVOS CONFIRMADOS: partidos de fútbol importantes (Copa Libertadores, Sudamericana, fecha FIFA, superclásicos programados), otros deportes con masa crítica.
3. ESTRENOS CULTURALES: películas de alto impacto masivo, series muy esperadas, conciertos o festivales grandes en Argentina.
4. FECHAS COMERCIALES: CyberMonday, Hot Sale, fechas de temporada (vuelta al cole, verano, etc.) si aplica para ese mes.
5. EVENTOS GLOBALES: mundiales, olimpiadas, elecciones de impacto internacional, hitos tecnológicos masivos.

Para cada item: fecha exacta, nombre, por qué es oportunidad para marcas. Formato markdown prolijo y estructurado para que lo consuma una IA de marketing.`

  try {
    const result = await callGeminiWithSearch(query, null, { maxTokens: 1500 })

    const textoRaw = result.text?.trim()
    if (!textoRaw) throw new Error('Gemini no devolvió texto')

    const contenido = `## EFEMÉRIDES Y OPORTUNIDADES DE MARCA — ${nombreMes.toUpperCase()}\n\n${textoRaw}`

    await saveContexto('efemerides', contenido)

    return Response.json({
      success: true,
      tipo: 'efemerides',
      chars: contenido.length,
      mes: nombreMes
    })

  } catch (error) {
    console.error('[cron/efemerides]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}