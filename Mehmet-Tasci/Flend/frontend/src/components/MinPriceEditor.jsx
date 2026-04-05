import React, { useState } from 'react';

export default function MinPriceEditor({ product, onSave, onCancel }) {
  const [minPrice, setMinPrice] = useState(product?.min_price || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product.id, Number(minPrice));
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Minimum Fiyat Belirle</h3>
          <p className="text-sm text-gray-500 mb-6 truncate" title={product.title}>{product.title}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Fiyat</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-medium">
                {product.price} TL
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fiyat Limiti (TL)</label>
              <input
                type="number"
                step="0.01"
                required
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Örn: 99.90"
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-8">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
