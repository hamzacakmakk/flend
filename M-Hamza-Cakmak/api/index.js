import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import amqplib from 'amqplib';

// ─────────────────────────────────────────────────────────────────────────────
// Supabase
// ─────────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim();

console.log('--- DB Config ---');
console.log('Project URL:', supabaseUrl);
console.log('API Key Loaded:', !!supabaseKey);

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client initialized');
  } catch (err) {
    console.error('❌ Supabase Client Error:', err.message);
  }
} else {
  console.warn('⚠️  SUPABASE_URL veya SUPABASE_ANON_KEY bulunamadı.');
}
console.log('------------------');

// ─────────────────────────────────────────────────────────────────────────────
// Redis — Cache
// ─────────────────────────────────────────────────────────────────────────────
const REDIS_URL       = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL       = parseInt(process.env.REDIS_CACHE_TTL || '60', 10);

let redis = null;
try {
  redis = new Redis(REDIS_URL, { lazyConnect: true });
  await redis.connect();
  console.log('✅ Redis bağlantısı kuruldu');
} catch (err) {
  console.warn('⚠️  Redis bağlanamadı — cache devre dışı:', err.message);
  redis = null;
}

// Yardımcı: Cache'den oku veya Supabase'den çek + cache'e yaz
async function cachedQuery(cacheKey, queryFn) {
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`🗄️  Redis cache HIT: ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Redis okuma hatası:', e.message);
    }
  }

  const data = await queryFn();

  if (redis) {
    try {
      await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL);
      console.log(`💾 Redis cache SET: ${cacheKey} (TTL: ${CACHE_TTL}s)`);
    } catch (e) {
      console.warn('Redis yazma hatası:', e.message);
    }
  }

  return data;
}

// Cache invalidate (veri değiştiğinde eski cache'i sil)
async function invalidateCache(...keys) {
  if (!redis) return;
  try {
    await redis.del(...keys);
    console.log(`🗑️  Cache silindi: ${keys.join(', ')}`);
  } catch (e) {
    console.warn('Cache invalidation hatası:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RabbitMQ — Async Sync Queue (Producer)
// ─────────────────────────────────────────────────────────────────────────────
const RABBITMQ_URL        = process.env.RABBITMQ_URL || 'amqp://localhost';
const RABBITMQ_SYNC_QUEUE = process.env.RABBITMQ_SYNC_QUEUE || 'sync_jobs';

let rabbitChannel = null;
try {
  const conn = await amqplib.connect(RABBITMQ_URL);
  rabbitChannel = await conn.createChannel();
  await rabbitChannel.assertQueue(RABBITMQ_SYNC_QUEUE, { durable: true });
  console.log(`✅ RabbitMQ bağlantısı kuruldu — Queue: "${RABBITMQ_SYNC_QUEUE}"`);
} catch (err) {
  console.warn('⚠️  RabbitMQ bağlanamadı — sync async devre dışı:', err.message);
  rabbitChannel = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Express
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /competitors — Rakip Ürün Linki Ekleme
// ─────────────────────────────────────────────────────────────────────────────
app.post('/competitors', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { productId, competitorUrl, sellerName } = req.body;

    if (!productId || !competitorUrl) {
      return res.status(400).json({ error: 'productId ve competitorUrl zorunludur' });
    }

    const { data, error } = await supabase
      .from('competitors')
      .insert({
        product_id: productId,
        competitor_url: competitorUrl,
        seller_name: sellerName || 'Bilinmeyen Satıcı',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Yeni rakip eklendi → ilgili cache'i temizle
    await invalidateCache(`competitors:${productId}`, 'products');

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /competitors/sync — Manuel Bot Çalıştırma (RabbitMQ ile Async)
//
// Artık senkron işlem yapmıyor. RabbitMQ "sync_jobs" queue'ya bir mesaj
// bırakıp hemen 202 Accepted döner. Asıl iş worker.js tarafından yapılır.
// ─────────────────────────────────────────────────────────────────────────────
app.post('/competitors/sync', async (req, res) => {
  // RabbitMQ yoksa eski senkron davranışa düş
  if (!rabbitChannel) {
    console.warn('⚠️  RabbitMQ yok — senkron sync çalışıyor');
    return syncCompetitorsDirect(req, res);
  }

  try {
    const jobPayload = {
      triggeredAt: new Date().toISOString(),
      requestedBy: req.ip || 'unknown',
    };

    rabbitChannel.sendToQueue(
      RABBITMQ_SYNC_QUEUE,
      Buffer.from(JSON.stringify(jobPayload)),
      { persistent: true }
    );

    console.log(`📨 Sync job kuyruğa eklendi: ${JSON.stringify(jobPayload)}`);

    res.status(202).json({
      message: 'Senkronizasyon kuyruğa alındı. Worker arka planda işlemi yürütecek.',
      queue: RABBITMQ_SYNC_QUEUE,
      triggeredAt: jobPayload.triggeredAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback — RabbitMQ yoksa doğrudan sync yap (eski davranış)
async function syncCompetitorsDirect(req, res) {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });

    const { data: competitors, error: fetchError } = await supabase
      .from('competitors')
      .select('*')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    let syncCount = 0;
    for (const comp of competitors) {
      const change = (Math.random() - 0.5) * 0.04;
      const currentPrice = Number(comp.last_price) || 1000;
      const newPrice = Math.round(currentPrice * (1 + change) * 100) / 100;

      await supabase
        .from('competitors')
        .update({ last_price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', comp.id);

      await supabase.from('price_history').insert({ competitor_id: comp.id, price: newPrice });
      syncCount++;
    }

    res.status(200).json({ message: 'Senkronizasyon tamamlandı', count: syncCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /products/:productId/competitors — Rakip Satıcılar Listesi (Redis cache)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/products/:productId/competitors', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { productId } = req.params;
    const cacheKey = `competitors:${productId}`;

    const data = await cachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /competitors/:competitorId/history — Tarihsel Fiyat Logları
// ─────────────────────────────────────────────────────────────────────────────
app.get('/competitors/:competitorId/history', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PUT /competitors/:competitorId/status — Takip Durumu Güncelleme
// ─────────────────────────────────────────────────────────────────────────────
app.put('/competitors/:competitorId/status', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;
    const { isActive } = req.body;

    const { data, error } = await supabase
      .from('competitors')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', competitorId)
      .select()
      .single();

    if (error) throw error;

    // Durum değişti → ürünün cache'ini temizle
    if (data?.product_id) {
      await invalidateCache(`competitors:${data.product_id}`);
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /competitors/:competitorId — Rakip Takibini Silme
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/competitors/:competitorId', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;

    // Silmeden önce product_id'yi al (cache invalidation için)
    const { data: existing } = await supabase
      .from('competitors')
      .select('product_id')
      .eq('id', competitorId)
      .single();

    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', competitorId);

    if (error) throw error;

    if (existing?.product_id) {
      await invalidateCache(`competitors:${existing.product_id}`);
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Yardımcı: GET /products — Tüm ürünleri listele (Redis cache)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/products', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });

    const data = await cachedQuery('products', async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Sağlık kontrolü — Redis, RabbitMQ, Supabase durumu
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const redisOk = redis ? (await redis.ping().catch(() => null)) === 'PONG' : false;
  const rabbitOk = !!rabbitChannel;
  const supabaseOk = !!supabase;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: supabaseOk ? '✅ bağlı' : '❌ bağlı değil',
      redis:    redisOk    ? '✅ bağlı' : '❌ bağlı değil',
      rabbitmq: rabbitOk   ? '✅ bağlı' : '❌ bağlı değil',
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sunucu başlatma
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Flend API port ${PORT} üzerinde çalışıyor.`);
    console.log(`🩺 Sağlık: http://localhost:${PORT}/health`);
  });
}

export default app;
