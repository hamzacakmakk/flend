import { useState, useEffect } from 'react';
import { getCampaignSuggestions } from '../api/api';

const demoCampaigns = [
  {
    id: '1',
    product_name: 'Kablosuz Bluetooth Kulaklık',
    product_sku: 'BT-KLK-001',
    current_stock: 320,
    sales_velocity: 4.5,
    days_of_stock: 71,
    suggested_discount: 15,
    suggestion_type: 'stok_eritme',
    priority: 'high',
  },
  {
    id: '2',
    product_name: 'USB-C Hub Adaptör',
    product_sku: 'USB-HUB-042',
    current_stock: 85,
    sales_velocity: 12.3,
    days_of_stock: 7,
    suggested_discount: 10,
    suggestion_type: 'kampanya',
    priority: 'critical',
  },
  {
    id: '3',
    product_name: 'Mekanik Klavye RGB',
    product_sku: 'MK-RGB-108',
    current_stock: 200,
    sales_velocity: 2.1,
    days_of_stock: 95,
    suggested_discount: 20,
    suggestion_type: 'stok_eritme',
    priority: 'medium',
  },
  {
    id: '4',
    product_name: 'Ergonomik Mouse Pad',
    product_sku: 'EMP-XL-005',
    current_stock: 500,
    sales_velocity: 8.7,
    days_of_stock: 57,
    suggested_discount: 5,
    suggestion_type: 'fiyat_esleme',
    priority: 'low',
  },
  {
    id: '5',
    product_name: '27" Gaming Monitör',
    product_sku: 'MON-27G-144',
    current_stock: 15,
    sales_velocity: 1.8,
    days_of_stock: 8,
    suggested_discount: 12,
    suggestion_type: 'kampanya',
    priority: 'critical',
  },
];

const typeLabels = {
  stok_eritme: 'Stok Eritme',
  kampanya: 'Kampanya',
  fiyat_esleme: 'Fiyat Eşleme',
};

const typeIcons = {
  stok_eritme: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  kampanya: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  fiyat_esleme: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
};

export default function CampaignSuggestions() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const result = await getCampaignSuggestions();
        setCampaigns(result.data);
      } catch (err) {
        console.warn('API bağlantısı yok, demo veriler kullanılıyor:', err.message);
        setCampaigns(demoCampaigns);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 mt-6">
        <div className="skeleton h-6 w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 w-full mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mt-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Kampanya & Stok Önerileri</h3>
          <p className="text-sm text-gray-500 mt-0.5">Satış hızına bağlı akıllı öneriler</p>
        </div>
        <span className="badge badge-info">{campaigns.length} öneri</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Ürün</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">Stok</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Satış Hızı</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Kalan Gün</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">İndirim</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Öncelik</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">Tip</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr
                key={c.id || i}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="text-white font-medium">{c.product_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.product_sku}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300 hidden sm:table-cell">{c.current_stock} adet</td>
                <td className="py-4 px-4 text-gray-300 hidden md:table-cell">{c.sales_velocity}/gün</td>
                <td className="py-4 px-4 hidden lg:table-cell">
                  <span className={`font-semibold ${c.days_of_stock <= 10 ? 'text-red-400' : c.days_of_stock <= 30 ? 'text-amber-400' : 'text-gray-300'}`}>
                    {c.days_of_stock} gün
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}
                  >
                    %{c.suggested_discount}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`badge badge-${c.priority}`}>
                    {c.priority === 'critical' ? 'Kritik' : c.priority === 'high' ? 'Yüksek' : c.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                </td>
                <td className="py-4 px-4 hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                    {typeIcons[c.suggestion_type]}
                    {typeLabels[c.suggestion_type]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
