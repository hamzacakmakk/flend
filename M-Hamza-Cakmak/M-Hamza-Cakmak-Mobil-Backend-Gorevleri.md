# Muhammed Hamza Çakmak'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `backend/` (Express + PostgreSQL + **Redis cache** + **RabbitMQ** + **Kafka**). Mobil istemci: `mobile/lib/api/competitors.ts`. Mobilden API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir.

## 1. Rakip Ürün Linki Ekleme Servisi
- **Endpoint:** `POST /competitors`
- **İstemci:** `addCompetitor()`
- **Controller:** `backend/controllers/competitorController.js → addCompetitor` (Redis cache invalidate)

## 2. Manuel Bot Çalıştırma (Async) Servisi
- **Endpoint:** `POST /competitors/sync`
- **İstemci:** `syncCompetitorPrices()` (30s timeout, AbortController)
- **Akış:** API → **RabbitMQ** (`sync_jobs`) → `backend/worker.js` → fiyat güncelle → **Kafka** (`price_updated`). RabbitMQ yoksa senkron fallback.

## 3. Rakip Satıcılar Listesi Servisi (Redis cache)
- **Endpoint:** `GET /products/:productId/competitors`
- **İstemci:** `getCompetitorsByProduct()`
- **Controller:** `competitorController.js → listForProduct` (Redis cache HIT/SET, TTL 60s)

## 4. Tarihsel Fiyat (Zaman Serisi) Servisi
- **Endpoint:** `GET /competitors/:competitorId/history`
- **İstemci:** `getCompetitorHistory()` (JSON → `DataPoint[]` dönüşümü)
- **Controller:** `competitorController.js → getHistory`

## 5. Takip Durumu Güncelleme (Optimistic) Servisi
- **Endpoint:** `PUT /competitors/:competitorId/status`
- **İstemci:** `updateCompetitorStatus()` (UI anında güncellenir, hata olursa rollback)
- **Controller:** `competitorController.js → updateStatus`

## 6. Rakip Takibini Silme Servisi
- **Endpoint:** `DELETE /competitors/:competitorId`
- **İstemci:** `deleteCompetitor()`
- **Controller:** `competitorController.js → deleteCompetitor`
