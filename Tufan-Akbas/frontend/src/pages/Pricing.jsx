import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowLeft } from 'lucide-react'
import axios from 'axios'

export default function Pricing() {
  const [packages, setPackages] = useState([])
  const [isYearly, setIsYearly] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get('https://flend-inky.vercel.app/v1/subscriptions/packages')
      setPackages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>

  return (
    <div className="min-h-screen bg-[#0d1117] py-20 px-4 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link to="/profile" className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Profilime Dön
        </Link>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">İşinizi Büyütmenin Tam Zamanı</h1>
          <p className="text-xl text-gray-400">Flend ile rekabette bir adım öne geçin. İhtiyacınıza en uygun planı seçin.</p>
          
          {/* Toggle Button */}
          <div className="mt-10 flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>Aylık</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative rounded-full w-16 h-8 bg-indigo-600/30 border border-indigo-500/50 p-1 flex items-center transition-colors focus:outline-none"
            >
              <div className={`bg-indigo-500 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isYearly ? 'translate-x-8' : ''}`}></div>
            </button>
            <span className={`text-sm ${isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
              Yıllık <span className="ml-1.5 inline-block py-1 px-2 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold ring-1 ring-inset ring-emerald-500/20">%20 İndirimli</span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, idx) => (
            <div 
              key={pkg.id} 
              className={`rounded-3xl p-8 border ${idx === 1 ? 'bg-gradient-to-b from-indigo-900/40 to-[#0d1117] border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105' : 'bg-white/5 border-white/10 hover:border-white/30'} flex flex-col transition-all duration-300`}
            >
              {idx === 1 && (
                <div className="mb-4">
                  <span className="bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">En Popüler</span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
              <div className="mt-4 mb-6 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">₺{isYearly ? (pkg.priceYearly / 12).toFixed(0) : pkg.priceMonthly}</span>
                <span className="ml-1 text-xl font-medium text-gray-400">/ay</span>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    <Check className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`mt-auto w-full py-4 px-6 rounded-xl font-semibold transition-all ${idx === 1 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-white/5'}`}
              >
                Planı Seç
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
