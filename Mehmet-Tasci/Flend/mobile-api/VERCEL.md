# Vercel'de Yayınlama (RabbitMQ + Redis korunarak)

Vercel **serverless** olduğu için sürekli açık bir worker tutamaz. Çözüm: worker'ın
işini **Vercel Cron** ile periyodik tetiklenen bir uç (`/api/queue/drain`) yapar.
RabbitMQ + Redis aynen kalır.

```
Mobil → POST /sync            → mesajı RabbitMQ'ya at        (Vercel fonksiyonu)
Cron (her 1 dk) → GET /api/queue/drain → kuyruğu çek+işle+Redis'e yaz (Vercel fonksiyonu)
```

## Eklenen kod
- `src/queue/drivers/rabbitmq.js` → `drainQueue()`: `ch.get` ile mesajları çeker,
  `performSync` çalıştırır, ack/nack yapar, bağlantıyı kapatır (serverless dostu).
- `src/queue/index.js` → facade'a `drainQueue` eklendi (diğer driver'larda güvenli stub).
- `src/app.js` → `GET /api/queue/drain` ucu (CRON_SECRET ile korumalı).
- `vercel.json` → Express'i serverless function olarak sunar + cron tanımı.
- `package.json` → `engines.node = 22.x` (Supabase WebSocket için şart).

## Deploy adımları
1. **CloudAMQP** (RabbitMQ) ve **Upstash** (Redis) hesabı aç, bağlantı URL'lerini al.
2. Vercel projesi oluştur → **Root Directory = `Mehmet-Tasci/Flend/mobile-api`**.
3. Vercel → Settings → Environment Variables:
   ```
   SUPABASE_URL          = https://....supabase.co
   SUPABASE_KEY          = <anon key>
   MOBILE_API_TOKEN      = flend-mobile-dev-token
   QUEUE_DRIVER          = rabbitmq
   RABBITMQ_URL          = amqps://...cloudamqp.com/...
   REDIS_URL             = rediss://...upstash.io:...
   CRON_SECRET           = <rastgele uzun bir gizli dize>
   ```
   > `127.0.0.1` adresleri Vercel'de GEÇMEZ — yönetilen servis URL'lerini gir.
4. Deploy et. Cron, `CRON_SECRET` tanımlıysa drain ucunu otomatik yetkili çağırır.

## ⚠️ Ücretsiz (Hobby) plan cron kısıtı
Vercel **Hobby planında cron günde 1 kez** çalışır — dakikalık tetikleme **Pro** gerektirir.
`vercel.json`'daki `* * * * *` Pro'da geçerli. Hobby'desen iki seçenek:

- **cron-job.org** (ücretsiz): her 1 dk şu adresi çağırsın:
  `GET https://projen.vercel.app/api/queue/drain`
  Header: `Authorization: Bearer <CRON_SECRET>`
- **GitHub Actions** (ücretsiz): `schedule` ile dakikalık workflow aynı URL'yi `curl`'ler.

Bu durumda `vercel.json`'dan `crons` bloğunu silebilirsin; dış servis tetikler.

## Mobil taraf
`mobile/src/config.js`:
```js
export const API_BASE_URL = 'https://projen.vercel.app/api';
```
Artık `adb reverse` / `127.0.0.1` gerekmez — telefon internetten bağlanır.

## Yerelde doğrulandı
- `drainQueue()` 2 mesajı çekip işledi, kuyruk 0'a indi.
- `GET /api/queue/drain` secret'sız → **401**; doğru secret ile → `{success, processed, ...}`.

## Senkron gecikmesi
Senkron artık anlık değil; cron aralığı kadar (en geç ~1 dk) içinde işlenir. Demo için yeterli.
