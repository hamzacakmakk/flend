import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await axios.post('http://localhost:3001/v1/auth/login', { email, password })
      localStorage.setItem('flend_token', data.token)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Flend'e Hoş Geldiniz</h1>
          <p className="text-gray-400">Pazaryeri yönetiminde kontrol sizde.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">E-posta Adresi</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="satici@sirketiniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 bg-black/20 border-white/10 rounded focus:ring-indigo-500" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Beni Hatırla</label>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Şifremi Unuttum</a>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/25"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Henüz hesabınız yok mu?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Kayıt Olun
          </Link>
        </p>
      </div>
    </div>
  )
}
