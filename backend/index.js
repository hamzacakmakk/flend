// ==========================================================================
// index.js — Flend Birleşik API giriş noktası
//
// Boot sırası: Postgres (zorunlu) → Redis/RabbitMQ (opsiyonel, graceful) →
// demo kullanıcı parolası → Express dinle. Yalnızca Postgres yoksa uyarı
// verir; diğer servisler kapalıyken backend yine çalışır.
// ==========================================================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { pingDb } from './db/pool.js';
import { initRedis, pingRedis } from './infra/redis.js';
import { initRabbit, isRabbitReady } from './infra/rabbitmq.js';
import { ensureDemoUser } from './controllers/authController.js';

const PORT = process.env.PORT || 5000;

// ── Altyapı boot (opsiyonel servisler asla çökertmez) ────────────────────
await initRedis();
await initRabbit();

const dbOk = await pingDb();
if (dbOk) {
  console.log('✅ PostgreSQL bağlantısı kuruldu');
  await ensureDemoUser();
} else {
  console.warn('⚠️  PostgreSQL bağlanamadı — DATABASE_URL kontrol edin. `docker compose up -d postgres` çalıştırın.');
}

// ── Express ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Bilgi sayfası
app.get('/', (req, res) => {
  res.json({
    name: 'Flend Birleşik API',
    version: '1.0.0',
    docs: '/health ile servis durumunu görün',
    modules: ['auth', 'integrations', 'inventory', 'competitors', 'pricing-rules', 'dashboard', 'notifications'],
  });
});

// Sağlık kontrolü — Postgres, Redis, RabbitMQ durumu
app.get('/health', async (req, res) => {
  const [pg, redis] = await Promise.all([pingDb(), pingRedis()]);
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      postgres: pg ? '✅ bağlı' : '❌ bağlı değil',
      redis: redis ? '✅ bağlı' : '❌ bağlı değil',
      rabbitmq: isRabbitReady() ? '✅ bağlı' : '❌ bağlı değil',
    },
  });
});

// Tüm API route'ları
app.use(router);

// 404 + hata yönetimi (en sonda)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Flend API → http://localhost:${PORT}`);
  console.log(`🩺 Sağlık → http://localhost:${PORT}/health`);
  console.log('📱 Mobil için app.json içindeki extra.apiBaseUrl değerini LAN IP:PORT yapın.\n');
});

export default app;
