import { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../api/api';

const demoNotifications = [
  {
    id: '1',
    title: 'Rakip Stok Bitirdi',
    message: 'USB-C Hub Adaptör ürününde rakibiniz stok bitirdi. BuyBox şansınız arttı!',
    type: 'success',
    is_read: false,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Fiyat Düşüşü Algılandı',
    message: 'Kablosuz Bluetooth Kulaklık ürününde rakip fiyatı %12 düşürdü.',
    type: 'warning',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'BuyBox Kazanıldı',
    message: '27" Gaming Monitör ürününde BuyBox pozisyonunu kazandınız!',
    type: 'success',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Stok Uyarısı',
    message: 'USB-C Hub Adaptör ürününde stok 7 günlük seviyeye düştü.',
    type: 'error',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Kampanya Başarılı',
    message: 'Mekanik Klavye indirim kampanyası satışları %35 artırdı.',
    type: 'info',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const typeConfig = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const result = await getNotifications();
        setNotifications(result.data);
      } catch (err) {
        console.warn('API bağlantısı yok, demo veriler kullanılıyor:', err.message);
        setNotifications(demoNotifications);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
    } catch {
      // demo mode
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotification(id);
    } catch {
      // demo mode
    }
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDeletingId(null);
    }, 300);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="skeleton h-6 w-48 mb-6" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-20 w-full mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white bounce-subtle"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #ef4444)' }}
            >
              {unreadCount}
            </span>
          )}
          <div>
            <h3 className="text-lg font-bold text-white">Bildirimler</h3>
            <p className="text-sm text-gray-500">{unreadCount} okunmamış bildirim</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              style={
                filter === f
                  ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)' }
                  : { border: '1px solid transparent' }
              }
            >
              {f === 'all' ? 'Tümü' : f === 'unread' ? 'Okunmamış' : 'Okunmuş'}
            </button>
          ))}

          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-ghost text-xs ml-2">
              Tümünü Okundu Yap
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500">Bildirim bulunamadı</p>
          </div>
        ) : (
          filtered.map((n) => {
            const config = typeConfig[n.type] || typeConfig.info;
            return (
              <div
                key={n.id}
                className={`glass-card p-5 flex items-start gap-4 transition-all duration-300 ${
                  !n.is_read ? 'unread-row' : ''
                } ${deletingId === n.id ? 'opacity-0 translate-x-4' : ''}`}
                style={{ borderRadius: '12px' }}
              >
                {/* Type icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>
                        {n.title}
                        {!n.is_read && (
                          <span className="inline-block w-2 h-2 rounded-full ml-2" style={{ background: config.color }} />
                        )}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-xs text-gray-600 mt-2 block">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-indigo-400 transition-all"
                      title="Okundu işaretle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                    title="Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
