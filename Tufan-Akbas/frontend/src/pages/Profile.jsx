import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, LogOut, Settings, CreditCard, AlertTriangle, Shield, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('flend_token')
      if (!token) return navigate('/login')
      
      const { data } = await axios.get('https://flend-inky.vercel.app/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(data)
      setCompanyName(data.companyName)
    } catch (err) {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('flend_token')
      await axios.put('https://flend-inky.vercel.app/v1/users/profile', 
        { companyName, password },
        { headers: { Authorization: `Bearer ${token}` }}
      )
      showToast('Profil başarıyla güncellendi!', 'success')
      setPassword('')
    } catch (err) {
      showToast('Güncelleme başarısız oldu.', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('flend_token')
      await axios.delete('https://flend-inky.vercel.app/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.removeItem('flend_token')
      navigate('/login')
    } catch (err) {
      showToast('Hesap silinirken hata oluştu.', 'error')
      setShowDeleteModal(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('flend_token')
    navigate('/login')
  }

  if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg border z-50 transition-all transform ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'} flex items-center space-x-2`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/5 border-b border-white/10 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xl tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Flend</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Paketler</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white">Hesabım</h1>
          <p className="text-gray-400 mt-1">Profil bilgilerinizi ve aboneliğinizi yönetin.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <User className="h-10 w-10 text-indigo-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-1">{profile?.companyName || 'Şirket Adı Yok'}</h2>
            <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
          </div>

          {/* Subscription Card */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Mevcut Plan</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{profile?.subscription?.plan}</p>
                <p className="text-sm text-gray-400">Yenilenme tarihi: {new Date(profile?.subscription?.endsAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <Link to="/pricing" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
                Planı Yükselt
              </Link>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Profil Ayarları</h2>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Şirket Adı</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] transition-all"
            >
              Değişiklikleri Kaydet
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/30 bg-red-950/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield size={120} />
          </div>
          <h2 className="text-xl font-semibold text-red-500 mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" /> Tehlikeli Alan
          </h2>
          <p className="text-gray-400 mb-6 text-sm max-w-2xl">
            Hesabınızı sildiğinizde, tüm abonelik verileriniz, eşleştirdiğiniz rakipleriniz ve tanımladığınız fiyat kuralları kalıcı olarak kaybolur. Bu işlem geri alınamaz.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="py-2.5 px-6 rounded-xl text-red-50 font-semibold bg-red-600/90 hover:bg-red-500 transition-colors border border-red-500 shadow-lg shadow-red-500/20"
          >
            Hesabımı Sil / Dondur
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Emin misiniz?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Hesabınızı silmek üzeresiniz. İşlemi onaylarsanız tüm verileriniz kalıcı olarak silinecektir. Devam etmek istiyor musunuz?
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl text-white font-medium bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
              >
                Evet, Hesabımı Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
