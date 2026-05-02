/**
 * API /api/conversations
 *
 * POST /api/conversations - Guardar mensaje y generar respuesta del agente
 * GET /api/conversations - Obtener historial de conversaciones
 *
 * Requiere autenticación: usuario debe estar logueado
 * Ahora usa Google Gemini
 */

import { getCurrentUser } from '@/lib/auth'
import { getBrand } from '@/lib/brands-db'
import {
  saveConversation,
  getConversations,
  getConversationCount,
  updateConversationSummary
} from '@/lib/conversations-db'
import { callGemini } from '@/lib/gemini'

/**
 * POST /api/conversations
 * Guarda un mensaje del usuario y genera respuesta del agente
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { brand_id, message, message_type = 'user_question', context = {} } = await request.json()

    if (!brand_id || !message) {
      return Response.json(
        { error: 'brand_id y message son requeridos' },
        { status: 400 }
      )
    }

    const brand = await getBrand(brand_id, user.id)
    if (!brand) {
      return Response.json(
        { error: 'Brand no encontrado o acceso denegado' },
        { status: 404 }
      )
    }

    const userConversation = await saveConversation(
      user.id,
      brand_id,
      'user',
      message,
      message_type,
      context,
      null,
      0
    )

    const agentResponse = await generateAgentResponse(
      message,
      brand,
      context
    )

    const agentConversation = await saveConversation(
      user.id,
      brand_id,
      'agent',
      agentResponse.text,
      'agent_response',
      { ...context, user_message: message },
      agentResponse.text,
      agentResponse.tokens_used
    )

    const conversationCount = await getConversationCount(user.id, brand_id)
    if (conversationCount % 10 === 0) {
      updateConversationSummaryAsync(user.id, brand_id)
    }

    console.log(`Conversation saved: user=${user.id}, brand=${brand_id}, type=${message_type}`)

    return Response.json({
      success: true,
      conversation_id: agentConversation.id,
      agent_response: agentResponse.text,
      tokens_used: agentResponse.tokens_used,
      user_message_id: userConversation.id
    })

  } catch (error) {
    console.error('Conversation POST error:', error)
    return Response.json(
      { error: error.message || 'Error guardando conversación' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/conversations
 * Obtener historial de conversaciones de una marca
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const brand_id = searchParams.get('brand_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!brand_id) {
      return Response.json(
        { error: 'brand_id es requerido' },
        { status: 400 }
      )
    }

    const brand = await getBrand(brand_id, user.id)
    if (!brand) {
      return Response.json(
        { error: 'Brand no encontrado o acceso denegado' },
        { status: 404 }
      )
    }

    const conversations = await getConversations(user.id, brand_id, limit)

    return Response.json({
      success: true,
      conversations,
      count: conversations.length
    })

  } catch (error) {
    console.error('Conversation GET error:', error)
    return Response.json(
      { error: error.message || 'Error obteniendo conversaciones' },
      { status: 500 }
    )
  }
}

/**
 * Generar respuesta del agente usando Gemini
 */
async function generateAgentResponse(userMessage, brand, context = {}) {
  try {
    const brandContext = `
Eres un asistente de marketing experto para la marca: ${brand.nombre}

Información de la marca:
- Rubro: ${brand.rubro || 'No especificado'}
- Propuesta de valor: ${brand.propuesta || 'No especificada'}
- Público objetivo: ${brand.publico || 'No especificado'}
- Tipografía principal: ${brand.tipografia_principal || 'No especificada'}
- Colores principales: ${brand.color_primario} (primario), ${brand.color_secundario} (secundario)
- Estilo visual: ${brand.estilo_visual || 'No especificado'}

Tono de voz: ${brand.voz_tono || 'Profesional y amigable'}
Registro: ${brand.registro || 'Formal'}
`

    const systemPrompt = brandContext + `
Tu rol es ayudar a mejorar y optimizar el marketing de esta marca. Proporciona recomendaciones prácticas, específicas y alineadas con la identidad de la marca.

Responde siempre en español. Sé conciso pero completo. Ofrece insights accionables.`

    const result = await callGemini(userMessage, systemPrompt, { maxTokens: 1024 })

    return {
      text: result.text,
      tokens_used: result.usage.totalTokens || 0
    }

  } catch (error) {
    console.error('Generate agent response error:', error)
    throw error
  }
}

/**
 * Actualizar resumen de conversación de forma asincrónica
 */
async function updateConversationSummaryAsync(userId, brandId) {
  try {
    const conversations = await getConversations(userId, brandId, 50)

    const conversationText = conversations
      .map(c => `${c.type === 'user' ? 'Usuario' : 'Agente'}: ${c.message}`)
      .join('\n')

    const result = await callGemini(
      `Resume esta conversación sobre la marca y extrae los insights principales:\n\n${conversationText}`,
      'Eres un analista de marketing. Genera un resumen conciso de la conversación y extrae 3-5 insights clave.',
      { maxTokens: 500 }
    )

    const summary = result.text
    const insights = extractInsights(summary)

    await updateConversationSummary(userId, brandId, summary, insights)

    console.log(`Conversation summary updated: user=${userId}, brand=${brandId}`)

  } catch (error) {
    console.error('Update conversation summary error:', error)
  }
}

function extractInsights(summaryText) {
  const lines = summaryText.split('\n')
  const insights = []

  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
      insights.push({
        insight: trimmed.replace(/^[-•*\d.]\s*/, ''),
        frequency: 1,
        impact: 'medium'
      })
    }
  })

  return insights.slice(0, 5)
}