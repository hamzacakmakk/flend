import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCompetitorsByProduct,
  addCompetitor,
  updateCompetitorStatus,
  deleteCompetitor,
  getProducts,
} from '../lib/api'
import AddCompetitorModal from '../components/AddCompetitorModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import SyncButton from '../components/SyncButton'
import toast from 'react-hot-toast'

// ─── Swipeable Rakip Kartı ───────────────────────────────────────────────────
function SwipeableCompetitorCard({ comp, product, onToggle, onDeleteRequest, onHistoryClick }) {
  const startX = useRef(null)
  const currentX = useRef(0)
  const cardRef = useRef(null)
  const [offset, setOffset] = useState(0)
  const [swiped, setSwiped] = useState(false)

  const SWIPE_THRESHOLD = 80

  const handleStart = (clientX) => {
    startX.current = clientX
  }

  const handleMove = (clientX) => {
    if (startX.current === null) return
    const delta = clientX - startX.current
    if (delta < 0) {
      currentX.current = Math.max(delta, -SWIPE_THRESHOLD - 20)
      setOffset(currentX.current)
    } else if (swiped && delta > 0) {
      // Geri kaydırma
      const newOffset = -SWIPE_THRESHOLD + delta
      currentX.current = Math.min(newOffset, 0)
      setOffset(currentX.current)
    }
  }

  const handleEnd = () => {
    if (startX.current === null) return
    startX.current = null
    if (currentX.current < -SWIPE_THRESHOLD) {
      setOffset(-SWIPE_THRESHOLD)
      setSwiped(true)
    } else {
      setOffset(0)
      setSwiped(false)
    }
    currentX.current = 0
  }

  // Touch events
  const onTouchStart = (e) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  // Mouse events (masaüstü test için)
  const onMouseDown = (e) => handleStart(e.clientX)
  const onMouseMove = (e) => { if (startX.current !== null) handleMove(e.clientX) }
  const onMouseUp = () => handleEnd()
  const onMouseLeave = () => { if (startX.current !== null) handleEnd() }

  const getPriceBadge = (competitorPrice) => {
    if (!product) return null
    const myPrice = Number(product.current_price)
    const theirPrice = Number(competitorPrice)
    if (theirPrice < myPrice)
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-600/20 shadow-sm animate-scale-in">Avantajlıyız</span>
    if (theirPrice > myPrice)
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100/80 text-rose-700 ring-1 ring-rose-600/20 shadow-sm animate-scale-in">Riskli (Biz Pahalıyız)</span>
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 ring-1 ring-slate-500/20 shadow-sm animate-scale-in">Aynı Fiyat</span>
  }

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 select-none">
      {/* Swipe ile açılan kırmızı arka plan aksiyonu */}
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-gradient-to-l from-rose-500 to-rose-600 rounded-2xl">
        <div className="flex flex-col items-center gap-1 text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Takibi Bırak</span>
        </div>
      </div>

      {/* Kart gövdesi */}
      <div
        ref={cardRef}
        className={`glass border border-white/60 rounded-2xl px-4 py-4 relative z-10 transition-shadow duration-200 ${!comp.is_active ? 'opacity-60 saturate-50' : ''}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: startX.current !== null ? 'none' : 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
          cursor: 'grab',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClick={() => {
          // Swipe açıksa tıklama silmeyi tetiklesin
          if (swiped) {
            onDeleteRequest(comp)
            setOffset(0)
            setSwiped(false)
          }
        }}
      >
        {/* Üst satır: Avatar + İsim + Toggle */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center font-bold text-slate-500 text-sm">
              {comp.seller_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{comp.seller_name}</p>
              <a
                href={comp.competitor_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-indigo-500 flex items-center gap-1 mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                İlana Git
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Optimistic Toggle Switch */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(comp) }}
            className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center justify-center rounded-full transition-colors duration-300 shadow-inner ${comp.is_active ? 'bg-emerald-500 shadow-emerald-600/30' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${comp.is_active ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
          </button>
        </div>

        {/* Alt satır: Fiyat + Badge + Aksiyonlar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
              {comp.last_price
                ? `${Number(comp.last_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                : <span className="text-slate-400 text-sm font-medium">Bekleniyor</span>}
            </span>
            {comp.last_price ? getPriceBadge(comp.last_price) : <span className="text-xs text-slate-300 italic">Veri Yok</span>}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Link
              to={`/competitors/${comp.id}/history`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors duration-200 shadow-sm"
            >
              Geçmiş
            </Link>
            <button
              onClick={() => onDeleteRequest(comp)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Swipe ipucu göstergesi */}
        {!swiped && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-20 pointer-events-none">
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Ana Sayfa ───────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
  const { productId } = useParams()
  const [competitors, setCompetitors] = useState([])
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [comps, products] = await Promise.all([
        getCompetitorsByProduct(productId),
        getProducts(),
      ])
      setCompetitors(comps)
      setProduct(products.find((p) => p.id === productId))
    } catch {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddCompetitor = async ({ competitorUrl, sellerName }) => {
    try {
      await addCompetitor({ productId, competitorUrl, sellerName })
      toast.success('Rakip başarıyla eklendi')
      loadData()
    } catch {
      toast.error('Rakip eklenemedi')
    }
  }

  // ── Optimistic UI Toggle + Rollback ──────────────────────────────────────
  const handleToggleStatus = async (competitor) => {
    const newStatus = !competitor.is_active

    // 1. Optimistic: State'i anında güncelle (API bekleme)
    setCompetitors((prev) =>
      prev.map((c) => c.id === competitor.id ? { ...c, is_active: newStatus } : c)
    )

    try {
      await updateCompetitorStatus(competitor.id, newStatus)
      toast.success(newStatus ? 'Takip başlatıldı' : 'Takip durduruldu')
    } catch {
      // 2. Rollback: API hata verirse eski değere geri dön
      setCompetitors((prev) =>
        prev.map((c) => c.id === competitor.id ? { ...c, is_active: competitor.is_active } : c)
      )
      toast.error('Bağlantı hatası — durum geri alındı')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCompetitor(deleteTarget.id)
      toast.success('Rakip silindi')
      loadData()
    } catch {
      toast.error('Silme başarısız')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Veriler hazırlanıyor...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8">
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Ürünler</Link>
        <span className="text-slate-300">/</span>
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{product?.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight">Rakip Analizi</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Satış Fiyatımız:</span>
              <span className="text-sm font-bold text-slate-900">{Number(product?.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="text-sm font-medium text-slate-500">{competitors.length} Rakip</span>
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <SyncButton onSyncComplete={loadData} />
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
            <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Yeni Rakip</span>
          </button>
        </div>
      </div>

      {/* Swipe ipucu */}
      {competitors.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4 px-1">
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span>Kartı sola kaydırarak takibi sonlandırabilirsiniz</span>
        </div>
      )}

      {/* Rakip Listesi — Swipeable Kartlar */}
      {competitors.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-5 shadow-inner border border-white">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-lg">Bu ürün için henüz rakip tanımı yok.</p>
            <p className="text-slate-400 text-sm mt-1 mb-4">Piyasadaki fiyatları takip etmek için rakipleri ekleyin.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-bold px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              İlk Rakibi Ekle
            </button>
          </div>
        </div>
      ) : (
        <div>
          {competitors.map((comp) => (
            <SwipeableCompetitorCard
              key={comp.id}
              comp={comp}
              product={product}
              onToggle={handleToggleStatus}
              onDeleteRequest={setDeleteTarget}
              onHistoryClick={() => {}}
            />
          ))}
        </div>
      )}

      <AddCompetitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompetitor}
        productName={product?.name}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        sellerName={deleteTarget?.seller_name}
      />
    </div>
  )
}
