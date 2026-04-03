import { useState, useEffect } from 'react';
import { X, Save, Key, Globe, User, Shield, Link2 } from 'lucide-react';

export default function IntegrationForm({ integration, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    marketplace_name: '',
    api_key: '',
    api_secret: '',
  });
  const [loading, setLoading] = useState(false);

  const isEdit = !!integration;

  useEffect(() => {
    if (integration) {
      setForm({
        marketplace_name: integration.marketplace_name || '',
        api_key: integration.api_key || '',
        api_secret: integration.api_secret || '',
      });
    }
  }, [integration]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  const marketplaces = [
    'Trendyol',
    'Hepsiburada',
    'Amazon TR',
    'N11',
    'GittiGidiyor',
    'Çiçeksepeti',
    'Diğer',
  ];

  const inputClass =
    'w-full bg-surface-800/60 border border-surface-700/50 rounded-xl px-4 py-3 text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all duration-200 text-sm';
  const labelClass = 'block text-sm font-medium text-surface-300 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-animate">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 glass rounded-2xl shadow-2xl shadow-black/30 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/30">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              <Link2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-100">
                {isEdit ? 'Entegrasyonu Güncelle' : 'Yeni Entegrasyon'}
              </h2>
              <p className="text-xs text-surface-400">
                Pazaryeri API bilgilerinizi girin
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Marketplace Select */}
          <div>
            <label className={labelClass}>
              <Globe size={14} className="inline mr-1.5 -mt-0.5" />
              Pazaryeri
            </label>
            <select
              name="marketplace_name"
              value={form.marketplace_name}
              onChange={handleChange}
              required
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">Pazaryeri seçin...</option>
              {marketplaces.map((mp) => (
                <option key={mp} value={mp}>
                  {mp}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className={labelClass}>
              <Key size={14} className="inline mr-1.5 -mt-0.5" />
              API Key / Müşteri ID
            </label>
            <input
              type="text"
              name="api_key"
              value={form.api_key}
              onChange={handleChange}
              required
              placeholder="API Anahtarı veya Müşteri Numaranız"
              className={inputClass}
            />
          </div>

          {/* API Secret */}
          <div>
            <label className={labelClass}>
              <Shield size={14} className="inline mr-1.5 -mt-0.5" />
              API Secret / Gizli Anahtar
            </label>
            <input
              type="password"
              name="api_secret"
              value={form.api_secret}
              onChange={handleChange}
              placeholder="API Gizli Anahtarınız (Opsiyonel)"
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Save size={16} />
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-200 bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/30 transition-all duration-200 cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
