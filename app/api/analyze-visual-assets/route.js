/**
 * POST /api/analyze-visual-assets
 * Analiza imágenes de marca para extraer colores, tipografía y estilo visual
 * Ahora usa Google Gemini Vision
 */

import { callGeminiVisionJSON } from '@/lib/gemini'

const systemPrompt = `Eres un experto en branding visual. Analiza imágenes de marca y extrae información de branding estructurada.

Respondé SOLO JSON válido con esta estructura:
{
  "colors": [
    {"hex": "#RRGGBB", "name": "nombre del color", "usage": "donde se usa", "confidence": 85}
  ],
  "typography": {
    "family": "nombre de la tipografía o null",
    "style": "serif|sans-serif|decorative",
    "weights": ["regular", "bold"],
    "confidence": 85
  },
  "style": {
    "classification": "moderno/minimalista/elegante/urbano/etc",
    "elements": ["elemento visual 1", "elemento 2"],
    "emotions": ["profesional", "moderno"],
    "palette": "cool/warm/neutral"
  },
  "overall_confidence": 88
}`

export async function POST(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 })
    }

    const analyses = []

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)

        const maxSize = 5 * 1024 * 1024
        if (uint8Array.length > maxSize) {
          console.warn(`File ${file.name} exceeds 5MB limit`)
          continue
        }

        const base64 = Buffer.from(uint8Array).toString('base64')
        const mimeType = file.type || 'image/jpeg'

        const images = [{ data: base64, type: mimeType }]
        const prompt = `Analiza esta imagen de marca (${file.name}) y extrae los datos de branding.`

        const analysis = await callGeminiVisionJSON(images, prompt, systemPrompt, { maxTokens: 1024 })
        analyses.push(analysis)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        continue
      }
    }

    if (analyses.length === 0) {
      return Response.json({ error: 'No se pudieron analizar las imágenes' }, { status: 400 })
    }

    const consolidated = consolidateAnalyses(analyses)

    return Response.json({
      success: true,
      analysis: consolidated,
      individualAnalyses: analyses,
      count: analyses.length
    })

  } catch (error) {
    console.error('Error en /api/analyze-visual-assets:', error)
    return Response.json(
      { error: error.message || 'Error analizando assets visuales' },
      { status: 500 }
    )
  }
}

function consolidateAnalyses(analyses) {
  if (analyses.length === 0) {
    return {
      colors: [],
      typography: null,
      style: null
    }
  }

  const colorMap = {}
  analyses.forEach(analysis => {
    if (analysis.colors) {
      analysis.colors.forEach(color => {
        const key = color.hex?.toUpperCase()
        if (key) {
          if (!colorMap[key]) {
            colorMap[key] = { ...color, count: 1, totalConfidence: color.confidence || 70 }
          } else {
            colorMap[key].count++
            colorMap[key].totalConfidence += color.confidence || 70
          }
        }
      })
    }
  })

  const colors = Object.values(colorMap)
    .map(c => ({
      ...c,
      confidence: Math.round(c.totalConfidence / c.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  let typography = null
  const typographyCandidates = analyses
    .filter(a => a.typography)
    .map(a => a.typography)
  if (typographyCandidates.length > 0) {
    typography = typographyCandidates[0]
  }

  let style = null
  const styleCandidates = analyses
    .filter(a => a.style)
    .map(a => a.style)
  if (styleCandidates.length > 0) {
    style = styleCandidates[0]
  }

  return { colors, typography, style }
}