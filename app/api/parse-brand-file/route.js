/**
 * POST /api/parse-brand-file
 * Procesa archivos de marca (PDF, imagen, documento) y extrae datos con Claude
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { COMPACT_SCHEMA_INSTRUCTION, getMaxTokens } from '@/app/lib/prompt-schemas'

function getApiKey() {
  let apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    try {
      const envPath = join(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf8')
      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
      if (match) apiKey = match[1].trim()
    } catch (e) {
      try {
        const envPath = join(process.cwd(), '.env')
        const envContent = readFileSync(envPath, 'utf8')
        const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
        if (match) apiKey = match[1].trim()
      } catch (e2) {}
    }
  }
  return apiKey
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json(
        { error: 'API Key no configurada' },
        { status: 500 }
      )
    }

    // Convertir archivo a base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determinar tipo de archivo
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')

    let messageContent = []

    if (isImage) {
      // Para imágenes, usar vision API
      const mediaType = file.type
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64
        }
      })
    } else if (isPDF) {
      // Para PDFs, usar document API de Claude (soporta PDF nativamente)
      messageContent.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64
        }
      })
    }

    const extractionPrompt = `Analiza este archivo (puede ser una guía de marca, brochure, catálogo, presentación o imagen corporativa) y extrae TODA la información de marca posible.

Devuelve SOLO este JSON sin markdown:
{
  "basico": {"nombre": null, "rubro": null, "ciudad": null, "propuesta": null},
  "estrategico": {"mision": null, "vision": null, "valores": [], "beneficios_funcionales": null, "beneficios_emocionales": null},
  "audiencia": {"publico_objetivo": null, "audiencia_real": null, "pain_points": [], "gains": [], "motivaciones": null, "comportamiento_digital": null},
  "identidad": {"voz_tono": null, "claim": null, "narrativa": null, "territorio_creativo": null},
  "visual": {"tipografia": null, "colores": {"primario": null, "secundario": null, "acentos": []}, "estilo_visual": null, "recursos_graficos": null, "sistema_grafico": null, "mood_board": null},
  "posicionamiento": {"competencia": [], "diferenciadores": [], "propuesta_unica": null},
  "implementacion": {"canales": [], "formatos": [], "frecuencia": null},
  "comunicacion": {"keywords": [], "avoid": [], "tonalidad": [], "ejemplos": null}
}

Para colores: devuelve HEX (#RRGGBB). Para campos sin información clara: null.`

    messageContent.push({
      type: 'text',
      text: extractionPrompt
    })

    // Usar sonnet para PDFs (más capaz con documentos complejos), haiku para imágenes simples
    const model = isPDF ? 'claude-sonnet-4-5' : 'claude-haiku-4-5'

    // Llamar a Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': isPDF ? 'pdfs-2024-09-25' : undefined
      },
      body: JSON.stringify({
        model,
        max_tokens: isPDF ? 4000 : getMaxTokens('parse-brand-file'),
        system: 'Eres experto en branding estratégico. Responde SOLO JSON válido sin markdown ni explicaciones.',
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en Claude API')
    }

    const data = await response.json()
    let responseText = data.content[0].text.trim()

    // Limpiar markdown si existe
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parsear JSON
    let brandData = JSON.parse(responseText)

    // Asegurar estructura correcta con valores por defecto
    const defaultBrand = {
      basico: {
        nombre: null,
        rubro: null,
        ciudad: null,
        propuesta: null
      },
      estrategico: {
        mision: null,
        vision: null,
        valores: [],
        beneficios_funcionales: null,
        beneficios_emocionales: null
      },
      audiencia: {
        publico_objetivo: null,
        audiencia_real: null,
        pain_points: [],
        gains: [],
        motivaciones: null,
        comportamiento_digital: null
      },
      identidad: {
        voz_tono: null,
        claim: null,
        narrativa: null,
        territorio_creativo: null
      },
      visual: {
        tipografia: null,
        colores: {
          primario: null,
          secundario: null,
          acentos: []
        },
        estilo_visual: null,
        recursos_graficos: [],
        sistema_grafico: null,
        mood_board: null
      },
      posicionamiento: {
        competencia: [],
        diferenciadores: [],
        propuesta_unica: null
      },
      implementacion: {
        canales: [],
        formatos: [],
        frecuencia: null
      },
      comunicacion: {
        keywords: [],
        avoid: [],
        tonalidad: [],
        ejemplos: null
      }
    }

    // Merge recursivo para mantener estructura
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = { ...target[key], ...source[key] }
        } else {
          target[key] = source[key]
        }
      }
      return target
    }

    brandData = deepMerge(defaultBrand, brandData || {})

    return Response.json({
      success: true,
      brand: brandData
    })
  } catch (error) {
    console.error('Error en /api/parse-brand-file:', error.message)
    return Response.json(
      { error: 'Error procesando archivo: ' + error.message },
      { status: 500 }
    )
  }
}
