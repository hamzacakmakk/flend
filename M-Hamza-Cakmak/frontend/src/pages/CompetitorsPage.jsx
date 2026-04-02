import { useEffect, useState, useCallback } from 'react'
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

  const handleToggleStatus = async (competitor) => {
    try {
      await updateCompetitorStatus(competitor.id, !competitor.is_active)
      toast.success(competitor.is_active ? 'Takip durduruldu' : 'Takip başlatıldı')
      loadData()
    } catch {
      toast.error('Durum güncellenemedi')
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

  const getPriceBadge = (competitorPrice) => {
    if (!product) return null
    const myPrice = Number(product.current_price)
    const theirPrice = Number(competitorPrice)

    if (theirPrice < myPrice) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Bizden Ucuz</span>
    } else if (theirPrice > myPrice) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Bizden Pahalı</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Aynı Fiyat</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Ürünlerim</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product?.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rakip Analizi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fiyatım: <span className="font-semibold text-gray-900">{Number(product?.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            {' · '}{competitors.length} rakip takip ediliyor
          </p>
        </div>
        <div className="flex gap-3">
          <SyncButton onSyncComplete={loadData} />
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Rakip Ekle
          </button>
        </div>
      </div>

      {/* Competitors Table */}
      {competitors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 mb-4">Henüz rakip eklenmemiş.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            İlk rakibi ekle
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Satıcı</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Son Fiyat</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Durum</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Takip</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {competitors.map((comp) => (
                  <tr key={comp.id} className={`hover:bg-gray-50 transition-colors ${!comp.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{comp.seller_name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{comp.competitor_url}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {comp.last_price ? `${Number(comp.last_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '—'}
                        </span>
                        {comp.last_price && getPriceBadge(comp.last_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${comp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {comp.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(comp)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${comp.is_active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${comp.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/competitors/${comp.id}/history`}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        >
                          Fiyat Geçmişi
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(comp)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
