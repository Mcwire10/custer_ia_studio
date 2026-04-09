/**
 * Conversations Database Functions
 * Gestiona operaciones de conversaciones en MySQL
 */

import { getPool } from './db.js'

/**
 * Guardar mensaje de conversación
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 * @param {string} type - 'user' | 'agent'
 * @param {string} message - Contenido del mensaje
 * @param {string} messageType - Tipo de mensaje (text, image, recommendation, etc)
 * @param {object} context - Contexto del mensaje
 * @param {string} agentResponse - Respuesta del agente (si type='agent')
 * @param {number} tokensUsed - Tokens usados por Claude
 */
export async function saveConversation(
  userId,
  brandId,
  type,
  message,
  messageType = 'text',
  context = {},
  agentResponse = null,
  tokensUsed = 0
) {
  const pool = getPool()

  try {
    const query = `
      INSERT INTO conversations (
        user_id,
        brand_id,
        type,
        message,
        message_type,
        context,
        agent_response,
        tokens_used,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `

    const [result] = await pool.execute(query, [
      userId,
      brandId,
      type,
      message,
      messageType,
      JSON.stringify(context || {}),
      agentResponse,
      tokensUsed
    ])

    return {
      id: result.insertId,
      user_id: userId,
      brand_id: brandId,
      type,
      message,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error saving conversation:', error)
    throw error
  }
}

/**
 * Obtener conversaciones de una marca
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 * @param {number} limit - Límite de mensajes
 */
export async function getConversations(userId, brandId, limit = 50) {
  const pool = getPool()

  try {
    const query = `
      SELECT
        id,
        type,
        message,
        message_type,
        agent_response,
        tokens_used,
        created_at
      FROM conversations
      WHERE user_id = ? AND brand_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `

    const [rows] = await pool.execute(query, [userId, brandId, limit])

    // Invertir para mostrar en orden cronológico (más antiguo primero)
    return rows.reverse()
  } catch (error) {
    console.error('Error getting conversations:', error)
    throw error
  }
}

/**
 * Obtener conversación específica
 * @param {number} conversationId - ID de la conversación
 * @param {number} userId - ID del usuario (para validación)
 */
export async function getConversation(conversationId, userId) {
  const pool = getPool()

  try {
    const query = `
      SELECT
        id,
        type,
        message,
        message_type,
        agent_response,
        tokens_used,
        context,
        created_at
      FROM conversations
      WHERE id = ? AND user_id = ?
    `

    const [rows] = await pool.execute(query, [conversationId, userId])

    if (rows.length === 0) {
      return null
    }

    const conv = rows[0]
    return {
      ...conv,
      context: conv.context ? JSON.parse(conv.context) : {}
    }
  } catch (error) {
    console.error('Error getting conversation:', error)
    throw error
  }
}

/**
 * Obtener resumen de conversación
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 */
export async function getConversationSummary(userId, brandId) {
  const pool = getPool()

  try {
    const query = `
      SELECT
        id,
        summary,
        key_insights,
        conversation_count,
        total_messages,
        last_message_date,
        updated_at
      FROM conversation_summaries
      WHERE user_id = ? AND brand_id = ?
    `

    const [rows] = await pool.execute(query, [userId, brandId])

    if (rows.length === 0) {
      return null
    }

    const summary = rows[0]
    return {
      ...summary,
      key_insights: summary.key_insights ? JSON.parse(summary.key_insights) : []
    }
  } catch (error) {
    console.error('Error getting conversation summary:', error)
    throw error
  }
}

/**
 * Actualizar resumen de conversación
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 * @param {string} summary - Resumen en texto
 * @param {array} keyInsights - Array de insights
 */
export async function updateConversationSummary(userId, brandId, summary, keyInsights = []) {
  const pool = getPool()

  try {
    // Contar mensajes
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM conversations WHERE user_id = ? AND brand_id = ?',
      [userId, brandId]
    )
    const totalMessages = countRows[0].total

    const query = `
      INSERT INTO conversation_summaries (
        user_id,
        brand_id,
        summary,
        key_insights,
        conversation_count,
        total_messages,
        last_message_date,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        summary = VALUES(summary),
        key_insights = VALUES(key_insights),
        conversation_count = VALUES(conversation_count),
        total_messages = VALUES(total_messages),
        last_message_date = VALUES(last_message_date),
        updated_at = NOW()
    `

    const [result] = await pool.execute(query, [
      userId,
      brandId,
      summary,
      JSON.stringify(keyInsights || []),
      Math.ceil(totalMessages / 2), // Aproximado de pares user-agent
      totalMessages
    ])

    return {
      id: result.insertId || result.affectedRows,
      user_id: userId,
      brand_id: brandId,
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating conversation summary:', error)
    throw error
  }
}

/**
 * Obtener últimas N conversaciones de un usuario
 * @param {number} userId - ID del usuario
 * @param {number} limit - Límite
 */
export async function getRecentConversations(userId, limit = 20) {
  const pool = getPool()

  try {
    const query = `
      SELECT DISTINCT
        c.brand_id,
        b.nombre as brand_name,
        COUNT(*) as message_count,
        MAX(c.created_at) as last_message
      FROM conversations c
      JOIN brands b ON c.brand_id = b.id
      WHERE c.user_id = ?
      GROUP BY c.brand_id, b.nombre
      ORDER BY last_message DESC
      LIMIT ?
    `

    const [rows] = await pool.execute(query, [userId, limit])
    return rows
  } catch (error) {
    console.error('Error getting recent conversations:', error)
    throw error
  }
}

/**
 * Contar conversaciones de una marca
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 */
export async function getConversationCount(userId, brandId) {
  const pool = getPool()

  try {
    const query = `
      SELECT COUNT(*) as total FROM conversations
      WHERE user_id = ? AND brand_id = ?
    `

    const [rows] = await pool.execute(query, [userId, brandId])
    return rows[0].total
  } catch (error) {
    console.error('Error getting conversation count:', error)
    return 0
  }
}

/**
 * Guardar insight de conversación
 * @param {number} userId - ID del usuario
 * @param {number} brandId - ID de la marca
 * @param {string} insightType - Tipo de insight
 * @param {string} insightText - Texto del insight
 * @param {number} confidence - Nivel de confianza 0-1
 */
export async function saveConversationInsight(userId, brandId, insightType, insightText, confidence = 0.75) {
  const pool = getPool()

  try {
    const query = `
      INSERT INTO conversation_insights (
        user_id,
        brand_id,
        insight_type,
        insight_text,
        confidence,
        mention_count,
        source,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 1, 'conversation', NOW())
      ON DUPLICATE KEY UPDATE
        mention_count = mention_count + 1,
        last_mentioned = NOW()
    `

    const [result] = await pool.execute(query, [
      userId,
      brandId,
      insightType,
      insightText,
      confidence
    ])

    return result.insertId || result.affectedRows
  } catch (error) {
    console.error('Error saving conversation insight:', error)
    // No lanzar error para no interrumpir flujos
    return null
  }
}

export default {
  saveConversation,
  getConversations,
  getConversation,
  getConversationSummary,
  updateConversationSummary,
  getRecentConversations,
  getConversationCount,
  saveConversationInsight
}
