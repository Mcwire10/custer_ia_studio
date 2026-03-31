'use client'

import { useState, useEffect } from 'react'
import './BrandBrain.css'

export default function BrandBrainPane({ brain, setBrain }) {
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('identity')

  const handleChange = (field, value) => {
    setBrain({ ...brain, [field]: value })
  }

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custer_brain', JSON.stringify(brain))
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Sections del formulario
  const sections = {
    identity: {
      title: '🏢 Identidad de Marca',
      icon: '🏢',
      fields: [
        { key: 'nombre', label: 'Nombre de la marca', placeholder: 'Ej: Custer', type: 'text' },
        { key: 'rubro', label: 'Rubro / Industria', placeholder: 'Ej: Marketing Digital', type: 'text' },
        { key: 'ciudad', label: 'Ciudad / Mercado', placeholder: 'Ej: Villa María, Córdoba', type: 'text' },
        { key: 'propuesta', label: 'Propuesta de valor', placeholder: '¿Qué hacés y por qué importa?', type: 'textarea' },
        { key: 'publico', label: 'Público objetivo', placeholder: '¿A quién le hablás?', type: 'textarea' }
      ]
    },
    visual: {
      title: '🎨 Identidad Visual',
      icon: '🎨',
      fields: [
        { key: 'color1', label: 'Color primario', type: 'color' },
        { key: 'color2', label: 'Color acento', type: 'color' },
        { key: 'colorBg', label: 'Color fondo', type: 'color' },
        { key: 'colorText', label: 'Color texto', type: 'color' },
        { key: 'font', label: 'Tipografía principal', placeholder: 'Ej: Montserrat Bold', type: 'text' }
      ]
    },
    voice: {
      title: '💬 Tono y Voz',
      icon: '💬',
      fields: [
        { key: 'registro', label: 'Registro', type: 'select', options: ['formal-conversacional', 'disruptivo', 'técnico', 'aspiracional', 'cercano'] },
        { key: 'keywords', label: 'Keywords (una por línea)', type: 'textarea' },
        { key: 'tonalidad', label: 'Tonalidad', type: 'textarea' }
      ]
    }
  }

  return (
    <div className="brain-container">
      {/* LADO IZQUIERDO: Formulario */}
      <div className="brain-form">
        {/* Tabs de secciones */}
        <div className="brain-tabs">
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              className={`brain-tab ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <span className="brain-tab-icon">{section.icon}</span>
              <span className="brain-tab-label">{section.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Contenido del formulario */}
        <div className="brain-form-content">
          <div className="brain-section-title">
            {sections[activeSection].title}
          </div>

          <div className="brain-fields">
            {sections[activeSection].fields.map((field) => (
              <div key={field.key} className="brain-field">
                <label className="brain-label">{field.label}</label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    className="brain-input"
                    placeholder={field.placeholder}
                    value={brain[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    className="brain-textarea"
                    placeholder={field.placeholder}
                    value={brain[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  />
                )}

                {field.type === 'color' && (
                  <div className="brain-color-input">
                    <input
                      type="color"
                      className="brain-color-picker"
                      value={brain[field.key] || '#3730C4'}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                    <input
                      type="text"
                      className="brain-color-text"
                      value={brain[field.key] || '#3730C4'}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <select
                    className="brain-select"
                    value={brain[field.key] || 'formal-conversacional'}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <button className="brain-save-btn" onClick={handleSave}>
            <span className="brain-save-icon">💾</span>
            Guardar Brand Brain
          </button>
          {saved && <div className="brain-saved">✓ Guardado</div>}
        </div>
      </div>

      {/* LADO DERECHO: Preview Visual */}
      <div className="brain-preview">
        <div className="brain-preview-card">
          {/* Header del preview */}
          <div className="brain-preview-header">
            <div className="brain-preview-title">Vista Previa de tu Marca</div>
          </div>

          {/* Colors showcase */}
          <div className="brain-colors-showcase">
            <div className="brain-color-box">
              <div
                className="brain-color-swatch"
                style={{ backgroundColor: brain.color1 || '#3730C4' }}
              ></div>
              <span>Primario</span>
              <code>{brain.color1 || '#3730C4'}</code>
            </div>
            <div className="brain-color-box">
              <div
                className="brain-color-swatch"
                style={{ backgroundColor: brain.color2 || '#F5A623' }}
              ></div>
              <span>Acento</span>
              <code>{brain.color2 || '#F5A623'}</code>
            </div>
            <div className="brain-color-box">
              <div
                className="brain-color-swatch"
                style={{ backgroundColor: brain.colorBg || '#0D0C1E' }}
              ></div>
              <span>Fondo</span>
              <code>{brain.colorBg || '#0D0C1E'}</code>
            </div>
            <div className="brain-color-box">
              <div
                className="brain-color-swatch"
                style={{ backgroundColor: brain.colorText || '#FFFFFF' }}
              ></div>
              <span>Texto</span>
              <code>{brain.colorText || '#FFFFFF'}</code>
            </div>
          </div>

          {/* Brand mockup */}
          <div className="brain-mockup">
            <div
              className="brain-mockup-header"
              style={{
                background: `linear-gradient(135deg, ${brain.color1 || '#3730C4'}, ${brain.color2 || '#F5A623'})`,
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: '900' }}>
                c<span style={{ color: 'white' }}>uster</span>
              </div>
            </div>
            <div className="brain-mockup-body">
              <div className="brain-mockup-section">
                <div className="brain-mockup-label">Marca</div>
                <div className="brain-mockup-value">{brain.nombre || 'Tu Marca'}</div>
              </div>
              <div className="brain-mockup-section">
                <div className="brain-mockup-label">Rubro</div>
                <div className="brain-mockup-value">{brain.rubro || 'Tu Industria'}</div>
              </div>
              <div className="brain-mockup-section">
                <div className="brain-mockup-label">Propuesta</div>
                <div className="brain-mockup-value">
                  {(brain.propuesta || 'Tu propuesta de valor').substring(0, 60)}...
                </div>
              </div>
              <div className="brain-mockup-section">
                <div className="brain-mockup-label">Tono</div>
                <div className="brain-mockup-value">
                  {brain.registro?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Formal'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="brain-stats">
            <div className="brain-stat">
              <div className="brain-stat-number">{brain.keywords?.length || 0}</div>
              <div className="brain-stat-label">Keywords</div>
            </div>
            <div className="brain-stat">
              <div className="brain-stat-number">{brain.tonalidad?.length || 0}</div>
              <div className="brain-stat-label">Tonalidades</div>
            </div>
            <div className="brain-stat">
              <div className="brain-stat-number">100%</div>
              <div className="brain-stat-label">Completitud</div>
            </div>
          </div>

          {/* Hint */}
          <div className="brain-hint">
            💡 <strong>Pro tip:</strong> Tu Brand Brain es la base de todo.
            Cuanto más detallado, mejores resultados en IA.
          </div>
        </div>
      </div>
    </div>
  )
}
