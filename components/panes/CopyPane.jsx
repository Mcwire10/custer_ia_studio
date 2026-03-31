'use client'

import { useState } from 'react'

const PLATFORMS = ['LinkedIn', 'Instagram', 'Twitter', 'WhatsApp', 'Email']

export default function CopyPane({ brain }) {
  const [theme, setTheme] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleGenerate = async () => {
    if (!theme.trim() || selectedPlatforms.length === 0) {
      alert('Ingresa tema y selecciona plataformas')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, platforms: selectedPlatforms, brain })
      })

      if (!response.ok) throw new Error('Error generando copy')
      const data = await response.json()
      setResult(data.copies)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="pt">✍️ Generador de Copy</div>
      <div className="f">
        <label>Tema</label>
        <input
          placeholder="Ej: Lanzamiento de nuevo producto"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
      </div>
      <div className="f">
        <label>Plataformas</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {PLATFORMS.map(p => (
            <button
              key={p}
              className={`asel ${selectedPlatforms.includes(p) ? 'on' : ''}`}
              onClick={() => togglePlatform(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <button
        className="btn btn-gold"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? '⟳ Generando...' : '✍️ Generar Copy'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          {Object.entries(result).map(([platform, content]) => (
            <div key={platform} style={{
              background: 'var(--pan2)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ fontSize: '8px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {platform}
              </div>
              {content.headline && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Headline
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.82)', lineHeight: '1.6' }}>
                    {content.headline}
                  </div>
                </div>
              )}
              {content.body && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Body
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.82)', lineHeight: '1.6' }}>
                    {content.body}
                  </div>
                </div>
              )}
              {content.cta && (
                <div>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    CTA
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '700' }}>
                    {content.cta}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
