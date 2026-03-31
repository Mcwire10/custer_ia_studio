/**
 * LIB/AUTH.JS - Funciones de autenticación
 */

import { getOne, insert } from './db'
import { cookies } from 'next/headers'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días

/**
 * Validar login
 * @param {string} username - Usuario
 * @param {string} password - Contraseña (4 dígitos)
 * @returns {Object} Usuario si es válido, null si no
 */
export async function validateLogin(username, password) {
  // Validar que password sea 4 dígitos
  if (!/^\d{4}$/.test(password)) {
    return null
  }

  try {
    const user = await getOne(
      'SELECT id, username, email FROM users WHERE username = ? AND password = ? AND active = TRUE',
      [username, password]
    )
    return user
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

/**
 * Crear sesión
 * @param {number} userId - ID del usuario
 */
export async function createSession(userId) {
  const sessionToken = Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  // Guardar sesión como cookie (simple)
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000
  })

  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000
  })

  return sessionToken
}

/**
 * Obtener usuario de la sesión actual
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) return null

    const user = await getOne(
      'SELECT id, username, email FROM users WHERE id = ? AND active = TRUE',
      [parseInt(userId)]
    )

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Destruir sesión (logout)
 */
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
  cookieStore.delete('session_token')
}

/**
 * Registrar log de actividad
 * @param {number} userId - ID del usuario
 * @param {string} action - Acción (generate, validate, copy, etc)
 * @param {Object} details - Detalles adicionales
 * @param {string} result - 'success' o 'error'
 */
export async function logActivity(userId, action, details = {}, result = 'success') {
  try {
    await insert('logs', {
      user_id: userId,
      action,
      details: JSON.stringify(details),
      result
    })
  } catch (error) {
    console.error('Log activity error:', error)
  }
}

/**
 * Obtener logs del usuario
 */
export async function getUserLogs(userId, limit = 50) {
  try {
    return await getMany(
      'SELECT action, result, details, created_at FROM logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    )
  } catch (error) {
    console.error('Get logs error:', error)
    return []
  }
}

export default {
  validateLogin,
  createSession,
  getCurrentUser,
  destroySession,
  logActivity,
  getUserLogs
}
