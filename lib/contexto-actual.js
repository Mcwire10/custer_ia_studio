/**
 * LIB/CONTEXTO-ACTUAL.JS
 * Lee el contexto pre-computado (tendencias + efemérides) desde MySQL.
 * Los cron jobs de Railway actualizan estos datos periódicamente.
 * validate y copy leen de acá — sin web search en tiempo real.
 */

import { getOne, query } from './db.js'

/**
 * Retorna el contexto actual formateado como markdown para Claude.
 * Combina tendencias (semanales) + efemérides (mensuales) si existen.
 */
export async function getContextoActual() {
  try {
    const [tendencias, efemerides] = await Promise.all([
      getOne(
        `SELECT contenido, updated_at FROM contexto_actual
         WHERE tipo = 'tendencias'
         ORDER BY updated_at DESC LIMIT 1`
      ),
      getOne(
        `SELECT contenido, updated_at FROM contexto_actual
         WHERE tipo = 'efemerides'
         ORDER BY updated_at DESC LIMIT 1`
      )
    ])

    const partes = []

    if (tendencias?.contenido) {
      const dias = Math.floor((Date.now() - new Date(tendencias.updated_at)) / 86400000)
      partes.push(`${tendencias.contenido}\n\n> _Actualizado hace ${dias} día${dias !== 1 ? 's' : ''}_`)
    }

    if (efemerides?.contenido) {
      partes.push(efemerides.contenido)
    }

    if (partes.length === 0) return null

    return `# CONTEXTO ACTUAL\nUsá esto para anclar el copy a lo que está pasando ahora. Conectá cuando sea natural y potente — nunca forzado.\n\n${partes.join('\n\n---\n\n')}`
  } catch (err) {
    console.error('[contexto-actual] Error leyendo DB:', err.message)
    return null
  }
}

/**
 * Guarda o actualiza contexto en la DB.
 * tipo: 'tendencias' | 'efemerides'
 */
export async function saveContexto(tipo, contenido) {
  await query(
    `INSERT INTO contexto_actual (tipo, contenido, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE contenido = VALUES(contenido), updated_at = NOW()`,
    [tipo, contenido]
  )
}
