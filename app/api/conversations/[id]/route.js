/**
 * API /api/conversations/[id]
 *
 * GET /api/conversations/:id - Obtener una conversación específica
 */

import { getCurrentUser } from '@/lib/auth'
import { getConversation } from '@/lib/conversations-db'

/**
 * GET /api/conversations/:id
 * Obtiene una conversación específica con su contexto completo
 */
export async function GET(request, { params }) {
  try {
    // 1. Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener ID de la conversación
    const conversationId = parseInt(params.id)
    if (!conversationId || isNaN(conversationId)) {
      return Response.json(
        { error: 'ID de conversación inválido' },
        { status: 400 }
      )
    }

    // 3. Obtener conversación
    const conversation = await getConversation(conversationId, user.id)

    if (!conversation) {
      return Response.json(
        { error: 'Conversación no encontrada o acceso denegado' },
        { status: 404 }
      )
    }

    // 4. Formatear respuesta
    return Response.json({
      success: true,
      conversation: {
        id: conversation.id,
        type: conversation.type,
        message: conversation.message,
        message_type: conversation.message_type,
        agent_response: conversation.agent_response,
        tokens_used: conversation.tokens_used,
        created_at: conversation.created_at,
        context: conversation.context ? JSON.parse(conversation.context) : {}
      }
    })

  } catch (error) {
    console.error('Conversation GET error:', error)
    return Response.json(
      { error: 'Error al obtener la conversación' },
      { status: 500 }
    )
  }
}
