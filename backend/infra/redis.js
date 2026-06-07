// ==========================================================================
// infra/redis.js — Redis önbellek katmanı (graceful-degradation)
//
// Redis bağlanamazsa cache devre dışı kalır; cachedQuery doğrudan sorguyu
// çalıştırır, invalidateCache no-op olur. Backend asla çökmemelidir.
// (M-Hamza-Cakmak/api/index.js cachedQuery/invalidateCache deseninden.)
// ==========================================================================
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '60', 10);

let redis = null;

export async function initRedis() {
  try {
    redis = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // servis yoksa boot'ta takılma — fallback devreye girer
    });
    redis.on('error', () => {}); // sessiz — bağlantı koparsa fallback devreye girer
    await redis.connect();
    console.log('✅ Redis bağlantısı kuruldu');
  } catch (err) {
    console.warn('⚠️  Redis bağlanamadı — cache devre dışı:', err.message);
    redis = null;
  }
}

export function isRedisReady() {
  return !!redis && redis.status === 'ready';
}

export async function pingRedis() {
  if (!redis) return false;
  try {
    return (await redis.ping()) === 'PONG';
  } catch {
    return false;
  }
}

// Cache'den oku, yoksa queryFn çalıştır + cache'e yaz.
export async function cachedQuery(cacheKey, queryFn) {
  if (isRedisReady()) {
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

  if (isRedisReady()) {
    try {
      await redis.set(cacheKey, JSON.stringify(data), 'EX', CACHE_TTL);
      console.log(`💾 Redis cache SET: ${cacheKey} (TTL: ${CACHE_TTL}s)`);
    } catch (e) {
      console.warn('Redis yazma hatası:', e.message);
    }
  }

  return data;
}

// Veri değiştiğinde ilgili cache anahtarlarını sil.
export async function invalidateCache(...keys) {
  if (!isRedisReady() || keys.length === 0) return;
  try {
    await redis.del(...keys);
    console.log(`🗑️  Cache silindi: ${keys.join(', ')}`);
  } catch (e) {
    console.warn('Cache invalidation hatası:', e.message);
  }
}
