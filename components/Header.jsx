'use client'

import APITest from './APITest'

export default function Header() {
  return (
    <div className="hdr">
      <div className="logo">
        <span className="lc">c</span>
        <span className="lr">uster</span>
        <span className="lbadge">IA Studio 2025</span>
      </div>
      <div className="karea">
        <APITest />
      </div>
    </div>
  )
}
