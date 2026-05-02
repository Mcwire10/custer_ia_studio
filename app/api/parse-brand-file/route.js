/**
 * POST /api/parse-brand-file
 * Procesa archivos de marca (imagen) y extrae datos con Gemini
 * NOTA: PDFs no están soportados con Gemini
 */

import { callGemini, callGeminiVisionJSON } from '@/lib/gemini'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return Response.json({ error: 'Archivo requerido' }, { status: 400 })
    }

    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')

    if (isPDF) {
      return Response.json({
        error: 'PDF no soportado con Gemini. Podés usar imágenes (JPG, PNG, WebP) o texto.',
        hint: 'Subí una imagen del documento o pegá el contenido como texto'
      }, { status: 400 })
    }

    if (!isImage) {
      return Response.json({
        error: 'Tipo de archivo no soportado',
        supported: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    const base64 = Buffer.from(uint8Array).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const prompt = `Analizá este archivo de marca y extraé la información de branding en JSON.
Estructura esperada:
{
  "basico": {nombre, rubro, ciudad, propuesta},
  "estrategico": {mision, vision, valores[], beneficios_funcionales, beneficios_emocionales},
  "audiencia": {publico_objetivo, pain_points[], gains[], motivaciones},
  "identidad": {voz_tono, claim, narrativa},
  "visual": {tipografia, colores: {primario, secundario, acentos[]}, estilo_visual},
  "posicionamiento": {competencia[], diferenciadores[], propuesta_unica},
  "comunicacion": {keywords[], avoid[], tonalidad[]}
}

Respondé SOLO JSON válido.`

    const systemPrompt = 'Eres experto en branding. Extrae información de documentos e imágenes de marca.'

    let result
    try {
      result = await callGeminiVisionJSON([{ data: base64, type: mimeType }], prompt, systemPrompt, { maxTokens: 4000 })
    } catch (visionError) {
      console.warn('Vision failed, falling back to text:', visionError.message)
      result = await callGemini(prompt, systemPrompt, { maxTokens: 4000 })
      try {
        result = JSON.parse(result.text)
      } catch {
        throw new Error('No se pudo parsear la respuesta')
      }
    }

    return Response.json({
      success: true,
      brand: result,
      file: file.name,
      type: isImage ? 'image' : 'unknown'
    })

  } catch (error) {
    console.error('Error en /api/parse-brand-file:', error)
    return Response.json(
      { error: error.message || 'Error procesando archivo' },
      { status: 500 }
    )
  }
}