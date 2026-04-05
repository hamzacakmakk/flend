import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';
import ProductTable from '../components/ProductTable';
import ProductDetailModal from '../components/ProductDetailModal';
import MinPriceEditor from '../components/MinPriceEditor';
import toast from 'react-hot-toast';
import { Package, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ page, limit: 20, search });
      setProducts(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (searchDebounce) clearTimeout(searchDebounce);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, term);
    }, 400);
    setSearchDebounce(timeout);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, searchTerm);
  };

  const handleMinPriceSave = async (id, minPrice) => {
    try {
      await productAPI.updateMinPrice(id, minPrice);
      toast.success('Minimum fiyat güncellendi');
      setEditingProduct(null);
      fetchProducts(currentPage, searchTerm);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`"${product.title}" ürününü envanterden kaldırmak istediğinizden emin misiniz?`)) return;
    try {
      await productAPI.delete(product.id);
      toast.success('Ürün envanterden kaldırıldı');
      fetchProducts(currentPage, searchTerm);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu');
    }
  };

  // Stats
  const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
  const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10).length;

  const stats = [
    {
      label: 'Toplam Ürün',
      value: pagination?.total || 0,
      icon: Package,
      color: 'from-primary-500/20 to-primary-600/10',
      borderColor: 'border-primary-500/20',
      textColor: 'text-primary-400',
    },
    {
      label: 'Toplam Stok',
      value: totalStock.toLocaleString('tr-TR'),
      icon: Package,
      color: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Stok Yok',
      value: outOfStock,
      icon: AlertTriangle,
      color: 'from-red-500/20 to-red-600/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
    },
    {
      label: 'Düşük Stok',
      value: lowStock,
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              }}
            >
              <Package size={20} className="text-white" />
            </div>
            Envanter Yönetimi
          </h1>
          <p className="text-surface-400 text-sm mt-1 ml-[52px]">
            Ürün stoklarınızı ve fiyatlarınızı takip edin
          </p>
        </div>
        <button
          onClick={() => fetchProducts(currentPage, searchTerm)}
          className="p-2.5 rounded-xl text-surface-400 hover:text-surface-200 bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/30 transition-all cursor-pointer"
          title="Yenile"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`glass rounded-xl p-4 animate-fade-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} border ${stat.borderColor}`}
              >
                <stat.icon size={18} className={stat.textColor} />
              </div>
              <div>
                <p className="text-xs text-surface-500">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Table */}
      <ProductTable
        products={products}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onViewDetail={setSelectedProduct}
        onEditMinPrice={setEditingProduct}
        onDelete={handleDelete}
      />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {editingProduct && (
        <MinPriceEditor
          product={editingProduct}
          onSave={handleMinPriceSave}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
