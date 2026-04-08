/**
 * POST /api/analyze-visual-assets
 * Analyzes uploaded images for brand colors, typography, and visual style
 * Supports: JPG, PNG, WebP, GIF, MP4, HEIC, AVIF
 */

import Anthropic from '@anthropic-ai/sdk'
import { convertToJpeg, isValidSize, resizeIfNeeded, detectMimeType } from '@/app/lib/media-converter'

const client = new Anthropic()

export async function POST(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 })
    }

    const analyses = []

    // Process each image
    for (const file of files) {
      try {
        // Read file buffer
        const buffer = await file.arrayBuffer()
        const bufferView = new Uint8Array(buffer)

        // Validate size
        if (!isValidSize(bufferView)) {
          console.warn(`File ${file.name} exceeds 5MB limit`)
          continue
        }

        // Detect MIME type (from file.type or magic bytes)
        let mimeType = file.type
        if (!mimeType || mimeType === 'application/octet-stream') {
          mimeType = detectMimeType(bufferView) || file.type
        }

        // Validate format
        if (!mimeType || !mimeType.includes('image') && !mimeType.includes('video')) {
          console.warn(`Unsupported format: ${mimeType}`)
          continue
        }

        // Convert to JPEG if needed
        let jpegBuffer
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
          jpegBuffer = bufferView
        } else {
          try {
            jpegBuffer = await convertToJpeg(bufferView, mimeType)
          } catch (error) {
            console.warn(`Failed to convert ${mimeType}: ${error.message}`)
            continue
          }
        }

        // Resize if too large
        try {
          jpegBuffer = await resizeIfNeeded(jpegBuffer)
        } catch (error) {
          console.warn(`Failed to resize image: ${error.message}`)
        }

        // Convert to base64 for Claude Vision
        const base64Image = Buffer.from(jpegBuffer).toString('base64')

        // Analyze with Claude Vision
        const analysis = await analyzeImageWithClaude(base64Image, file.name)
        analyses.push(analysis)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        continue
      }
    }

    if (analyses.length === 0) {
      return Response.json(
        { error: 'No images could be analyzed' },
        { status: 400 }
      )
    }

    // Consolidate analyses
    const consolidatedAnalysis = consolidateAnalyses(analyses)

    return Response.json({
      success: true,
      analysis: consolidatedAnalysis,
      analyzed_count: analyses.length,
      total_count: files.length
    })
  } catch (error) {
    console.error('Error en /api/analyze-visual-assets:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Analyze single image with Claude Vision
 */
async function analyzeImageWithClaude(base64Image, fileName) {
  const systemPrompt = `Eres un experto en análisis de marca visual. Analiza esta imagen y extrae:

1. COLORES DOMINANTES (top 3-5):
   - Código hex (#RRGGBB)
   - Nombre del color
   - Confianza (0-100%)

2. TIPOGRAFÍA DETECTADA:
   - Familia (si es identificable)
   - Estilo (serif, sans-serif, decorativa)
   - Pesos visibles (bold, regular, etc)

3. ESTILO VISUAL:
   - Clasificación (moderno, clásico, minimalista, lúdico, corporativo, etc)
   - Elementos dominantes (formas geométricas, texturas, patterns, etc)
   - Emociones evocadas (profesional, creativo, amigable, lujoso, etc)
   - Paleta general (warm, cool, neutral, colorful)

Responde SOLO en JSON válido, sin markdown:
{
  "colors": [
    {"hex": "#XXXXXX", "name": "nombre", "confidence": 95}
  ],
  "typography": {
    "family": "nombre o null",
    "style": "serif|sans-serif|decorative",
    "weights": ["regular", "bold"],
    "confidence": 85
  },
  "style": {
    "classification": "moderno",
    "elements": ["elemento1", "elemento2"],
    "emotions": ["profesional", "moderno"],
    "palette": "cool"
  },
  "overall_confidence": 88
}`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Analiza esta imagen de marca (${fileName}) y extrae los datos de branding.`
            }
          ]
        }
      ]
    })

    const responseText = message.content[0]?.text || '{}'

    // Parse JSON response
    let analysis
    try {
      // Try direct parse
      analysis = JSON.parse(responseText)
    } catch (e) {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse Claude response')
      }
    }

    return analysis
  } catch (error) {
    console.error('Claude Vision analysis error:', error)
    throw error
  }
}

/**
 * Consolidate multiple image analyses
 */
function consolidateAnalyses(analyses) {
  if (analyses.length === 0) {
    return {
      colors: [],
      typography: null,
      style: null
    }
  }

  // Consolidate colors (weighted average by confidence)
  const colorMap = {}
  analyses.forEach(analysis => {
    if (analysis.colors) {
      analysis.colors.forEach(color => {
        const hex = color.hex?.toLowerCase() || ''
        if (hex) {
          colorMap[hex] = colorMap[hex]
            ? {
                ...colorMap[hex],
                confidence: (colorMap[hex].confidence + color.confidence) / 2
              }
            : color
        }
      })
    }
  })

  const colors = Object.values(colorMap)
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 5)

  // Consolidate typography (most common)
  const typographies = analyses
    .map(a => a.typography)
    .filter(Boolean)

  const typography = typographies.length > 0
    ? typographies.reduce((acc, t) => ({
        family: t.family || acc.family,
        style: t.style || acc.style,
        weights: [...new Set([...(acc.weights || []), ...(t.weights || [])])],
        confidence: Math.max(t.confidence || 0, acc.confidence || 0)
      }))
    : null

  // Consolidate style (most common elements)
  const styles = analyses
    .map(a => a.style)
    .filter(Boolean)

  const style = styles.length > 0
    ? {
        classification: styles[0]?.classification || 'moderno',
        elements: Array.from(
          new Set(styles.flatMap(s => s.elements || []))
        ),
        emotions: Array.from(
          new Set(styles.flatMap(s => s.emotions || []))
        ),
        palette: styles[0]?.palette || 'neutral'
      }
    : null

  // Overall confidence
  const overallConfidence = Math.round(
    analyses.reduce((sum, a) => sum + (a.overall_confidence || 75), 0) / analyses.length
  )

  return {
    colors,
    typography,
    style,
    overall_confidence: overallConfidence,
    analysis_count: analyses.length
  }
}
