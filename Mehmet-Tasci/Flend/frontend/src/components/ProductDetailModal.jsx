import React from 'react';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Ürün Detayı</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-medium">Kapat</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Satış Fiyatı</span>
              <span className="font-bold text-gray-800">{product.price} TL</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Stok Miktarı</span>
              <span className="font-bold text-gray-800">{product.stock_quantity}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Tüm Bilgiler (JSON)</h4>
            <pre className="text-xs bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
