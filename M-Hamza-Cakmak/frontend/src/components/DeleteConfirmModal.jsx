import { useState } from 'react'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, sellerName }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="glass-modal rounded-3xl w-full max-w-sm relative overflow-hidden animate-scale-in shadow-2xl shadow-rose-900/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
        
        <div className="p-8 relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-white">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-rose-100">
               <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-rose-900 tracking-tight mb-2">
            Takibi Sonlandır
          </h3>
          
          <p className="text-sm font-medium text-slate-500 mb-8 px-2">
            <span className="font-bold text-rose-600">{sellerName}</span> isimli satıcının izlenmesini durdurmak ve verilerini kalıcı olarak silmek istiyor musunuz?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Vazgeç
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Siliniyor
                </>
              ) : 'Evet, Kalıcı Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
