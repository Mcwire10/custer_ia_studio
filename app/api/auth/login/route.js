/**
 * POST /api/auth/login
 * Valida credenciales y crea sesión
 */

import { validateLogin, createSession, logActivity } from '@/lib/auth'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json(
        { error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      )
    }

    // Validar credenciales
    const user = await validateLogin(username, password)

    if (!user) {
      return Response.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Crear sesión
    await createSession(user.id)

    // Registrar login en logs
    await logActivity(user.id, 'login', { username }, 'success')

    return Response.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
