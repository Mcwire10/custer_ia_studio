'use client'

import { useState } from 'react'

export default function GeneratorPane({ brain, car, setCar, si, setSi }) {
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState('educativo')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const generateCarousel = async () => {
    if (!topic.trim()) {
      setMessage('Ingresa un tema')
      return
    }

    setLoading(true)
    setMessage('Generando carousel…')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, brain })
      })

      if (!response.ok) throw new Error('Error generando')

      const data = await response.json()
      setCar(data.carousel)
      setSi(0)
      setMessage('✓ Carousel generado')
      setTopic('')
    } catch (error) {
      setMessage('✗ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="pt">✦ Generador de Carouseles</div>

      <div className="f">
        <label>Tema</label>
        <input
          placeholder="Ej: Transformación digital para pymes"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && generateCarousel()}
        />
      </div>

      <div className="f">
        <label>Formato</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="educativo">Educativo</option>
          <option value="comercial">Comercial</option>
          <option value="inspiracional">Inspiracional</option>
          <option value="tecnico">Técnico</option>
        </select>
      </div>

      <button
        className="btn btn-blue"
        onClick={generateCarousel}
        disabled={loading}
      >
        {loading ? '⟳ Generando…' : '✦ Generar Carousel'}
      </button>

      {message && (
        <div style={{
          fontSize: '11px',
          padding: '10px',
          marginTop: '10px',
          borderRadius: '6px',
          background: message.startsWith('✓') ? 'rgba(74,222,128,.1)' : 'rgba(255,107,107,.1)',
          color: message.startsWith('✓') ? '#4ADE80' : '#FF6B6B'
        }}>
          {message}
        </div>
      )}

      {car && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
            📌 {car.topic} ({car.slides?.length || 0} slides)
          </div>
          <button
            className="btn btn-gold"
            onClick={() => {
              const blob = new Blob([JSON.stringify(car, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'custer-carousel.json'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            📥 Descargar JSON
          </button>
        </div>
      )}
    </div>
  )
}
