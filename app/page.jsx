'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import BrandBrainPane from '@/components/panes/BrandBrainPane'
import GeneratorPane from '@/components/panes/GeneratorPane'
import ValidatorPane from '@/components/panes/ValidatorPane'
import CopyPane from '@/components/panes/CopyPane'
import CompetitionPane from '@/components/panes/CompetitionPane'
import ReportsPane from '@/components/panes/ReportsPane'

export default function Home() {
  const [activeTab, setActiveTab] = useState('brain')
  const [brain, setBrain] = useState({})
  const [car, setCar] = useState(null)
  const [si, setSi] = useState(0)

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
    }
  }, [])

  const panes = {
    brain: <BrandBrainPane brain={brain} setBrain={setBrain} />,
    gen: <GeneratorPane brain={brain} car={car} setCar={setCar} si={si} setSi={setSi} />,
    val: <ValidatorPane brain={brain} />,
    copy: <CopyPane brain={brain} />,
    comp: <CompetitionPane brain={brain} />,
    rep: <ReportsPane brain={brain} car={car} />
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
      <Header />
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
