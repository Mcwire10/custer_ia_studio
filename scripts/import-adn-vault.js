#!/usr/bin/env node
/**
 * Importa fichas ADN de Obsidian al Brand Brain de Custer.
 *
 * Uso:
 *   node scripts/import-adn-vault.js                  → lista clientes disponibles
 *   node scripts/import-adn-vault.js "Drink's ARG"    → importa ese cliente
 *   node scripts/import-adn-vault.js --all            → importa todos
 *
 * Requiere que el servidor esté corriendo en localhost:3000
 * y que exista un usuario autenticado (ajustá USER_ID abajo).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CEREBRO = path.join(__dirname, '..', 'cerebro', '02_ADN_Marcas')
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const USER_ID = process.env.USER_ID || 1

// Mapea secciones del Markdown ADN a campos del Brand Brain
function parseADNMarkdown(contenido) {
  const brain = {}

  const get = (seccion) => {
    const regex = new RegExp(`## ${seccion}[\\s\\S]*?(?=\\n## |$)`, 'i')
    const match = contenido.match(regex)
    return match ? match[0].replace(`## ${seccion}`, '').trim() : ''
  }

  const getTablaValor = (contenido, campo) => {
    const regex = new RegExp(`\\*\\*${campo}\\*\\*\\s*\\|\\s*([^\\|\\n]+)`, 'i')
    const match = contenido.match(regex)
    return match ? match[1].trim() : ''
  }

  // Slide 1 — Identidad básica
  brain.nombre = getTablaValor(contenido, 'Nombre')
  brain.rubro = getTablaValor(contenido, 'Sector')
  brain.ciudad = getTablaValor(contenido, 'Mercado')

  // Slide 2 — Voz & Tono
  brain.voz = getTablaValor(contenido, 'Voz')
  brain.tono = getTablaValor(contenido, 'Tono')
  brain.actitud = getTablaValor(contenido, 'Actitud')
  brain.energia = getTablaValor(contenido, 'Energía')

  // Slide 3 — Propósito
  const esencia = get('Esencia de Marca')
  brain.proposito = esencia.replace(/^>/, '').trim()

  const posicionamiento = get('Posicionamiento')
  brain.diferenciadores = posicionamiento

  const valores = get('Valores Fundamentales')
  brain.valores = valores

  // Slide 4 — Audiencia
  brain.publico_objetivo = getTablaValor(contenido, 'Audiencia primaria')

  // Slide 5 — Visual
  brain.color_primario = getTablaValor(contenido, 'Paleta')?.match(/#[A-Fa-f0-9]{6}/)?.[0] || ''
  brain.tipografia = getTablaValor(contenido, 'Tipografía')
  brain.estilo_visual = getTablaValor(contenido, 'Estética general')
  brain.fotografia = getTablaValor(contenido, 'Fotografía')

  // Slide 7 — Comunicación
  const mensajes = get('Mensajes Clave por Audiencia')
  brain.mensajes_clave = mensajes

  // Slide 2 — Lo que NO es
  const noEs = get('Lo que esta marca NO es')
  brain.maximas = noEs

  // Slide 3 — Notas estratégicas
  const notas = get('Notas Estratégicas')
  brain.notas_estrategicas = notas

  // Arquetipos
  const arquetipos = get('Arquetipos de Marca')
  brain.arquetipos = arquetipos

  return brain
}

async function importarCliente(nombreArchivo) {
  const filePath = path.join(CEREBRO, nombreArchivo)
  const contenido = fs.readFileSync(filePath, 'utf-8')
  const brain = parseADNMarkdown(contenido)

  console.log(`\nImportando: ${nombreArchivo}`)
  console.log(`  Nombre detectado: ${brain.nombre || '(no detectado)'}`)
  console.log(`  Color primario: ${brain.color_primario || '(no detectado)'}`)
  console.log(`  Tipografía: ${brain.tipografia || '(no detectado)'}`)

  // POST al API de Custer
  const res = await fetch(`${BASE_URL}/api/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: USER_ID,
      name: brain.nombre || nombreArchivo.replace('.md', ''),
      color: brain.color_primario,
      typography: brain.tipografia,
      data: brain,
      source: 'obsidian-vault'
    })
  })

  if (res.ok) {
    const data = await res.json()
    console.log(`  ✅ Importado con ID: ${data.id || data.brandId}`)
  } else {
    const err = await res.text()
    console.log(`  ❌ Error: ${err}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const archivos = fs.readdirSync(CEREBRO).filter(f => f.endsWith('.md') && !f.startsWith('Template'))

  if (args.length === 0) {
    console.log('\nClientes disponibles en el vault:')
    archivos.forEach((f, i) => console.log(`  ${i + 1}. ${f}`))
    console.log('\nUso: node scripts/import-adn-vault.js "nombre" o --all')
    return
  }

  if (args[0] === '--all') {
    for (const archivo of archivos) {
      await importarCliente(archivo)
    }
  } else {
    const busqueda = args.join(' ')
    const match = archivos.find(f => f.toLowerCase().includes(busqueda.toLowerCase()))
    if (match) {
      await importarCliente(match)
    } else {
      console.log(`\n❌ No se encontró "${busqueda}" en el vault.`)
      console.log('Archivos disponibles:', archivos.join(', '))
    }
  }
}

main().catch(console.error)
