/**
 * Wrapper para Anthropic Claude API
 * Implementa llamadas con los mismos nombres de función para compatibilidad
 */

import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY no configurada')
  }
  return new Anthropic({ apiKey: key })
}

/**
 * Wrapper principal para llamadas a Claude
 * @param {string} prompt - Prompt del usuario
 * @param {string} systemPrompt - System prompt
 * @param {object} options - Opciones adicionales
 * @param {string} options.model - Modelo (default: claude-sonnet-4-20250514)
 * @param {number} options.maxTokens - Límite de tokens
 * @param {boolean} options.jsonMode - Si true, fuerza respuesta JSON
 * @returns {object} { text, usage }
 */
export async function callGemini(prompt, systemPrompt, options = {}) {
  const client = getClient()
  const model = options.model || 'claude-sonnet-4-20250514'
  const maxTokens = options.maxTokens || 8192
  const jsonMode = options.jsonMode || false

  const messages = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  // Usar system como parámetro separado en Anthropic
  let system = null
  if (systemPrompt) {
    system = systemPrompt
  }

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: system || undefined,
      messages: [{ role: 'user', content: prompt }],
      temperature: 1.0
    })

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    return {
      text: jsonMode ? text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim() : text,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      }
    }
  } catch (error) {
    console.error('Anthropic API error:', error.message)
    throw error
  }
}

/**
 * Versión para endpoints que devuelven JSON
 */
export async function callGeminiJSON(prompt, systemPrompt, options = {}) {
  const result = await callGemini(prompt, systemPrompt, { ...options, jsonMode: true })

  let text = result.text

  // Limpiar markdown wrappers
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  try {
    return { ...JSON.parse(text), _usage: result.usage }
  } catch (e) {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return { ...JSON.parse(text.slice(jsonStart, jsonEnd + 1)), _usage: result.usage }
    }
    throw new Error('Claude no devolvió JSON válido')
  }
}

/**
 * Claude con búsqueda web (simulada — Anthropic no tiene search nativo como Gemini)
 * Usaremos un approach simple: Claude responde basado en su conocimiento
 */
export async function callGeminiWithSearch(prompt, systemPrompt, options = {}) {
  const enhancedPrompt = `${prompt}\n\nUtilizá tu conocimiento más actualizado para responder. Si necesitás información de internet, indicá que es una estimación basada en tu conocimiento.`
  return callGemini(enhancedPrompt, systemPrompt, options)
}

/**
 * Generar imagen usando gpt-image-1 (OpenAI)
 */
export async function generateImage(prompt, options = {}) {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY no configurada')
  }

  const size = options.size || '1024x1024'
  const outputFormat = options.outputFormat || 'base64'

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      output_format: outputFormat
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI image generation error')
  }

  const data = await response.json()
  const b64 = data.data?.[0]?.[outputFormat]
  if (!b64) {
    throw new Error('OpenAI no devolvió imagen')
  }

  return `data:image/png;base64,${b64}`
}

/**
 * Claude Vision (para análisis de imágenes)
 */
export async function callGeminiVision(images, prompt, systemPrompt, options = {}) {
  const client = getClient()
  const model = options.model || 'claude-sonnet-4-20250514'
  const maxTokens = options.maxTokens || 4096

  const content = []

  // Agregar imágenes
  for (const img of Array.isArray(images) ? images : [images]) {
    if (img.startsWith('data:') || img.startsWith('http')) {
      content.push({
        type: 'image_url',
        image_url: { url: img }
      })
    }
  }

  // Agregar prompt
  content.push({ type: 'text', text: prompt })

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content }],
      temperature: 0.7
    })

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    return {
      text,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      }
    }
  } catch (error) {
    console.error('Anthropic Vision API error:', error.message)
    throw error
  }
}

/**
 * Claude Vision con respuesta JSON
 */
export async function callGeminiVisionJSON(images, prompt, systemPrompt, options = {}) {
  const result = await callGeminiVision(images, prompt, systemPrompt, options)

  let text = result.text
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  try {
    return JSON.parse(text)
  } catch (e) {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    }
    throw new Error('Claude Vision no devolvió JSON válido')
  }
}
