/**
 * POST /api/auth/create-user
 * Endpoint para crear usuarios (SOLO PARA TESTING - remover en producción)
 */

import { createUser } from '@/lib/auth'

export async function POST(request) {
  try {
    const { username, password, email } = await request.json()

    if (!username || !password) {
      return Response.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      )
    }

    // Crear usuario
    const user = await createUser(username, password, email)

    console.log(`✅ Usuario ${username} creado exitosamente`)

    return Response.json({
      success: true,
      message: `Usuario ${username} creado exitosamente`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)

    // Si ya existe, informar claramente
    if (error.message.includes('Duplicate entry')) {
      return Response.json(
        { error: `El usuario ya existe` },
        { status: 409 }
      )
    }

    return Response.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
