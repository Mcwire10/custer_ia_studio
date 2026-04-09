/**
 * LIB/AUTH.JS - Funciones de autenticación
 *
 * Sistema de autenticación con:
 * - Hashing de contraseñas con bcrypt
 * - Sesiones HTTPOnly cookies
 * - Logging de actividades
 * - Gestión de usuarios
 */

import bcrypt from 'bcrypt'
import { getOne, insert, getMany, update } from './db'
import { cookies } from 'next/headers'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días
const BCRYPT_ROUNDS = 10

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
    // Obtener usuario por username
    const user = await getOne(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? AND active = TRUE',
      [username]
    )

    if (!user) {
      return null
    }

    // Comparar contraseña con hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return null
    }

    // Retornar usuario sin el hash
    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
}

/**
 * Crear nuevo usuario con contraseña hasheada
 * @param {string} username - Usuario
 * @param {string} password - Contraseña (4 dígitos)
 * @param {string} email - Email
 * @returns {Object} Usuario creado
 */
export async function createUser(username, password, email = null) {
  // Validar que password sea 4 dígitos
  if (!/^\d{4}$/.test(password)) {
    throw new Error('Password must be 4 digits')
  }

  try {
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Insertar usuario
    const result = await insert('users', {
      username,
      password_hash: passwordHash,
      email,
      active: true,
      created_at: new Date().toISOString()
    })

    return {
      id: result.insertId,
      username,
      email,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}

/**
 * Cambiar contraseña del usuario
 * @param {number} userId - ID del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {boolean} Éxito/fallo
 */
export async function updatePassword(userId, currentPassword, newPassword) {
  // Validar que ambas contraseñas sean 4 dígitos
  if (!/^\d{4}$/.test(currentPassword) || !/^\d{4}$/.test(newPassword)) {
    throw new Error('Passwords must be 4 digits')
  }

  try {
    // Obtener usuario actual
    const user = await getOne(
      'SELECT password_hash FROM users WHERE id = ? AND active = TRUE',
      [userId]
    )

    if (!user) {
      throw new Error('User not found')
    }

    // Validar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    // Actualizar contraseña
    await update('users', { id: userId }, { password_hash: newPasswordHash })

    return true
  } catch (error) {
    console.error('Update password error:', error)
    throw error
  }
}

/**
 * Crear sesión
 * @param {number} userId - ID del usuario
 * @returns {string} Session token
 */
export async function createSession(userId) {
  const sessionToken = Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString()

  // Guardar sesión como cookies HTTPOnly
  const cookieStore = await cookies()

  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })

  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })

  // Log de login
  await logActivity(userId, 'login', { sessionToken }, 'success')

  return sessionToken
}

/**
 * Obtener usuario de la sesión actual
 * @returns {Object|null} Usuario si existe sesión válida, null si no
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
    const sessionToken = cookieStore.get('session_token')?.value

    if (!userId || !sessionToken) {
      return null
    }

    // Validar que usuario exista y esté activo
    const user = await getOne(
      'SELECT id, username, email FROM users WHERE id = ? AND active = TRUE',
      [parseInt(userId)]
    )

    return user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Validar sesión del usuario
 * @param {number} userId - ID del usuario
 * @returns {Object|null} Usuario si sesión es válida
 */
export async function validateSession(userId) {
  try {
    const user = await getOne(
      'SELECT id, username, email FROM users WHERE id = ? AND active = TRUE',
      [userId]
    )

    return user || null
  } catch (error) {
    console.error('Validate session error:', error)
    return null
  }
}

/**
 * Destruir sesión (logout)
 */
export async function destroySession(userId) {
  try {
    const cookieStore = await cookies()

    // Log de logout
    if (userId) {
      await logActivity(userId, 'logout', {}, 'success')
    }

    // Eliminar cookies
    cookieStore.delete('user_id')
    cookieStore.delete('session_token')
  } catch (error) {
    console.error('Destroy session error:', error)
  }
}

/**
 * Registrar log de actividad
 * @param {number} userId - ID del usuario
 * @param {string} action - Acción (login, logout, generate, validate, etc)
 * @param {Object} details - Detalles adicionales
 * @param {string} result - 'success' o 'error'
 */
export async function logActivity(userId, action, details = {}, result = 'success') {
  try {
    await insert('logs', {
      user_id: userId,
      action,
      details: JSON.stringify(details),
      result,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Log activity error:', error)
    // No lanzar error para no interrumpir flujos
  }
}

/**
 * Obtener logs del usuario
 * @param {number} userId - ID del usuario
 * @param {number} limit - Límite de registros
 * @returns {Array} Logs del usuario
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

/**
 * Obtener todos los usuarios (admin)
 * @returns {Array} Lista de usuarios
 */
export async function getAllUsers() {
  try {
    return await getMany(
      'SELECT id, username, email, active, created_at FROM users ORDER BY created_at DESC'
    )
  } catch (error) {
    console.error('Get all users error:', error)
    return []
  }
}

/**
 * Obtener usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Object|null} Usuario
 */
export async function getUserById(userId) {
  try {
    return await getOne(
      'SELECT id, username, email, active, created_at FROM users WHERE id = ?',
      [userId]
    )
  } catch (error) {
    console.error('Get user by ID error:', error)
    return null
  }
}

export default {
  validateLogin,
  createUser,
  updatePassword,
  createSession,
  getCurrentUser,
  validateSession,
  destroySession,
  logActivity,
  getUserLogs,
  getAllUsers,
  getUserById
}
