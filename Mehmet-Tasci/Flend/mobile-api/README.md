# Flend Mobil Backend

Mobil uygulamanın kullandığı REST servis katmanı. Web API ile **aynı Supabase
tablolarını** (`integrations`, `products`) paylaşır; sadece mobil istemci için
ayrı port ve `/api/inventory` öneki ile çalışır.

## Kurulum

```bash
cd mobile-api
npm install
cp .env.example .env   # değerleri doldurun (Supabase + MOBILE_API_TOKEN)
npm run dev
```

Sunucu varsayılan olarak `http://localhost:5001` adresinde açılır.

## Kimlik Doğrulama

Tüm `/api/...` rotaları `Authorization: Bearer <MOBILE_API_TOKEN>` başlığı
ister. `.env` içindeki `MOBILE_API_TOKEN` boş bırakılırsa doğrulama atlanır
(yalnızca geliştirme).

## Endpointler (Mehmet Taşcı - Mobil Backend Görevleri)

| # | Görev | Method | Endpoint |
|---|-------|--------|----------|
| 0 | Sağlık kontrolü | GET | `/api/health` |
| 1 | Entegrasyon ekleme | POST | `/api/integrations` |
| 5 | Entegrasyon güncelleme (token yenileme) | PUT | `/api/integrations/:id` |
| - | Entegrasyon listesi | GET | `/api/integrations` |
| - | Ürün senkronizasyonu | POST | `/api/integrations/:id/sync` |
| 2 | Ürün listesi (sayfalı) | GET | `/api/inventory/products` |
| 3 | Tekil ürün detayı | GET | `/api/inventory/products/:productId` |
| 4 | Minimum fiyat güncelleme | PUT | `/api/inventory/products/:productId/min-price` |
| 6 | Ürün silme / takipten çıkarma | DELETE | `/api/inventory/products/:productId` |

### Örnek istek

```bash
curl -X POST http://localhost:5001/api/integrations \
  -H "Authorization: Bearer flend-mobile-dev-token" \
  -H "Content-Type: application/json" \
  -d '{"marketplace_name":"diğer","api_key":"eyJhbG..."}'
```

Hata yanıtları tutarlı biçimdedir; mobil istemci `400` ve `401` durumlarını
yakalar:

```json
{ "success": false, "message": "Pazaryeri adı ve API Key zorunludur" }
```
