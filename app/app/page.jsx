'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import BrandBrainPane from '@/components/panes/BrandBrainPane'
import GeneratorPane from '@/components/panes/GeneratorPane'
import ValidatorPane from '@/components/panes/ValidatorPane'
import CopyPane from '@/components/panes/CopyPane'
import CompetitionPane from '@/components/panes/CompetitionPane'
import ReportsPane from '@/components/panes/ReportsPane'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('brain')
  const [brain, setBrain] = useState({})
  const [car, setCar] = useState(null)
  const [si, setSi] = useState(0)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Cargar Brain desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('custer_brain')
      if (stored) {
        try {
          setBrain(JSON.parse(stored))
        } catch (e) {
          console.error('Error loading brain:', e)
        }
      }

      // Obtener info del usuario (podría venir del servidor)
      // Por ahora lo obtenemos del cookie via una llamada
      fetchUser()
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (e) {
      console.error('Error fetching user:', e)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const panes = {
    brain: <BrandBrainPane brain={brain} setBrain={setBrain} user={user} />,
    gen: <GeneratorPane brain={brain} car={car} setCar={setCar} si={si} setSi={setSi} user={user} />,
    val: <ValidatorPane brain={brain} user={user} />,
    copy: <CopyPane brain={brain} user={user} />,
    comp: <CompetitionPane brain={brain} user={user} />,
    rep: <ReportsPane brain={brain} car={car} user={user} />
  }

  const tabsConfig = [
    { id: 'brain', label: '🧠 Brand Brain' },
    { id: 'gen', label: '✦ Generador' },
    { id: 'val', label: '🎯 Validador' },
    { id: 'copy', label: '✍️ Copy' },
    { id: 'comp', label: '🔍 Competencia' },
    { id: 'rep', label: '📊 Reportes' }
  ]

  return (
    <div className="app">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)' }}>
              👤 {user.username}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,107,107,.1)',
              border: '1px solid rgba(255,107,107,.3)',
              color: '#FF6B6B',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,107,107,.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,107,107,.1)'}
          >
            🚪 Salir
          </button>
        </div>
      </div>
      <Navigation
        tabs={tabsConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="panes-container">
        {Object.entries(panes).map(([tabId, pane]) => (
          <div
            key={tabId}
            className={`mpane ${activeTab === tabId ? 'on' : ''}`}
            id={`mpane-${tabId}`}
          >
            {pane}
          </div>
        ))}
      </div>
    </div>
  )
}
