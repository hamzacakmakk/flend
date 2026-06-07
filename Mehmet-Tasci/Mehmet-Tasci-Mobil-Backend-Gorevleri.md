# Mehmet Taşcı'nın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `backend/` (Express + PostgreSQL). Mobil istemci: `mobile/lib/api/inventory.ts`. Mobilden API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir.

## 1. Pazaryeri Entegrasyonu Ekleme Servisi
- **Endpoint:** `POST /api/integrations`
- **İstemci:** `addIntegration()`
- **Controller:** `backend/controllers/integrationController.js → createIntegration` (base_url otomatik belirleme)

## 2. Ürün Listesini Çekme Servisi
- **Endpoint:** `GET /api/inventory/products` (+ senkronizasyon: `POST /api/integrations/:id/sync`)
- **İstemci:** `getInventoryProducts()`, `syncIntegration()`
- **Controller:** `productController.js → getAllProducts`, `integrationController.js → syncProducts`

## 3. Tekil Ürün Detayı Getirme Servisi
- **Endpoint:** `GET /api/inventory/products/:id`
- **İstemci:** `getInventoryProduct()`
- **Controller:** `productController.js → getProductById`

## 4. Minimum Satış Fiyatı Güncelleme Servisi
- **Endpoint:** `PUT /api/inventory/products/:id/min-price`
- **İstemci:** `updateMinPrice()`
- **Controller:** `productController.js → updateMinPrice` (validasyon)

## 5. Pazaryeri API Bilgilerini Güncelleme Servisi
- **Endpoint:** `PUT /api/integrations/:id`
- **İstemci:** `updateIntegration()`
- **Controller:** `integrationController.js → updateIntegration`

## 6. Ürün Envanterden Silme Servisi
- **Endpoint:** `DELETE /api/inventory/products/:id`
- **İstemci:** `deleteInventoryProduct()`
- **Controller:** `productController.js → deleteProduct` (soft delete: is_active=false)
