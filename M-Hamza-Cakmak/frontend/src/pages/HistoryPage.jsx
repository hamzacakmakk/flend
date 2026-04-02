import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCompetitorHistory } from '../lib/api'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { competitorId } = useParams()
  const [history, setHistory] = useState([])
  const [competitor, setCompetitor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [historyData, { data: comp }] = await Promise.all([
          getCompetitorHistory(competitorId),
          supabase.from('competitors').select('*, products(name, current_price)').eq('id', competitorId).single(),
        ])
        setHistory(historyData)
        setCompetitor(comp)
      } catch {
        toast.error('Fiyat geçmişi yüklenemedi')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [competitorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const chartData = history.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
    price: Number(h.price),
  }))

  const prices = history.map((h) => Number(h.price))
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const priceChange = prices.length >= 2 ? prices[prices.length - 1] - prices[0] : 0

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Ürünlerim</Link>
        <span>/</span>
        {competitor?.products && (
          <>
            <Link
              to={`/products/${competitor.product_id}/competitors`}
              className="hover:text-indigo-600 transition-colors"
            >
              {competitor.products.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{competitor?.seller_name}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fiyat Geçmişi</h1>
        <p className="text-sm text-gray-500 mt-1">
          {competitor?.seller_name} satıcısının tarihsel fiyat değişimleri
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Güncel Fiyat</p>
          <p className="text-lg font-bold text-gray-900">
            {competitor?.last_price ? `${Number(competitor.last_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">En Düşük</p>
          <p className="text-lg font-bold text-green-600">
            {minPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">En Yüksek</p>
          <p className="text-lg font-bold text-red-600">
            {maxPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Değişim</p>
          <p className={`text-lg font-bold ${priceChange < 0 ? 'text-green-600' : priceChange > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {priceChange > 0 ? '+' : ''}{priceChange.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
      </div>

      {/* Chart */}
      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Henüz fiyat kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Fiyat Değişim Grafiği (₺)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[minPrice * 0.98, maxPrice * 1.02]}
                tickFormatter={(v) => v.toLocaleString('tr-TR')}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`, 'Fiyat']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Price Log Table */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-700">Fiyat Logları</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Tarih</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Fiyat</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...history].reverse().map((h, i, arr) => {
                const prev = arr[i + 1]
                const diff = prev ? Number(h.price) - Number(prev.price) : 0
                return (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(h.recorded_at).toLocaleString('tr-TR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {Number(h.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {diff !== 0 ? (
                        <span className={diff < 0 ? 'text-green-600' : 'text-red-600'}>
                          {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
