import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import IntegrationsPage from './pages/IntegrationsPage'
import ProductsPage from './pages/ProductsPage'
import { Link2, Package } from 'lucide-react'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-900 flex flex-col text-surface-100 font-sans">
        <header className="bg-surface-800 border-b border-surface-700/50 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
                    Flend
                  </h1>
                  
                  <nav className="flex items-center gap-1">
                    <NavLink 
                      to="/integrations" 
                      className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-500/10 text-primary-400' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80'}`}
                    >
                      <Link2 size={16} />
                      Entegrasyonlar
                    </NavLink>
                    <NavLink 
                      to="/products" 
                      className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80'}`}
                    >
                      <Package size={16} />
                      Ürünler
                    </NavLink>
                  </nav>
                </div>
              </div>
            </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
                <Route path="/" element={<Navigate to="/integrations" replace />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/products" element={<ProductsPage />} />
            </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
