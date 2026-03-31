/**
 * POST /api/auth/logout
 * Destruye la sesión
 */

import { getCurrentUser, destroySession, logActivity } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = await getCurrentUser()

    if (user) {
      // Registrar logout en logs
      await logActivity(user.id, 'logout', {}, 'success')
    }

    // Destruir sesión
    await destroySession()

    return Response.json({
      success: true,
      message: 'Sesión cerrada'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
