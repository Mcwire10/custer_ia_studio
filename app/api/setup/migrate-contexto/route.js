/**
 * POST /api/setup/migrate-contexto
 * Crea la tabla contexto_actual en MySQL. Ejecutar una sola vez.
 * Solo accesible por usuarios autenticados.
 */

import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  await query(`
    CREATE TABLE IF NOT EXISTS contexto_actual (
      tipo VARCHAR(20) NOT NULL,
      contenido TEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tipo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  return Response.json({ success: true, message: 'Tabla contexto_actual lista' })
}
