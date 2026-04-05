import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCompetitorHistory } from '../lib/api'
import { supabase } from '../lib/supabase'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Grafikler çiziliyor...</p>
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
  // Let's ensure chronological for graph and calculation:
  const isDescending = history.length >= 2 && new Date(history[0].recorded_at) > new Date(history[history.length - 1].recorded_at);
  const actualOldest = isDescending ? prices[prices.length - 1] : prices[0];
  const actualLatest = isDescending ? prices[0] : prices[prices.length - 1];
  const actualPriceChange = actualLatest - actualOldest;
  
  // Need to reverse data for chart if it's descending
  const finalChartData = isDescending ? [...chartData].reverse() : chartData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-modal p-4 rounded-xl border border-white/40 shadow-xl">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{label}</p>
          <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {Number(payload[0].value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in relative z-10">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8 z-10 relative">
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Ürünler</Link>
        <span className="text-slate-300">/</span>
        {competitor?.products && (
          <>
            <Link
              to={`/products/${competitor.product_id}/competitors`}
              className="hover:text-indigo-600 transition-colors"
            >
              {competitor.products.name}
            </Link>
            <span className="text-slate-300">/</span>
          </>
        )}
        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{competitor?.seller_name} İzleme</span>
      </div>

      {/* Header */}
      <div className="mb-8 z-10 relative">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight">Fiyat Geçmişi Analizi</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">
          <strong className="text-slate-800">{competitor?.seller_name}</strong> isimli satıcının zaman içindeki strateji değişiklikleri
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Güncel Fiyat</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {competitor?.last_price ? `${Number(competitor.last_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '—'}
          </p>
        </div>
        
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Düşük</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            {minPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
        
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Yüksek</p>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {maxPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
        
        <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full mix-blend-multiply opacity-20 ${actualPriceChange < 0 ? 'bg-emerald-400' : actualPriceChange > 0 ? 'bg-rose-400' : 'bg-slate-300'}`}></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Değişim</p>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actualPriceChange < 0 ? 'bg-emerald-50 text-emerald-500' : actualPriceChange > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {actualPriceChange > 0 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> : actualPriceChange < 0 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />}
              </svg>
            </div>
          </div>
          <p className={`text-2xl font-extrabold tracking-tight relative z-10 ${actualPriceChange < 0 ? 'text-emerald-600' : actualPriceChange > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {actualPriceChange > 0 ? '+' : ''}{actualPriceChange.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
        </div>
      </div>

      {/* Chart */}
      {history.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/60 shadow-sm relative overflow-hidden mb-8">
           <svg className="w-12 h-12 text-indigo-300 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-slate-500 font-medium">Bu rakip için henüz geçmiş veri birikmemiş.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-white/60 shadow-sm p-4 sm:p-8 mb-8 relative group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100">Fiyat Dağılımı (Trend)</h2>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  domain={[minPrice * 0.95, maxPrice * 1.05]}
                  tickFormatter={(v) => v.toLocaleString('tr-TR')}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5', style: { filter: 'drop-shadow(0px 0px 4px rgba(79, 70, 229, 0.5))' } }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Price Log Table */}
      {history.length > 0 && (
        <div className="glass rounded-3xl border border-white/60 shadow-sm overflow-hidden z-10 relative">
          <div className="px-6 py-5 border-b border-white">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Tarihsel Log Kayıtları</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Tarih / Saat</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Tespit Edilen Fiyat</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-4">Fark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {history.map((h, i, arr) => {
                  const prev = arr[i + 1]
                  const diff = prev ? Number(h.price) - Number(prev.price) : 0
                  return (
                    <tr key={h.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-500">
                        {new Date(h.recorded_at).toLocaleString('tr-TR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-slate-800">
                          {Number(h.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {diff !== 0 ? (
                          <span className={`inline-flex items-center gap-1 font-bold text-xs ${diff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diff > 0 ? (
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            ) : (
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                            )}
                            {Math.abs(diff).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
