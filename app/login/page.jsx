'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error en el login')
        return
      }

      // Login exitoso
      router.push('/app')
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <span className="lc">c</span>
            <span className="lr">uster</span>
          </div>
          <div className="login-badge">IA Studio 2025</div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ej: demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña (4 dígitos)</label>
            <input
              id="password"
              type="password"
              placeholder="1234"
              value={password}
              onChange={(e) => {
                // Solo permitir 4 dígitos
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                setPassword(val)
              }}
              disabled={loading}
              maxLength="4"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !username || password.length !== 4}
          >
            {loading ? '⟳ Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-info">
            <div className="demo-title">📌 Demo</div>
            <div className="demo-item">demo / 1234</div>
            <div className="demo-item">admin / 5678</div>
          </div>
        </div>
      </div>

      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  )
}
