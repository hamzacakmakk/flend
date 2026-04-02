import { useState } from 'react'
import { syncCompetitorPrices } from '../lib/api'
import toast from 'react-hot-toast'

export default function SyncButton({ onSyncComplete }) {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await syncCompetitorPrices()
      toast.success(`${result.count} rakip fiyatı güncellendi`)
      onSyncComplete?.()
    } catch {
      toast.error('Senkronizasyon başarısız')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      <svg
        className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {syncing ? 'Güncelleniyor...' : 'Botu Çalıştır'}
    </button>
  )
}
