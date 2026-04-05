import { useState } from 'react'

export default function AddCompetitorModal({ isOpen, onClose, onSubmit, productName }) {
  const [competitorUrl, setCompetitorUrl] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ competitorUrl, sellerName })
      setCompetitorUrl('')
      setSellerName('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="glass-modal rounded-3xl w-full max-w-md relative overflow-hidden animate-scale-in shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10"></div>
        
        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900">Rakip Araştırması Ekle</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-sm font-medium text-slate-500 mb-6 bg-white/50 p-3 rounded-xl border border-white">
            <span className="font-bold text-indigo-600">{productName}</span> ürününün yeni bir satıcısını sisteme tanımlayın.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Rakip İlan Linki <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://www.ornek.com/urun-linki"
                className="w-full px-4 py-3 bg-white/70 border border-white focus:border-indigo-300 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Satıcı / Mağaza Adı
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Ör: TeknoFırsat, Global Mağaza"
                className="w-full px-4 py-3 bg-white/70 border border-white focus:border-indigo-300 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-[0.4] px-4 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     İşleniyor...
                   </>
                ) : 'Rakip Takibine Başla'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
