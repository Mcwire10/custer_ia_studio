'use client'

export default function Navigation({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="mnav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mtab ${activeTab === tab.id ? 'on' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
