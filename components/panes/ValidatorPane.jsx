'use client'

import { useState } from 'react'

export default function ValidatorPane({ brain }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleValidate = async () => {
    if (!message.trim()) {
      alert('Escribe un mensaje para validar')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, brain })
      })

      if (!response.ok) throw new Error('Error validando')
      const data = await response.json()
      setResult(data.validation)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="pt">🎯 Validador de Mensajes</div>
      <div className="f">
        <label>Mensaje a validar</label>
        <textarea
          placeholder="Escribe el mensaje que quieres validar contra tu marca..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button
        className="btn btn-blue"
        onClick={handleValidate}
        disabled={loading}
      >
        {loading ? '⟳ Validando...' : '🔍 Validar'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            padding: '16px',
            background: result.aligned ? 'rgba(74,222,128,.1)' : 'rgba(255,107,107,.1)',
            border: `1px solid ${result.aligned ? 'rgba(74,222,128,.3)' : 'rgba(255,107,107,.3)'}`,
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '900',
              color: result.aligned ? '#4ADE80' : '#FF6B6B',
              marginBottom: '10px'
            }}>
              {result.aligned ? '✓ Alineado' : '⚠ No alineado'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              Score: {result.score}%
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)', lineHeight: '1.6', marginBottom: '12px' }}>
              {result.feedback}
            </div>
            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#FFD166', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Sugerencias:
                </div>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,.7)', marginBottom: '6px' }}>
                    • {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
