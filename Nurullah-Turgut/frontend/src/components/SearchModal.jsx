import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const allItems = [
  // Sayfalar
  { id: 'page-dashboard', type: 'page', label: 'Dashboard', description: 'Ana panel ve istatistikler', path: '/', icon: '🏠', keywords: 'ana panel dashboard' },
  { id: 'page-notifications', type: 'page', label: 'Bildirimler', description: 'Tüm bildirimleriniz', path: '/notifications', icon: '🔔', keywords: 'bildirim notification' },
  { id: 'page-alerts', type: 'page', label: 'Alarm Kuralları', description: 'Fiyat ve stok alarm kuralları', path: '/alerts', icon: '⚡', keywords: 'alarm kural uyarı' },

  // Ürünler
  { id: 'prod-1', type: 'product', label: 'Kablosuz Bluetooth Kulaklık', description: 'BT-KLK-001 · Stok: 320 adet', path: '/', icon: '🎧', keywords: 'kulaklık bluetooth kablosuz' },
  { id: 'prod-2', type: 'product', label: 'USB-C Hub Adaptör', description: 'USB-HUB-042 · Stok: 85 adet', path: '/', icon: '🔌', keywords: 'usb hub adaptör' },
  { id: 'prod-3', type: 'product', label: 'Mekanik Klavye RGB', description: 'MK-RGB-108 · Stok: 200 adet', path: '/', icon: '⌨️', keywords: 'klavye mekanik rgb' },
  { id: 'prod-4', type: 'product', label: 'Ergonomik Mouse Pad', description: 'EMP-XL-005 · Stok: 500 adet', path: '/', icon: '🖱️', keywords: 'mouse pad ergonomik' },
  { id: 'prod-5', type: 'product', label: '27" Gaming Monitör', description: 'MON-27G-144 · Stok: 15 adet', path: '/', icon: '🖥️', keywords: 'monitör gaming ekran' },

  // Bildirimler
  { id: 'notif-1', type: 'notification', label: 'Rakip Stok Bitirdi', description: 'USB-C Hub Adaptör — BuyBox şansınız arttı!', path: '/notifications', icon: '✅', keywords: 'stok rakip buybox' },
  { id: 'notif-2', type: 'notification', label: 'Fiyat Düşüşü Algılandı', description: 'Bluetooth Kulaklık — rakip %12 düşürdü', path: '/notifications', icon: '⚠️', keywords: 'fiyat düşüş kampanya' },
  { id: 'notif-3', type: 'notification', label: 'Stok Uyarısı', description: 'USB-C Hub Adaptör — 7 günlük stok kaldı', path: '/notifications', icon: '📦', keywords: 'stok uyarı düşük' },
];

const typeLabels = { page: 'Sayfa', product: 'Ürün', notification: 'Bildirim' };
const typeColors = {
  page: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  product: { bg: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
  notification: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? allItems.filter((item) =>
        `${item.label} ${item.description} ${item.keywords}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : allItems.filter((i) => i.type === 'page'); // boşken sadece sayfaları göster

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, results.length - 1));
      if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0));
      if (e.key === 'Enter' && results[selected]) {
        navigate(results[selected].path);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, selected, navigate, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 9998,
          animation: 'fadeInBackdrop 0.15s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '580px',
          zIndex: 9999,
          animation: 'slideDownModal 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(18,18,26,0.98), rgba(26,26,46,0.98))',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '20px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <svg width="20" height="20" fill="none" stroke="rgba(99,102,241,0.8)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ürün, sayfa veya bildirim ara..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', color: '#888', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' }}
              >
                Temizle
              </button>
            )}
            <kbd style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p style={{ fontSize: '14px' }}>"{query}" için sonuç bulunamadı</p>
              </div>
            ) : (
              results.map((item, idx) => {
                const tc = typeColors[item.type];
                const isActive = idx === selected;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelected(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px',
                    }}
                  >
                    {/* Icon */}
                    <div style={{ fontSize: '20px', width: '38px', height: '38px', borderRadius: '10px', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${tc.border}` }}>
                      {item.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: isActive ? '#fff' : '#ddd', marginBottom: '2px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </div>
                    </div>

                    {/* Type badge */}
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, flexShrink: 0 }}>
                      {typeLabels[item.type]}
                    </span>

                    {/* Arrow */}
                    {isActive && (
                      <svg width="16" height="16" fill="none" stroke="#6366f1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[
              { keys: ['↑', '↓'], label: 'Gezin' },
              { keys: ['↵'], label: 'Seç' },
              { keys: ['ESC'], label: 'Kapat' },
            ].map((hint) => (
              <div key={hint.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {hint.keys.map((k) => (
                  <kbd key={k} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '2px 6px', fontSize: '11px', color: '#777', fontFamily: 'monospace' }}>{k}</kbd>
                ))}
                <span style={{ fontSize: '11px', color: '#555' }}>{hint.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBackdrop { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideDownModal { from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.97) } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) } }
      `}</style>
    </>
  );
}
