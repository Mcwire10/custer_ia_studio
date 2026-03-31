'use client'

import { useState, useEffect } from 'react'

export default function BrandBrainPane({ brain, setBrain }) {
  const [saved, setSaved] = useState(false)

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

  return (
    <div className="bb-cols">
      <div className="bb-l">
        <div className="panel">
          <div className="pt">🏢 Identidad</div>
          <div className="f">
            <label>Nombre de la marca</label>
            <input
              placeholder="Ej: Custer"
              value={brain.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
            />
          </div>
          <div className="f">
            <label>Rubro / Industria</label>
            <input
              placeholder="Ej: Agencia de marketing digital"
              value={brain.rubro || ''}
              onChange={(e) => handleChange('rubro', e.target.value)}
            />
          </div>
          <div className="f">
            <label>Ciudad / Mercado</label>
            <input
              placeholder="Ej: Villa María, Córdoba"
              value={brain.ciudad || ''}
              onChange={(e) => handleChange('ciudad', e.target.value)}
            />
          </div>
          <div className="f">
            <label>Propuesta de valor</label>
            <textarea
              placeholder="¿Qué hacés y por qué eso importa?"
              value={brain.propuesta || ''}
              onChange={(e) => handleChange('propuesta', e.target.value)}
            />
          </div>
          <div className="f">
            <label>Público objetivo</label>
            <textarea
              placeholder="¿A quién le hablás? Describí a tu cliente ideal."
              value={brain.publico || ''}
              onChange={(e) => handleChange('publico', e.target.value)}
            />
          </div>
        </div>

        <div className="panel">
          <div className="pt">🎨 Visual</div>
          <div className="r2">
            <div className="f">
              <label>Color primario</label>
              <input
                value={brain.color1 || '#3730C4'}
                onChange={(e) => handleChange('color1', e.target.value)}
              />
            </div>
            <div className="f">
              <label>Color acento</label>
              <input
                value={brain.color2 || '#F5A623'}
                onChange={(e) => handleChange('color2', e.target.value)}
              />
            </div>
          </div>
          <div className="r2">
            <div className="f">
              <label>Fondo</label>
              <input
                value={brain.colorBg || '#0D0C1E'}
                onChange={(e) => handleChange('colorBg', e.target.value)}
              />
            </div>
            <div className="f">
              <label>Texto</label>
              <input
                value={brain.colorText || '#FFFFFF'}
                onChange={(e) => handleChange('colorText', e.target.value)}
              />
            </div>
          </div>
          <div className="f">
            <label>Tipografía</label>
            <input
              placeholder="Ej: Montserrat Bold"
              value={brain.font || 'Montserrat Bold'}
              onChange={(e) => handleChange('font', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bb-r">
        <div className="panel">
          <div className="pt">💬 Tono y voz</div>
          <div className="f">
            <label>Registro</label>
            <select
              value={brain.registro || 'formal-conversacional'}
              onChange={(e) => handleChange('registro', e.target.value)}
            >
              <option value="formal-conversacional">Formal-conversacional (B2B amable)</option>
              <option value="disruptivo">Disruptivo / provocador</option>
              <option value="tecnico">Técnico / experto</option>
              <option value="aspiracional">Aspiracional / motivador</option>
              <option value="cercano">Cercano / cotidiano</option>
            </select>
          </div>
          <div className="f">
            <label>Keywords de marca</label>
            <textarea
              placeholder="Ej: innovación, confianza, velocidad (una por línea)"
              value={brain.keywords?.join('\n') || ''}
              onChange={(e) =>
                handleChange('keywords', e.target.value.split('\n').filter(k => k.trim()))
              }
            />
          </div>
          <div className="f">
            <label>Tonalidad</label>
            <textarea
              placeholder="Ej: Directo y transparente (una por línea)"
              value={brain.tonalidad?.join('\n') || ''}
              onChange={(e) =>
                handleChange('tonalidad', e.target.value.split('\n').filter(t => t.trim()))
              }
            />
          </div>

          <button className="btn btn-gold" onClick={handleSave}>
            💾 Guardar Brand Brain
          </button>
          {saved && <div className="bb-ok show">✓ Guardado</div>}

          <div className="brain-prev">
            <pre>{JSON.stringify(brain, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
