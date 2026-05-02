import fs from 'fs'
import path from 'path'

const CEREBRO = path.join(process.cwd(), 'cerebro')

function read(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

// System prompt del Mentor Ácido Creativo
export function getSystemPrompt() {
  return read(path.join(CEREBRO, '00_SOP_Agencia/System_Prompt_Mentor.md'))
}

// Índice completo de la biblioteca teórica (25 libros)
export function getBibliotecaTeorica() {
  return read(path.join(CEREBRO, '01_Biblioteca_Teorica/Indice_Teoria.md'))
}

// ADN de una marca específica por nombre parcial (case-insensitive)
export function getADNMarca(nombreCliente) {
  if (!nombreCliente) return null
  
  const dir = path.join(CEREBRO, '02_ADN_Marcas')
  try {
    const files = fs.readdirSync(dir)
    
    // Mapeo explícito para evitar falsos positivos
    const exactMap = {
      'citroën le parc': 'Citroën_Le_Parc.md',
      'citroen le parc': 'Citroën_Le_Parc.md',
      'custer': 'Custer.md',
      "drink's argentina": "Drink's_ARG.md",
      "drinks argentina": "Drink's_ARG.md",
      "drink's vm": "Drink's_VM.md",
      "drinks vm": "Drink's_VM.md",
      "drink's villa maría": "Drink's_VM.md",
      'farmavida': 'Farmavida.md',
      'grupo fonte': 'Grupo Fonte.md',
      'grupo odontho': 'Grupo_Odontho.md',
      'multicars': 'Multicars.md',
      'nacho vottero': 'Nacho_Vottero.md',
      'nobeles': 'Nobeles.md',
      'nōbeles': 'Nobeles.md',
      'patio club': 'Patio_Club.md',
      'peugeot le parc': 'Peugeot_Le_Parc.md',
      'punto de fuga': 'Punto_de_Fuga.md',
      'wecar': 'WeCar.md',
      'we car': 'WeCar.md',
      'wo shopping': 'WO_Shopping.md',
      'wo': 'WO_Shopping.md'
    }
    
    const key = nombreCliente.toLowerCase().trim()
    if (exactMap[key]) {
      const found = files.find(f => f === exactMap[key])
      if (found) return read(path.join(dir, found))
    }
    
    // Fallback: búsqueda por palabras clave
    const normalized = nombreCliente.toLowerCase().replace(/[\s'&]/g, '')
    const match = files.find(f => {
      const fNorm = f.toLowerCase().replace('.md', '').replace(/[\s'&]/g, '')
      return fNorm.includes(normalized) || normalized.includes(fNorm)
    })
    return match ? read(path.join(dir, match)) : null
  } catch {
    return null
  }
}

// Lista de todos los clientes con ADN en el vault
export function listarClientesConADN() {
  const dir = path.join(CEREBRO, '02_ADN_Marcas')
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && !f.startsWith('Template'))
      .map(f => f.replace('.md', ''))
  } catch {
    return []
  }
}

// Contexto completo para el Generador: sistema + biblioteca + ADN del cliente
export function getContextoGenerador(nombreCliente) {
  const systemPrompt = getSystemPrompt()
  const biblioteca = getBibliotecaTeorica()
  const adn = nombreCliente ? getADNMarca(nombreCliente) : null

  const partes = []

  if (systemPrompt) {
    partes.push(`# ROL Y COMPORTAMIENTO\n${systemPrompt}`)
  }

  if (biblioteca) {
    partes.push(`# BIBLIOTECA TEÓRICA (solo citás libros de esta lista)\n${biblioteca}`)
  }

  if (adn) {
    partes.push(`# ADN DE LA MARCA CON LA QUE TRABAJÁS HOY\n${adn}`)
  }

  return partes.join('\n\n---\n\n')
}

// Contexto para el Validador: sistema + ADN del cliente
export function getContextoValidador(nombreCliente) {
  const systemPrompt = getSystemPrompt()
  const adn = nombreCliente ? getADNMarca(nombreCliente) : null

  const partes = []
  if (systemPrompt) partes.push(`# ROL Y COMPORTAMIENTO\n${systemPrompt}`)
  if (adn) partes.push(`# ADN DE LA MARCA A VALIDAR\n${adn}`)

  return partes.join('\n\n---\n\n')
}
