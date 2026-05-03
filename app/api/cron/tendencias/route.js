/**
 * POST /api/cron/tendencias
 * Busca tendencias de la semana pasada + próxima semana y las guarda en MySQL.
 * Ejecutado por cron-job.org cada lunes a las 8am ART.
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
  const semanaAntes = new Date(hoy); semanaAntes.setDate(hoy.getDate() - 7)
  const semanaDespes = new Date(hoy); semanaDespes.setDate(hoy.getDate() + 7)

  const formatFecha = (d) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  const query = `Buscá hechos y tendencias relevantes para marcas argentinas en estos dos períodos:
1. Semana pasada (${formatFecha(semanaAntes)} al ${formatFecha(hoy)}): resultados deportivos (fútbol argentino, superclásicos, selección), estrenos de cine/series importantes, virales en redes, eventos culturales, noticias de consumo masivo.
2. Próxima semana (${formatFecha(hoy)} al ${formatFecha(semanaDespes)}): eventos confirmados, partidos importantes, estrenos anunciados, fechas comerciales, eventos masivos globales o locales.

Incluí solo hechos concretos y fechas. Formato markdown prolijo para que lo consuma una IA.`

  try {
    const result = await callGeminiWithSearch(query, null, { maxTokens: 1200 })

    const textoRaw = result.text?.trim()
    if (!textoRaw) throw new Error('Gemini no devolvió texto')

    const contenido = `## TENDENCIAS Y EVENTOS — semana del ${formatFecha(semanaAntes)} al ${formatFecha(semanaDespes)}\n\n${textoRaw}`

    await saveContexto('tendencias', contenido)

    return Response.json({
      success: true,
      tipo: 'tendencias',
      chars: contenido.length,
      periodo: `${formatFecha(semanaAntes)} — ${formatFecha(semanaDespes)}`
    })

  } catch (error) {
    console.error('[cron/tendencias]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}