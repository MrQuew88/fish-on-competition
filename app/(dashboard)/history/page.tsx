'use client'

import Link from 'next/link'

export default function HistoryPage() {
  return (
    <div className="page-container">
      <Link href="/competitions" className="back-link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mes competitions
      </Link>

      <div className="card p-12">
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">
            Historique des captures
          </h3>
          <p className="empty-state-text">
            Cette page est en cours de developpement.
          </p>
        </div>
      </div>
    </div>
  )
}
