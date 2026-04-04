import { useState, useEffect, useCallback } from 'react';
import { integrationAPI } from '../services/api';
import IntegrationForm from '../components/integrationForm';
import toast from 'react-hot-toast';
import {
  Plus,
  Link2,
  RefreshCw,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  DownloadCloud
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal (Form) Görünürlük Stateleri
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await integrationAPI.getAll();
      setIntegrations(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Entegrasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleCreate = async (data) => {
    try {
      const res = await integrationAPI.create(data);
      toast.success('Entegrasyon başarıyla eklendi');
      setShowForm(false);
      
      // İlk oluşturmada ürünleri de çek
      if (res.data && res.data.data && res.data.data.id) {
        toast.loading('Ürün detayları çekiliyor...', { id: 'sync-new' });
        await integrationAPI.syncProducts(res.data.data.id);
        toast.success('Ürünler sisteme başarıyla aktarıldı!', { id: 'sync-new' });
      }

      fetchIntegrations();
    } catch (err) {
      toast.dismiss('sync-new');
      toast.error(err.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleSync = async (id) => {
    try {
      toast.loading('Ürünler çekiliyor...', { id: `sync-${id}` });
      await integrationAPI.syncProducts(id);
      toast.success('Ürünler güncellendi!', { id: `sync-${id}` });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Senkronizasyon hatası', { id: `sync-${id}` });
    }
  };

  const handleUpdate = async (data) => {
    try {
      await integrationAPI.update(editingIntegration.id, data);
      toast.success('Entegrasyon güncellendi');
      setEditingIntegration(null);
      fetchIntegrations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu entegrasyonu silmek istediğinizden emin misiniz?')) return;
    try {
      await integrationAPI.delete(id);
      toast.success('Entegrasyon silindi');
      fetchIntegrations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'expired': return <XCircle size={14} className="text-red-400" />;
      default: return <Clock size={14} className="text-surface-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'expired': return 'badge-expired';
      default: return 'badge-inactive';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'expired': return 'Süresi Dolmuş';
      default: return 'Pasif';
    }
  };

  const marketplaceColors = {
    Trendyol: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400' },
    Hepsiburada: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    'Amazon TR': { bg: 'from-sky-500/20 to-sky-600/10', border: 'border-sky-500/20', text: 'text-sky-400' },
    default: { bg: 'from-primary-500/20 to-primary-600/10', border: 'border-primary-500/20', text: 'text-primary-400' },
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              <Link2 size={20} className="text-white" />
            </div>
            Pazaryeri Entegrasyonları
          </h1>
          <p className="text-surface-400 text-sm mt-1 ml-[52px]">
            API bağlantılarınızı ve veri aktarımlarını yönetin
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchIntegrations}
            className="p-2.5 rounded-xl text-surface-400 hover:text-surface-200 bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/30 transition-all cursor-pointer"
            title="Yenile"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>



          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus size={16} />
            API Ekle
          </button>
        </div>
      </div>

      {/* Integration Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-3/4 mb-4" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
      ) : integrations.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Shield size={48} className="mx-auto text-surface-600 mb-4" />
          <h3 className="text-lg font-semibold text-surface-300 mb-2">Henüz entegrasyon yok</h3>
          <p className="text-sm text-surface-500 mb-6">
            Pazaryeri API bilgilerinizi ekleyerek başlayın
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <Plus size={16} />
            İlk Entegrasyonunuzu Ekleyin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((intg, i) => {
            const colors = marketplaceColors[intg.marketplace_name] || marketplaceColors.default;
            return (
              <div
                key={intg.id}
                className={`glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg animate-fade-in group`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
                      <Link2 size={20} className={colors.text} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-200">{intg.marketplace_name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${getStatusBadge(intg.status)}`}>
                        {getStatusIcon(intg.status)}
                        {statusLabel(intg.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500">API Key / Müşteri ID</span>
                    <span className="text-surface-400 font-mono text-xs">
                      {intg.api_key ? `${intg.api_key.slice(0, 12)}...` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-surface-700/30">
                  <button
                    onClick={() => handleSync(intg.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                    title="Ürünleri API'den Çek"
                  >
                    <DownloadCloud size={13} />
                    Çek
                  </button>
                  <button
                    onClick={() => setEditingIntegration(intg)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary-400 hover:bg-primary-500/10 transition-all cursor-pointer"
                  >
                    <Pencil size={13} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(intg.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals (Açılır Pencereler) */}
      {showForm && (
        <IntegrationForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingIntegration && (
        <IntegrationForm
          integration={editingIntegration}
          onSubmit={handleUpdate}
          onCancel={() => setEditingIntegration(null)}
        />
      )}


    </div>
  );
}