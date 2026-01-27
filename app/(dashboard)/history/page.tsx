'use client'

import Link from 'next/link'

export default function HistoryPage() {
  return (
    <div className="page-container-narrow">
      <Link href="/competitions" className="back-btn">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Competitions
      </Link>

      <div className="card p-12">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">
            Catch History
          </h3>
          <p className="empty-state-text">
            This feature is coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
