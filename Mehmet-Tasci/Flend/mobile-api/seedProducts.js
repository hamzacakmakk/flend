// Geçici demo veri betiği - envanter ekranını test etmek için
// Çalıştır: node seedProducts.js  (mobile-api klasöründe)
require('dotenv').config();
const supabase = require('./src/config/supabase');

const demo = [
  { marketplace_product_id: 'DEMO-001', title: 'Kablosuz Bluetooth Kulaklık', barcode: '8690000000001', sale_price: 749.9, stock_quantity: 25, currency: 'TRY', is_active: true, image_url: 'https://picsum.photos/seed/kulaklik/200' },
  { marketplace_product_id: 'DEMO-002', title: 'Akıllı Saat 1.9" AMOLED', barcode: '8690000000002', sale_price: 1299.0, stock_quantity: 8, currency: 'TRY', is_active: true, image_url: 'https://picsum.photos/seed/saat/200' },
  { marketplace_product_id: 'DEMO-003', title: 'USB-C Hızlı Şarj Kablosu 2m', barcode: '8690000000003', sale_price: 149.5, stock_quantity: 0, currency: 'TRY', is_active: true, image_url: 'https://picsum.photos/seed/kablo/200' },
  { marketplace_product_id: 'DEMO-004', title: 'Taşınabilir Powerbank 20000mAh', barcode: '8690000000004', sale_price: 899.0, stock_quantity: 42, currency: 'TRY', is_active: true, image_url: 'https://picsum.photos/seed/powerbank/200' },
  { marketplace_product_id: 'DEMO-005', title: 'Mekanik Oyuncu Klavyesi RGB', barcode: '8690000000005', sale_price: 1749.0, stock_quantity: 5, currency: 'TRY', is_active: true, image_url: 'https://picsum.photos/seed/klavye/200' },
];

(async () => {
  const { data, error } = await supabase
    .from('products')
    .upsert(demo, { onConflict: 'marketplace_product_id' })
    .select();
  if (error) {
    console.error('HATA:', error.message);
    process.exit(1);
  }
  console.log('Eklendi/güncellendi:', data.length, 'ürün');
})();
