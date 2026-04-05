import { useState } from 'react';
import { Eye, Pencil, Trash2, ArrowUpDown, Search, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const SortHeader = ({ field, sortField, handleSort, children }) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider cursor-pointer select-none hover:text-surface-200 transition-colors"
    onClick={() => handleSort(field)}
  >
    <div className="flex items-center gap-1.5">
      {children}
      <ArrowUpDown size={12} className={sortField === field ? 'text-primary-400' : 'opacity-40'} />
    </div>
  </th>
);

export default function ProductTable({
  products,
  pagination,
  onPageChange,
  onSearch,
  onViewDetail,
  onEditMinPrice,
  onDelete,
  loading,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSort = (field) => {
    const newDir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDir(newDir);
  };

  const getStockBadge = (qty) => {
    if (qty === 0) return { text: 'Stok Yok', cls: 'badge-expired', icon: AlertTriangle };
    if (qty < 10) return { text: `${qty} adet`, cls: 'badge-expired', icon: TrendingDown };
    if (qty < 50) return { text: `${qty} adet`, cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/25', icon: TrendingDown };
    return { text: `${qty} adet`, cls: 'badge-active', icon: TrendingUp };
  };

  const getPriceStatus = (sale, min) => {
    if (!min) return null;
    const margin = ((sale - min) / min) * 100;
    if (margin < 5) return { cls: 'text-red-400', label: 'Kritik' };
    if (margin < 15) return { cls: 'text-amber-400', label: 'Düşük' };
    return { cls: 'text-emerald-400', label: 'İyi' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  const sortedProducts = [...(products || [])].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number') return sortDir === 'asc' ? valA - valB : valB - valA;
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });



  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-surface-700/30 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Ürün ara (başlık, barkod, kod)..."
            className="w-full bg-surface-800/60 border border-surface-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/30 transition-all"
          />
        </div>
        <span className="text-xs text-surface-500">
          {pagination?.total || 0} ürün
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-800/80">
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider w-12">
                #
              </th>
              <SortHeader field="title" sortField={sortField} handleSort={handleSort}>Ürün</SortHeader>
              <SortHeader field="stock_quantity" sortField={sortField} handleSort={handleSort}>Stok</SortHeader>
              <SortHeader field="sale_price" sortField={sortField} handleSort={handleSort}>Satış Fiyatı</SortHeader>
              <SortHeader field="min_price" sortField={sortField} handleSort={handleSort}>Min. Fiyat</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Marj
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-surface-400 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-800/40">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="skeleton h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-surface-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-30" />
                    <span>Ürün bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedProducts.map((product, idx) => {
                const stock = getStockBadge(product.stock_quantity);
                const priceStatus = getPriceStatus(product.sale_price, product.min_price);
                const StockIcon = stock.icon;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-surface-800/40 table-row-hover animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Index */}
                    <td className="px-4 py-3 text-xs text-surface-500">
                      {(pagination?.page - 1 || 0) * (pagination?.limit || 20) + idx + 1}
                    </td>

                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/40'}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover border border-surface-700/50 shrink-0"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-200 truncate max-w-[220px]">
                            {product.title}
                          </p>
                          <p className="text-xs text-surface-500">
                            {product.marketplace_product_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${stock.cls}`}>
                        <StockIcon size={12} />
                        {stock.text}
                      </span>
                    </td>

                    {/* Sale price */}
                    <td className="px-4 py-3 text-sm font-semibold text-surface-200">
                      {formatPrice(product.sale_price)}
                    </td>

                    {/* Min price */}
                    <td className="px-4 py-3 text-sm text-surface-400">
                      {product.min_price ? formatPrice(product.min_price) : '—'}
                    </td>

                    {/* Margin */}
                    <td className="px-4 py-3">
                      {priceStatus ? (
                        <span className={`text-xs font-medium ${priceStatus.cls}`}>
                          {priceStatus.label} ({(((product.sale_price - product.min_price) / product.min_price) * 100).toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="text-xs text-surface-500">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetail(product)}
                          className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all cursor-pointer"
                          title="Detay"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEditMinPrice(product)}
                          className="p-2 rounded-lg text-surface-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                          title="Min. Fiyat Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3 border-t border-surface-700/30 flex items-center justify-between">
          <span className="text-xs text-surface-500">
            Sayfa {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
