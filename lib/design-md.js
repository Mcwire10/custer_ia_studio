import fs from 'fs'
import path from 'path'

const DESIGNS_DIR = path.join(process.cwd(), 'public', 'designs')

export function loadDesignSystem(brandName = 'custer') {
  const baseDesignPath = path.join(DESIGNS_DIR, 'generator.md')
  
  let designContent = ''
  
  if (fs.existsSync(baseDesignPath)) {
    designContent = fs.readFileSync(baseDesignPath, 'utf-8')
  }
  
  return designContent
}

export function formatDesignForPrompt(designContent, brandAdn = '') {
  if (!designContent) return ''
  
  return `

════════════════════════════════════════
DESIGN SYSTEM - Custer Generator
════════════════════════════════════════
${designContent}

${brandAdn ? `

════════════════════════════════════════
BRAND ADN (override del Design System)
════════════════════════════════════════
${brandAdn}
` : ''}

⚠️ IMPORTANTE: Respetá los tokens del Design System. Si la marca tiene ADN, el ADN overridea el Design System base.` 
}