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
  const dir = path.join(CEREBRO, '02_ADN_Marcas')
  try {
    const files = fs.readdirSync(dir)
    const match = files.find(f =>
      f.toLowerCase().includes(nombreCliente.toLowerCase())
    )
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
  const mentorAcido = getSystemPrompt()
  const adn = getADNMarca(nombreCliente)
  
  // Solo títulos — el modelo ya tiene el conocimiento, no necesita el texto completo
  const bibliotecaCondensada = `## Biblioteca de referencia (citá solo estas obras)
Seth Godin — Esto es Marketing | David Ogilvy — Confessions of an Advertising Man | 
Byron Sharp — How Brands Grow | Claude Hopkins — Scientific Advertising | 
Al Ries & Jack Trout — Positioning | Robert Cialdini — Influence | 
Eugene Schwartz — Breakthrough Advertising | Gary Halbert — The Boron Letters |
Rory Sutherland — Alchemy | Mark Ritson — varios | Martin Lindstrom — Brandwashed |
Douglas Holt — How Brands Become Icons | Phil Barden — Decoded |
Jonah Berger — Contagious | Malcolm Gladwell — The Tipping Point |
Dan Ariely — Predictably Irrational | BJ Fogg — Tiny Habits |
Donald Miller — Building a StoryBrand | Ryan Holiday — Trust Me I'm Lying |
David Aaker — Building Strong Brands | Kevin Lane Keller — Strategic Brand Management |
Bob Hoffman — Advertising for Skeptics | Byron Sharp — How Brands Grow 2 |
Les Binet & Peter Field — The Long and the Short of It | Ehrenberg-Bass Institute — varios`

  return [mentorAcido, bibliotecaCondensada, adn].filter(Boolean).join('\n\n---\n\n')
}
