// ============================================
// Redis bağlantısı (BullMQ için)
// ============================================
//
// Mesaj kuyruğu altyapısı Redis üzerinde çalışır (BullMQ).
// WSL Ubuntu'da çalışan redis-server'a, WSL2 localhost yönlendirmesi
// sayesinde Windows tarafından 127.0.0.1:6379 ile erişilir.

const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Sync kuyruğunun (queue/topic) adı.
const QUEUE_NAME = process.env.SYNC_QUEUE_NAME || 'product-sync';

// BullMQ, blocking komutlar kullandığı için bağlantıda
// maxRetriesPerRequest: null olmasını ZORUNLU kılar.
function createRedisConnection() {
  const conn = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
  conn.on('error', (err) => {
    console.error('[redis] bağlantı hatası:', err.message);
  });
  return conn;
}

module.exports = { REDIS_URL, QUEUE_NAME, createRedisConnection };
