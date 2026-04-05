import { useState } from 'react';
import { createAlertRule } from '../api/api';

const conditionTypes = [
  { value: 'rakip_fiyat_dususu', label: 'Rakip Fiyat Düşüşü', description: 'Rakibin fiyatı belirlenen oranda düştüğünde bildirim al', icon: '📉' },
  { value: 'stok_azalmasi', label: 'Stok Azalması', description: 'Stok belirlenen seviyenin altına düştüğünde bildirim al', icon: '📦' },
  { value: 'buybox_kaybi', label: 'BuyBox Kaybı', description: 'BuyBox pozisyonunu kaybettiğinde bildirim al', icon: '🏆' },
  { value: 'fiyat_degisimi', label: 'Fiyat Değişimi', description: 'Herhangi bir fiyat değişikliği olduğunda bildirim al', icon: '💰' },
];

const thresholdUnits = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '₺' },
  { value: 'count', label: 'Adet' },
];

const notifyOptions = [
  { value: 'in_app', label: 'Uygulama İçi', icon: '🔔' },
  { value: 'email', label: 'E-posta', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '📱' },
];

export default function AlertRuleForm() {
  const [form, setForm] = useState({
    rule_name: '',
    condition_type: '',
    threshold_value: '',
    threshold_unit: 'percent',
    notify_via: 'in_app',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!form.rule_name.trim()) {
      setError('Kural adı zorunludur.');
      return;
    }
    if (!form.condition_type) {
      setError('Koşul tipi seçilmelidir.');
      return;
    }
    if (!form.threshold_value || isNaN(form.threshold_value) || parseFloat(form.threshold_value) <= 0) {
      setError('Geçerli bir eşik değeri giriniz.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createAlertRule(form);
      setSuccess(true);
      setForm({
        rule_name: '',
        condition_type: '',
        threshold_value: '',
        threshold_unit: 'percent',
        notify_via: 'in_app',
      });
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.details ||
        err?.message ||
        'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.';
      console.error('Alarm kuralı oluşturma hatası:', err);
      setError(message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-2xl fade-in">
      {/* Success message */}
      {success && (
        <div
          className="flex items-center gap-3 p-4 mb-6 rounded-xl fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-300 font-medium">Alarm kuralı başarıyla oluşturuldu!</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 mb-6 rounded-xl fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-300 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-6 mb-5">
          <h3 className="text-base font-bold text-white mb-1">Kural Bilgileri</h3>
          <p className="text-sm text-gray-500 mb-5">Alarm kuralınıza bir ad verin</p>

          <label className="block text-sm text-gray-300 font-medium mb-2">Kural Adı</label>
          <input
            type="text"
            className="input-field"
            placeholder="Örn: Rakip fiyat düşüşü alarmı"
            value={form.rule_name}
            onChange={(e) => handleChange('rule_name', e.target.value)}
          />
        </div>

        <div className="glass-card p-6 mb-5">
          <h3 className="text-base font-bold text-white mb-1">Koşul Tipi</h3>
          <p className="text-sm text-gray-500 mb-5">Hangi durumda bildirim almak istiyorsunuz?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditionTypes.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() => handleChange('condition_type', ct.value)}
                className={`p-4 rounded-xl text-left transition-all duration-200 ${
                  form.condition_type === ct.value ? 'ring-2' : 'hover:bg-white/5'
                }`}
                style={{
                  background:
                    form.condition_type === ct.value
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))'
                      : 'rgba(26, 26, 46, 0.5)',
                  border: `1px solid ${
                    form.condition_type === ct.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'
                  }`,
                  ringColor: form.condition_type === ct.value ? '#6366f1' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ct.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${form.condition_type === ct.value ? 'text-white' : 'text-gray-300'}`}>
                      {ct.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 mb-5">
          <h3 className="text-base font-bold text-white mb-1">Eşik Değeri</h3>
          <p className="text-sm text-gray-500 mb-5">Hangi değeri aştığında bildirim gönderilsin?</p>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 font-medium mb-2">Değer</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="Örn: 10"
                value={form.threshold_value}
                onChange={(e) => handleChange('threshold_value', e.target.value)}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-300 font-medium mb-2">Birim</label>
              <select
                className="input-field"
                value={form.threshold_unit}
                onChange={(e) => handleChange('threshold_unit', e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {thresholdUnits.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-base font-bold text-white mb-1">Bildirim Kanalı</h3>
          <p className="text-sm text-gray-500 mb-5">Bildirimi nasıl almak istiyorsunuz?</p>

          <div className="flex gap-3 flex-wrap">
            {notifyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('notify_via', opt.value)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  form.notify_via === opt.value ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background:
                    form.notify_via === opt.value
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                      : 'rgba(26, 26, 46, 0.5)',
                  border: `1px solid ${
                    form.notify_via === opt.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'
                  }`,
                }}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Oluşturuluyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Alarm Kuralı Oluştur
            </>
          )}
        </button>
      </form>
    </div>
  );
}
