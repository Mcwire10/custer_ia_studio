/**
 * POST /api/setup-cerebro
 * Lee las fichas ADN del vault (/cerebro/02_ADN_Marcas/) y las carga al Brand Brain (MySQL).
 * Usar una sola vez para inicializar la DB con todas las marcas existentes.
 * Solo accesible por usuarios autenticados.
 */

import fs from 'fs'
import path from 'path'
import { getCurrentUser } from '@/lib/auth'
import { saveBrand, getBrandByName } from '@/lib/brands-db'

const ADN_DIR = path.join(process.cwd(), 'cerebro', '02_ADN_Marcas')

function getTablaValor(contenido, campo) {
  const regex = new RegExp(`\\*\\*${campo}\\*\\*\\s*\\|\\s*([^|\\n]+)`, 'i')
  const match = contenido.match(regex)
  return match ? match[1].trim() : ''
}

function getSeccion(contenido, seccion) {
  const regex = new RegExp(`## ${seccion}[\\s\\S]*?(?=\\n## |$)`, 'i')
  const match = contenido.match(regex)
  return match ? match[0].replace(`## ${seccion}`, '').trim() : ''
}

function parseADN(contenido, filename) {
  const nombre = getTablaValor(contenido, 'Nombre') || filename.replace('.md', '').replace(/_/g, ' ')
  const color_primario = getTablaValor(contenido, 'Paleta')?.match(/#[A-Fa-f0-9]{6}/)?.[0] || ''
  const tipografia = getTablaValor(contenido, 'Tipografía') || ''

  return {
    nombre,
    rubro: getTablaValor(contenido, 'Sector'),
    ciudad: getTablaValor(contenido, 'Mercado'),
    publico_objetivo: getTablaValor(contenido, 'Audiencia primaria'),
    canal_principal: getTablaValor(contenido, 'Canal principal'),
    color_primario,
    tipografia,
    estilo_visual: getTablaValor(contenido, 'Estética general'),
    fotografia: getTablaValor(contenido, 'Fotografía'),
    voz: getTablaValor(contenido, 'Voz'),
    tono: getTablaValor(contenido, 'Tono'),
    actitud: getTablaValor(contenido, 'Actitud'),
    energia: getTablaValor(contenido, 'Energía'),
    proposito: getSeccion(contenido, 'Esencia de Marca').replace(/^>/, '').trim(),
    valores: getSeccion(contenido, 'Valores Fundamentales'),
    diferenciadores: getSeccion(contenido, 'Posicionamiento'),
    mensajes_clave: getSeccion(contenido, 'Mensajes Clave por Audiencia'),
    maximas: getSeccion(contenido, 'Lo que esta marca NO es'),
    notas_estrategicas: getSeccion(contenido, 'Notas Estratégicas'),
    arquetipos: getSeccion(contenido, 'Arquetipos de Marca'),
    referencias_bibliograficas: getSeccion(contenido, 'Referencias Bibliográficas Aplicadas'),
    fuente: 'obsidian-vault'
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!fs.existsSync(ADN_DIR)) {
      return Response.json({ error: `Carpeta del cerebro no encontrada: ${ADN_DIR}` }, { status: 500 })
    }

    const archivos = fs.readdirSync(ADN_DIR)
      .filter(f => f.endsWith('.md') && !f.startsWith('Template') && !f.startsWith('Nombre'))

    const resultados = []

    for (const archivo of archivos) {
      const contenido = fs.readFileSync(path.join(ADN_DIR, archivo), 'utf-8')
      const brand = parseADN(contenido, archivo)

      if (!brand.nombre) {
        resultados.push({ archivo, status: 'skipped', reason: 'Sin nombre detectado' })
        continue
      }

      // Verificar si ya existe
      try {
        const existente = await getBrandByName(brand.nombre)
        if (existente) {
          resultados.push({ archivo, nombre: brand.nombre, status: 'already_exists', id: existente.id })
          continue
        }
      } catch {}

      const result = await saveBrand(brand, user.id)
      resultados.push({ archivo, nombre: brand.nombre, status: 'created', id: result.id })
    }

    const creadas = resultados.filter(r => r.status === 'created').length
    const existentes = resultados.filter(r => r.status === 'already_exists').length
    const skipped = resultados.filter(r => r.status === 'skipped').length

    return Response.json({
      success: true,
      resumen: { total: archivos.length, creadas, existentes, skipped },
      detalle: resultados
    })
  } catch (error) {
    console.error('Error en /api/setup-cerebro:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
