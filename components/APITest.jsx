'use client'

import { useState } from 'react'

export default function APITest() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState('')

  const testConnection = async () => {
    setLoading(true)
    setMessage('Probando…')
    try {
      const response = await fetch('/api/health')
      if (!response.ok) throw new Error('Backend no disponible')

      setStatus('success')
      setMessage('✓ Conectado')
    } catch (error) {
      setStatus('error')
      setMessage('✗ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="karea">
      <button
        className="ktest"
        onClick={testConnection}
        disabled={loading}
      >
        {loading ? '⟳ Probando' : 'Probar'}
      </button>
      <span
        className="ktres"
        style={{
          color: status === 'success' ? '#4ADE80' : status === 'error' ? '#FF6B6B' : 'inherit'
        }}
      >
        {message}
      </span>
    </div>
  )
}
