/**
 * GET /api/auth/me
 * Obtiene información del usuario autenticado
 */

import { getCurrentUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    return Response.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return Response.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
