/**
 * Script para importar todo el Cerebro de la Agencia a la base de datos
 * Ejecutar: curl -X POST https://vercel.app/api/setup/import-cerebro
 */

import { query, getPool } from '@/lib/db'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request) {
  try {
    console.log('🔄 Importando cerebro...')
    const pool = await getPool()
    
    // ==================== CREAR TABLAS ====================
    
    // 1. Tabla de contenido teórico (biblioteca)
    await query(`
      CREATE TABLE IF NOT EXISTS content_library (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        content TEXT,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_category (category)
      )
    `)
    console.log('✓ Tabla content_library creada')

    // 2. Tabla de system prompts
    await query(`
      CREATE TABLE IF NOT EXISTS system_prompts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        prompt TEXT NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      )
    `)
    console.log('✓ Tabla system_prompts creada')

    // 3. Tabla de templates
    await query(`
      CREATE TABLE IF NOT EXISTS templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        template_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type)
      )
    `)
    console.log('✓ Tabla templates creada')

    // ==================== IMPORTAR ARCHIVOS ====================
    
    const cerebrPath = join(process.cwd(), 'cerebro')
    let imported = { brands: 0, content: 0, prompts: 0, templates: 0 }
    
    // 1. Importar ADNs de Marca (02_ADN_Marcas/)
    const adnPath = join(cerebrPath, '02_ADN_Marcas')
    if (existsSync(adnPath)) {
      const adnFiles = readdirSync(adnPath).filter(f => f.endsWith('.md'))
      for (const file of adnFiles) {
        const name = file.replace('.md', '').replace(/_/g, ' ')
        const content = readFileSync(join(adnPath, file), 'utf-8')
        
        // Extraer color primario del contenido
        let colorPrimario = '#3d39ac' // default Custer
        const colorMatch = content.match(/color[_\s]primario[:\s]*#?([0-9a-fA-F]{3,6})/i)
        if (colorMatch) {
          colorPrimario = '#' + colorMatch[1]
        }
        
        await query(
          `INSERT IGNORE INTO brands (user_id, name, color_primario, data) VALUES (1, ?, ?, ?)`,
          [name, colorPrimario, JSON.stringify({ fullContent: content, imported: true })]
        )
        imported.brands++
      }
      console.log(`✓ ${imported.brands} marcas importadas`)
    }

    // 2. Importar Biblioteca Teórica (01_Biblioteca_Teorica/)
    const teoriaPath = join(cerebrPath, '01_Biblioteca_Teorica')
    if (existsSync(teoriaPath)) {
      const teoriaFiles = readdirSync(teoriaPath).filter(f => f.endsWith('.md'))
      for (const file of teoriaFiles) {
        const content = readFileSync(join(teoriaPath, file), 'utf-8')
        const title = file.replace('.md', '').replace(/_/g, ' ')
        
        await query(
          `INSERT INTO content_library (type, title, category, content, file_path) VALUES (?, ?, ?, ?, ?)`,
          ['teoria', title, 'Biblioteca', content, `01_Biblioteca_Teorica/${file}`]
        )
        imported.content++
      }
      console.log(`✓ ${imported.content} contenidos teóricos`)
    }

    // 3. Importar System Prompt Mentor (00_SOP_Agencia/)
    const sopPath = join(cerebrPath, '00_SOP_Agencia')
    if (existsSync(sopPath)) {
      const sopFiles = readdirSync(sopPath).filter(f => f.endsWith('.md'))
      for (const file of sopFiles) {
        const content = readFileSync(join(sopPath, file), 'utf-8')
        const name = file.replace('.md', '').replace(/_/g, ' ')
        
        await query(
          `INSERT INTO system_prompts (name, description, prompt, category) VALUES (?, ?, ?, ?)`,
          [name, `System prompt para ${name}`, content, 'mentor']
        )
        imported.prompts++
      }
      console.log(`✓ ${imported.prompts} system prompts`)
    }

    // 4. Importar Templates (04_Templates/)
    const templatePath = join(cerebrPath, '04_Templates')
    if (existsSync(templatePath)) {
      const templateFiles = readdirSync(templatePath).filter(f => f.endsWith('.md'))
      for (const file of templateFiles) {
        const content = readFileSync(join(templatePath, file), 'utf-8')
        const name = file.replace('.md', '').replace(/_/g, ' ')
        
        await query(
          `INSERT INTO templates (name, type, description, template_content) VALUES (?, ?, ?, ?)`,
          [name, 'caso_exito', `Template ${name}`, content]
        )
        imported.templates++
      }
      console.log(`✓ ${imported.templates} templates`)
    }

    return Response.json({
      success: true,
      message: 'Cerebro importado exitosamente',
      imported
    })

  } catch (error) {
    console.error('Error importando cerebro:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}