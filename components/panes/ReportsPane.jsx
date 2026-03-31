'use client'

import { useState } from 'react'

export default function ReportsPane({ brain, car }) {
  const [reportLoading, setReportLoading] = useState(false)
  const [report, setReport] = useState(null)

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateReport = async () => {
    setReportLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brain, carousel: car })
      })

      if (!response.ok) throw new Error('Error generando reporte')
      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="panel">
      <div className="pt">📊 Reportes y Exportación</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          className="btn btn-gold"
          onClick={() => downloadJSON(brain, 'custer-brand-brain.json')}
        >
          💾 Exportar Brand Brain
        </button>
        <button
          className="btn btn-gold"
          disabled={!car}
          onClick={() => downloadJSON(car, 'custer-carousel.json')}
        >
          💾 Exportar Carousel
        </button>
      </div>

      <button
        className="btn btn-blue"
        style={{ marginTop: '10px' }}
        onClick={handleGenerateReport}
        disabled={reportLoading}
      >
        {reportLoading ? '⟳ Generando...' : '📈 Generar Reporte Ejecutivo'}
      </button>

      {report && (
        <div style={{ marginTop: '20px' }}>
          {report.title && (
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px' }}>
              {report.title}
            </h2>
          )}

          {report.summary && (
            <div style={{
              background: 'rgba(75,70,212,.1)',
              border: '1px solid rgba(104,96,238,.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '14px',
              fontSize: '11px',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,.8)'
            }}>
              {report.summary}
            </div>
          )}

          {report.kpis && Object.keys(report.kpis).length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>
                KPIs Recomendados
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '7px' }}>
                {Object.entries(report.kpis).map(([key, value]) => (
                  <div key={key} style={{
                    background: 'var(--pan2)',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,.38)', fontWeight: '700', marginBottom: '6px' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.recommendations && report.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#FFD166', marginBottom: '8px' }}>
                Recomendaciones
              </div>
              {report.recommendations.map((rec, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '8px',
                  background: 'rgba(255,255,255,.03)',
                  borderRadius: '7px',
                  marginBottom: '5px',
                  border: '1px solid rgba(255,255,255,.06)'
                }}>
                  <div style={{ fontSize: '14px', flexShrink: 0 }}>💡</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.75)', lineHeight: '1.45' }}>
                    {rec}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
