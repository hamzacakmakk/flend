// ============================================
// Senkronizasyon worker'ı (CONSUMER tarafı)
// ============================================
//
// Kuyruktaki mesajları dinler ve geldikçe performSync'i ARKA PLANDA
// çalıştırır. Aynı anda birden fazla iş işleyebilir (concurrency).

const { Worker } = require('bullmq');
const { createRedisConnection, QUEUE_NAME } = require('./connection');
const { performSync } = require('../services/syncProcessor');

function startSyncWorker() {
  const connection = createRedisConnection();

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { integrationId } = job.data;
      console.log(`📦 [worker] sync başladı: job=${job.id} integration=${integrationId}`);
      const count = await performSync(integrationId, (p) => job.updateProgress(p));
      await job.updateProgress(100);
      return { count };
    },
    { connection, concurrency: 3 }
  );

  worker.on('completed', (job, result) =>
    console.log(`✅ [worker] sync bitti: job=${job.id} -> ${result?.count} ürün`)
  );
  worker.on('failed', (job, err) =>
    console.error(`❌ [worker] sync hata: job=${job?.id} -> ${err.message}`)
  );
  worker.on('ready', () =>
    console.log(`📥 [worker] "${QUEUE_NAME}" kuyruğu dinleniyor...`)
  );

  return worker;
}

module.exports = { startSyncWorker };
