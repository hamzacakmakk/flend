# Video Sunum

Bu bölümde, her grup üyesinin **bireysel teknoloji kanıt videoları** (RabbitMQ/Kafka, Redis, Docker + CI/CD) ve grubun **final proje sunum videosu** yer alır.

> Tüm teknolojiler tek birleşik backend'de (`backend/`) ortak çalışır. Redis önbelleği her üyenin bir okuma gereksiniminde kullanılır; Docker + CI/CD tüm modülleri kapsar; RabbitMQ/Kafka asenkron fiyat senkronizasyonu (rakip takibi) içindir.
>
> Kanıt videolarında kendi sesiniz duyulmalı; önce gereksinim adı söylenmeli, sonra kanıt gösterilmelidir.

---

## Bireysel Teknoloji Videoları (5 üye × 3 = 15)

### Tufan Akbaş
- **RabbitMQ / Kafka:** Kullanmadım.
- **Redis:** Abonelik paketleri listeleme (`GET /api/subscriptions/plans`) Redis cache ile sunulur — `backend/controllers/authController.js`. [Link buraya eklenecek](https://example.com)
- **Docker + CI/CD:** `docker compose up` ile auth servisini ayağa kaldırma + `.github/workflows/ci.yml`. [Link buraya eklenecek](https://example.com)

### Mehmet Taşcı
- **RabbitMQ / Kafka:** Kullanmadım.
- **Redis:** Envanter listesi (`GET /api/inventory/products`) Redis cache + yazma sonrası invalidation — `backend/controllers/productController.js`. [Link buraya eklenecek](https://example.com)
- **Docker + CI/CD:** Birleşik backend Docker image + GitHub Actions pipeline. [Link buraya eklenecek](https://example.com)

### Muhammed Hamza Çakmak
- **RabbitMQ / Kafka:** Manuel bot (`POST /competitors/sync`) → RabbitMQ `sync_jobs` kuyruğu → `backend/worker.js` → Kafka `price_updated` topic → `backend/kafkaConsumer.js`. [Link buraya eklenecek](https://example.com)
- **Redis:** Rakip listesi (`GET /products/:id/competitors`) Redis cache (HIT/SET) + invalidation — `backend/controllers/competitorController.js`. [Link buraya eklenecek](https://example.com)
- **Docker + CI/CD:** 5 servisli `docker-compose.yml` (Postgres + Redis + RabbitMQ + Zookeeper + Kafka) + CI. [Link buraya eklenecek](https://example.com)

### Kadir Cihan Kığılcım
- **RabbitMQ / Kafka:** Kullanmadım.
- **Redis:** Fiyatlandırma kuralları listesi (`GET /api/pricing-rules`) Redis cache + invalidation — `backend/controllers/pricingController.js`. [Link buraya eklenecek](https://example.com)
- **Docker + CI/CD:** `docker compose up` ile pricing servisini çalıştırma + CI tip kontrolü. [Link buraya eklenecek](https://example.com)

### Nurullah Turgut
- **RabbitMQ / Kafka:** Kullanmadım.
- **Redis:** Dashboard istatistikleri (`GET /api/dashboard/stats`) Redis cache — `backend/controllers/analyticsController.js`. [Link buraya eklenecek](https://example.com)
- **Docker + CI/CD:** `docker compose up` ile dashboard/bildirim servisini çalıştırma + CI. [Link buraya eklenecek](https://example.com)

---

## Final Proje Sunum Videosu

- **Tam demo (Docker + Expo, uçtan uca):** [Link buraya eklenecek](https://example.com)

> İçerik (YazMuh şablonuna göre): proje tanıtımı, mimari (mobil + birleşik REST API + Postgres/Redis/RabbitMQ/Kafka), 30 gereksinimin mobil uygulamada gösterimi, ekip görev dağılımı.
