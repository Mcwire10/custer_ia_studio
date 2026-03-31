'use client'

import { useState } from 'react'

export default function CompetitionPane({ brain }) {
  const [competitorsText, setCompetitorsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    const competitors = competitorsText
      .split('\n')
      .map(c => c.trim())
      .filter(c => c)

    if (competitors.length === 0) {
      alert('Ingresa al menos un competidor')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/competition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors, brain })
      })

      if (!response.ok) throw new Error('Error analizando')
      const data = await response.json()
      setResult(data.analysis)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="pt">🔍 Análisis de Competencia</div>
      <div className="f">
        <label>Competidores</label>
        <textarea
          placeholder="Escribe los nombres de tus competidores (uno por línea)..."
          value={competitorsText}
          onChange={(e) => setCompetitorsText(e.target.value)}
          style={{ minHeight: '120px' }}
        />
      </div>
      <button
        className="btn btn-blue"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? '⟳ Analizando...' : '🔍 Analizar'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          {result.map((comp, i) => (
            <div key={i} style={{
              background: 'var(--pan2)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700' }}>{comp.name}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#F5A623' }}>
                  {comp.score}
                </div>
              </div>

              {comp.strengths && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Fortalezas
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', lineHeight: '1.5' }}>
                    {comp.strengths}
                  </div>
                </div>
              )}

              {comp.weaknesses && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: '#FF6B6B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Debilidades
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', lineHeight: '1.5' }}>
                    {comp.weaknesses}
                  </div>
                </div>
              )}

              {comp.positioning && (
                <div>
                  <div style={{ fontSize: '8px', fontWeight: '800', color: '#FFD166', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Posicionamiento
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', lineHeight: '1.5' }}>
                    {comp.positioning}
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
