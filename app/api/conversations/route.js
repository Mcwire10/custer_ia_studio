/**
 * API /api/conversations
 *
 * POST /api/conversations - Guardar mensaje y generar respuesta del agente
 * GET /api/conversations - Obtener historial de conversaciones
 *
 * Requiere autenticación: usuario debe estar logueado
 */

import { getCurrentUser } from '@/lib/auth'
import { getBrand } from '@/lib/brands-db'
import {
  saveConversation,
  getConversations,
  getConversationCount,
  updateConversationSummary
} from '@/lib/conversations-db'
import { Anthropic } from '@anthropic-ai/sdk'

const client = new Anthropic()

/**
 * POST /api/conversations
 * Guarda un mensaje del usuario y genera respuesta del agente
 */
export async function POST(request) {
  try {
    // 1. Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Parsear request
    const { brand_id, message, message_type = 'user_question', context = {} } = await request.json()

    if (!brand_id || !message) {
      return Response.json(
        { error: 'brand_id y message son requeridos' },
        { status: 400 }
      )
    }

    // 3. Validar que el usuario sea dueño del brand
    const brand = await getBrand(brand_id, user.id)
    if (!brand) {
      return Response.json(
        { error: 'Brand no encontrado o acceso denegado' },
        { status: 404 }
      )
    }

    // 4. Guardar mensaje del usuario
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

    // 5. Generar respuesta del agente
    const agentResponse = await generateAgentResponse(
      message,
      brand,
      context
    )

    // 6. Guardar respuesta del agente
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

    // 7. Actualizar resumen cada 10 mensajes
    const conversationCount = await getConversationCount(user.id, brand_id)
    if (conversationCount % 10 === 0) {
      // Ejecutar asincronamente sin esperar
      updateConversationSummaryAsync(user.id, brand_id)
    }

    // 8. Log de actividad
    console.log(`Conversation saved: user=${user.id}, brand=${brand_id}, type=${message_type}`)

    return Response.json({
      success: true,
      conversation_id: agentConversation.id,
      agent_response: agentResponse.text,
      tokens_used: agentResponse.tokens_used,
      message_id: userConversation.id
    })

  } catch (error) {
    console.error('Conversation POST error:', error)
    return Response.json(
      { error: 'Error al procesar la conversación' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/conversations
 * Obtiene el historial de conversaciones de una marca
 *
 * Query params:
 *   - brand_id (requerido): ID de la marca
 *   - limit (opcional): Límite de mensajes (default: 50)
 */
export async function GET(request) {
  try {
    // 1. Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // 2. Obtener parámetros
    const { searchParams } = new URL(request.url)
    const brandId = parseInt(searchParams.get('brand_id'))
    const limit = parseInt(searchParams.get('limit')) || 50

    if (!brandId) {
      return Response.json(
        { error: 'brand_id es requerido' },
        { status: 400 }
      )
    }

    // 3. Validar que el usuario sea dueño del brand
    const brand = await getBrand(brandId, user.id)
    if (!brand) {
      return Response.json(
        { error: 'Brand no encontrado o acceso denegado' },
        { status: 404 }
      )
    }

    // 4. Obtener conversaciones
    const conversations = await getConversations(user.id, brandId, limit)

    // 5. Formatear respuesta
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      type: conv.type,
      message: conv.message,
      message_type: conv.message_type,
      agent_response: conv.agent_response,
      tokens_used: conv.tokens_used,
      created_at: conv.created_at,
      context: conv.context ? JSON.parse(conv.context) : {}
    }))

    return Response.json({
      success: true,
      brand_id: brandId,
      count: formattedConversations.length,
      conversations: formattedConversations
    })

  } catch (error) {
    console.error('Conversation GET error:', error)
    return Response.json(
      { error: 'Error al obtener conversaciones' },
      { status: 500 }
    )
  }
}

/**
 * Generar respuesta del agente usando Claude
 * Incluye contexto del brand y conversaciones previas
 */
async function generateAgentResponse(userMessage, brand, context = {}) {
  try {
    // Construir prompt con contexto de marca
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

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    })

    // Extraer texto y tokens
    const text = response.content[0].text
    const tokens_used = response.usage.output_tokens + response.usage.input_tokens

    return {
      text,
      tokens_used
    }

  } catch (error) {
    console.error('Generate agent response error:', error)
    throw error
  }
}

/**
 * Actualizar resumen de conversación de forma asincrónica
 * NO bloqueamos la respuesta esperando esto
 */
async function updateConversationSummaryAsync(userId, brandId) {
  try {
    // Obtener últimas conversaciones
    const conversations = await getConversations(userId, brandId, 50)

    // Consolidar en un texto
    const conversationText = conversations
      .map(c => `${c.type === 'user' ? 'Usuario' : 'Agente'}: ${c.message}`)
      .join('\n')

    // Generar resumen con Claude
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: 'Eres un analista de marketing. Genera un resumen conciso de la conversación y extrae 3-5 insights clave.',
      messages: [
        {
          role: 'user',
          content: `Resume esta conversación sobre la marca y extrae los insights principales:\n\n${conversationText}`
        }
      ]
    })

    const summary = response.content[0].text

    // Extraer insights (simple parsing)
    const insights = extractInsights(summary)

    // Guardar resumen
    await updateConversationSummary(userId, brandId, summary, insights)

    console.log(`Conversation summary updated: user=${userId}, brand=${brandId}`)

  } catch (error) {
    console.error('Update conversation summary error:', error)
    // No throw - esto es background, no debe fallar la request principal
  }
}

/**
 * Extraer insights del resumen generado por Claude
 * Simple parsing: busca líneas que comiencen con "-" o números
 */
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

  return insights.slice(0, 5) // Máximo 5 insights
}
