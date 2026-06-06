# Docker & CI/CD — Flend Mobil Backend

Bu doküman ödevin **Docker** ve **CI/CD** gereksinimlerini açıklar ve kanıt videosu için adımları verir.

---

## 1. Docker nedir, neden?

Docker uygulamayı **bağımlılıklarıyla birlikte** taşınabilir bir "konteyner" imajına paketler.
"Benim makinemde çalışıyordu" sorunu biter — imaj her yerde aynı çalışır.

Bu projede 4 servis tek komutla ayağa kalkar (WSL'e elle RabbitMQ/Redis kurmaya **gerek yok**):

| Servis | Görev |
|---|---|
| `api` | Express API (port 5001) — işi kuyruğa atar (producer) |
| `worker` | Kuyruğu dinleyip senkronizasyonu yapar (consumer) |
| `rabbitmq` | Mesaj kuyruğu broker'ı (panel: http://localhost:15672, guest/guest) |
| `redis` | İş durumu / önbellek deposu |

### Dosyalar
- `Dockerfile` — API/worker imajı (node:22-alpine, ayrıcalıksız kullanıcı, HEALTHCHECK)
- `.dockerignore` — imaja gereksiz dosyaları (node_modules, .env, .git) almaz
- `docker-compose.yml` — 4 servisi birbirine bağlar

### Çalıştırma
```bash
cd Mehmet-Tasci/Flend/mobile-api
# .env dosyanızda SUPABASE_URL / SUPABASE_KEY dolu olmalı
docker compose up --build
```
Açılınca:
- API: http://localhost:5001/api/health
- RabbitMQ paneli: http://localhost:15672 (guest / guest)

Durdurma: `docker compose down`

> Compose içinde broker adresleri konteyner ağına göre otomatik ayarlanır
> (`RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`, `REDIS_URL=redis://redis:6379`).
> Yani WSL kurulumuna gerek kalmaz.

---

## 2. CI/CD nedir, neden?

**CI (Continuous Integration):** Her `git push`'ta kod otomatik kurulur ve test edilir.
**CD (Continuous Delivery):** Testler geçerse Docker imajı otomatik derlenir/doğrulanır.

Sağlayıcı: **GitHub Actions** (ücretsiz, ekstra sunucu gerekmez).
Pipeline dosyası: `.github/workflows/mobile-api-ci.yml` (repo kökünde).

### Pipeline akışı
```
git push  ─►  GitHub Actions tetiklenir
                │
                ├─ [ci]            ubuntu + RabbitMQ + Redis servisleri
                │   ├─ npm ci                         (bağımlılık kurulumu)
                │   ├─ node --check *.js              (sözdizimi kontrolü)
                │   └─ ci/queue-smoke-test.js         (RabbitMQ+Redis uçtan uca test)
                │
                └─ [docker-build]  (ci geçerse)
                    ├─ docker build                   (imajı derle)
                    └─ docker run + /api/health       (imaj çalışıyor mu?)
                │
                ▼
            ✅ yeşil tik  /  ❌ kırmızı çarpı
```

Sadece `mobile-api/**` değiştiğinde tetiklenir (diğer ekip üyelerini etkilemez).
Actions sekmesinden **Run workflow** ile elle de çalıştırılabilir (`workflow_dispatch`).

---

## 3. Yerelde doğrulanan kanıtlar (bu makinede çalıştırıldı)

- ✅ `docker build` başarıyla imajı üretti (`flend-mobile-api`)
- ✅ Konteyner ayağa kalktı, `GET /api/health` → `{"success":true,...}` döndü
- ✅ `docker compose config` geçerli
- ✅ `ci/queue-smoke-test.js` yerelde geçti (RabbitMQ + Redis round-trip)

---

## 4. Kanıt videosu için öneri (madde 7)

1. **Docker:** `docker compose up --build` → 4 konteynerin "healthy" olduğunu, panelde
   (`localhost:15672`) `product-sync` kuyruğunu, ve `/api/health` cevabını göster.
2. **CI/CD:** Küçük bir değişiklik push'la → GitHub **Actions** sekmesinde pipeline'ın
   yeşil tik aldığını (ci + docker-build adımları) göster.
