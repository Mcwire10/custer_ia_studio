/**
 * POST /api/cron/tendencias
 * Busca tendencias de la semana pasada + próxima semana y las guarda en MySQL.
 * Ejecutado por Railway cron cada lunes a las 8am ART.
 * Protegido con CRON_SECRET header.
 */

import { saveContexto } from '@/lib/contexto-actual'

function verificarSecret(request) {
  const secret = request.headers.get('x-cron-secret')
  return secret === process.env.CRON_SECRET
}

export async function POST(request) {
  if (!verificarSecret(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
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
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: query }]
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const data = await res.json()
    const textoRaw = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    if (!textoRaw) throw new Error('Claude no devolvió texto')

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
