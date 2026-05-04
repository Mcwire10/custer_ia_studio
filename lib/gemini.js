/**
 * Wrapper para Google Gemini API
 * Implementa llamadas compatibles con el estilo de Anthropic
 */

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Obtiene la API key de Google desde las variables de entorno
 */
function getApiKey() {
  const key = process.env.GOOGLE_API_KEY
  if (!key) {
    throw new Error('GOOGLE_API_KEY no configurada')
  }
  return key
}

/**
 * Wrapper principal para llamadas a Gemini
 * @param {string} prompt - Prompt del usuario
 * @param {string} systemPrompt - System prompt (se convierte a instructions)
 * @param {object} options - Opciones adicionales
 * @param {string} options.model - Modelo a usar (default: gemini-1.5-flash)
 * @param {number} options.maxTokens - Límite de tokens de respuesta
 * @param {boolean} options.jsonMode - Si true, fuerza respuesta JSON
 * @returns {object} { text, usage }
 */
export async function callGemini(prompt, systemPrompt, options = {}) {
  const apiKey = getApiKey()
  const model = options.model || 'gemini-1.5-flash'
  const maxTokens = options.maxTokens || 8192
  const jsonMode = options.jsonMode || false

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`

  const contents = []

  if (systemPrompt) {
    contents.push({
      role: 'system',
      parts: [{ text: systemPrompt }]
    })
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  })

  const generationConfig = {
    maxOutputTokens: maxTokens,
    temperature: 1.0,
    topP: 0.95,
    topK: 40
  }

  if (jsonMode) {
    generationConfig.responseMimeType = 'application/json'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  const usageMetadata = data.usageMetadata || {}
  const usage = {
    promptTokens: usageMetadata.promptTokenCount || 0,
    completionTokens: usageMetadata.candidatesTokenCount || 0,
    totalTokens: usageMetadata.totalTokenCount || 0
  }

  return { text, usage }
}

/**
 * Versión para endpoints que devuelven JSON
 * Limpia markdown wrapper automáticamente
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {object} options
 * @returns {object} JSON parseado
 */
export async function callGeminiJSON(prompt, systemPrompt, options = {}) {
  const result = await callGemini(prompt, systemPrompt, { ...options, jsonMode: true })

  let text = result.text

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
    throw new Error('Gemini no devolvió JSON válido')
  }
}

/**
 * Gemini con Google Search grounding para web search
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {object} options
 * @returns {object} { text, usage, grounded }
 */
export async function callGeminiWithSearch(prompt, systemPrompt, options = {}) {
  const apiKey = getApiKey()
  const model = options.model || 'gemini-1.5-flash'
  const maxTokens = options.maxTokens || 8192

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`

  const contents = []

  if (systemPrompt) {
    contents.push({
      role: 'system',
      parts: [{ text: systemPrompt }]
    })
  }

  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools: [{
        google_search: {}
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 1.0,
        topP: 0.95,
        topK: 40
      }
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]

  let text = ''
  let grounded = false

  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.text) {
        text += part.text
      }
      if (part.functionCall) {
        grounded = true
      }
    }
  }

  if (!text && candidate?.groundingMetadata?.groundingChunks) {
    text = candidate.groundingMetadata.groundingChunks
      .map(chunk => chunk.web?.title || chunk.web?.url || '')
      .join('\n')
    grounded = true
  }

  const usageMetadata = data.usageMetadata || {}
  const usage = {
    promptTokens: usageMetadata.promptTokenCount || 0,
    completionTokens: usageMetadata.candidatesTokenCount || 0,
    totalTokens: usageMetadata.totalTokenCount || 0
  }

  return { text, usage, grounded }
}

/**
 * Wrapper para generar imágenes (usa gpt-image-1 de OpenAI que ya está configurado)
 * @param {string} prompt
 * @param {object} options
 * @returns {string} base64 de la imagen
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
 * Gemini con soporte de imágenes (visión)
 * @param {Array} images - Array de {data: base64, type: mimeType}
 * @param {string} prompt - Prompt del usuario
 * @param {string} systemPrompt - System prompt
 * @param {object} options - Opciones adicionales
 * @returns {object} { text, usage }
 */
export async function callGeminiVision(images, prompt, systemPrompt, options = {}) {
  const apiKey = getApiKey()
  const model = options.model || 'gemini-1.5-flash'
  const maxTokens = options.maxTokens || 8192

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`

  const contents = []

  if (systemPrompt) {
    contents.push({
      role: 'system',
      parts: [{ text: systemPrompt }]
    })
  }

  const parts = []

  for (const img of images) {
    let base64Data = img.data
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1]
    }

    const mimeType = img.type || 'image/jpeg'

    parts.push({
      inlineData: {
        mimeType,
        data: base64Data
      }
    })
  }

  parts.push({ text: prompt })

  contents.push({
    role: 'user',
    parts
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 1.0,
        topP: 0.95,
        topK: 40
      }
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Gemini Vision API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  const usageMetadata = data.usageMetadata || {}
  const usage = {
    promptTokens: usageMetadata.promptTokenCount || 0,
    completionTokens: usageMetadata.candidatesTokenCount || 0,
    totalTokens: usageMetadata.totalTokenCount || 0
  }

  return { text, usage }
}

/**
 * Gemini Vision con respuesta JSON
 * @param {Array} images
 * @param {string} prompt
 * @param {string} systemPrompt
 * @param {object} options
 * @returns {object} JSON parseado
 */
export async function callGeminiVisionJSON(images, prompt, systemPrompt, options = {}) {
  const apiKey = getApiKey()
  const model = options.model || 'gemini-1.5-flash'
  const maxTokens = options.maxTokens || 8192

  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`

  const contents = []

  if (systemPrompt) {
    contents.push({
      role: 'system',
      parts: [{ text: systemPrompt }]
    })
  }

  const parts = []

  for (const img of images) {
    let base64Data = img.data
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1]
    }

    const mimeType = img.type || 'image/jpeg'

    parts.push({
      inlineData: {
        mimeType,
        data: base64Data
      }
    })
  }

  parts.push({ text: prompt })

  contents.push({
    role: 'user',
    parts
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 1.0,
        topP: 0.95,
        topK: 40,
        responseMimeType: 'application/json'
      }
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Gemini Vision API error: ${response.status}`)
  }

  const data = await response.json()
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const usageMetadata = data.usageMetadata || {}
    const usage = {
      promptTokens: usageMetadata.promptTokenCount || 0,
      completionTokens: usageMetadata.candidatesTokenCount || 0,
      totalTokens: usageMetadata.totalTokenCount || 0
    }
    return { ...JSON.parse(text), _usage: usage }
  } catch (e) {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    }
    throw new Error('Gemini Vision no devolvió JSON válido')
  }
}