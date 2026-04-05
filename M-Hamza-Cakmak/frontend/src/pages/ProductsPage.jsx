import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../lib/api'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch {
      toast.error('Ürünler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Ürünler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Ürünlerim</h1>
        <p className="text-sm font-medium text-slate-500 mt-2">Rakip fiyat stratejisini yönetmek istediğiniz ürünü seçin.</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-5 shadow-inner border border-white">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-lg">Henüz takip edilen ürün bulamadık.</p>
            <p className="text-slate-400 text-sm mt-1">Lütfen veritabanından ürün tanımı yapın.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/products/${product.id}/competitors`}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mevcut Fiyat</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 tracking-tight">
                        {Number(product.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-bold text-slate-500">₺</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] group-hover:bg-indigo-600 group-hover:shadow-indigo-500/30 transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-5 h-5 text-indigo-500 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/50 relative z-10 group-hover:bg-white/40 transition-colors">
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                  Rakipleri İncele
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
