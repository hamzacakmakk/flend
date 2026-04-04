import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/api';

const statCards = [
  {
    key: 'buybox_win_rate',
    label: 'BuyBox Kazanma Oranı',
    suffix: '%',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
  {
    key: 'tracked_products_count',
    label: 'Takip Edilen Ürünler',
    suffix: '',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
  },
  {
    key: 'total_sales',
    label: 'Toplam Satışlar',
    suffix: '',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    key: 'active_campaigns',
    label: 'Aktif Kampanyalar',
    suffix: '',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
];

// Demo verileri (API bağlantısı yokken kullanılır)
const demoStats = {
  buybox_win_rate: 78.5,
  tracked_products_count: 145,
  total_sales: 1250,
  active_campaigns: 3,
  revenue: 89500,
};

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const startVal = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(startVal + (value - startVal) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();
        setStats(result.data);
      } catch (err) {
        console.warn('API bağlantısı yok, demo veriler kullanılıyor:', err.message);
        setStats(demoStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="skeleton h-4 w-24 mb-4" />
            <div className="skeleton h-8 w-20 mb-2" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {statCards.map((card, index) => (
        <div
          key={card.key}
          className={`glass-card gradient-border p-6 fade-in fade-in-delay-${index + 1}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">{card.label}</span>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ background: card.gradient, boxShadow: `0 4px 14px ${card.glowColor}` }}
            >
              {card.icon}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            <AnimatedNumber value={stats[card.key]} suffix={card.suffix} />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +12%
            </span>
            <span className="text-gray-500">geçen aya göre</span>
          </div>
        </div>
      ))}
    </div>
  );
}
