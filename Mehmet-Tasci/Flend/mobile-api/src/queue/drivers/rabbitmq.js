// ============================================
// Driver: RabbitMQ (amqplib) — klasik AMQP mesaj kuyruğu
// ============================================
//
// API mesajı durable bir kuyruğa publish eder (producer); worker prefetch=1
// ile tüketir, performSync'i çalıştırır ve ack/nack yapar (consumer).
// İş durumu Redis (jobStore) üzerinden takip edilir.

const amqp = require('amqplib');
const jobStore = require('../jobStore');
const { performSync } = require('../../services/syncProcessor');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672';
const QUEUE_NAME = process.env.SYNC_QUEUE_NAME || 'product-sync';

let producerChannel = null;

async function getProducerChannel() {
  if (producerChannel) return producerChannel;
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE_NAME, { durable: true });
  conn.on('close', () => { producerChannel = null; });
  producerChannel = ch;
  return ch;
}

// PRODUCER: işi kuyruğa publish et, jobId döndür.
async function enqueueSync(integrationId) {
  const jobId = await jobStore.createJob(integrationId);
  const ch = await getProducerChannel();
  ch.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify({ jobId, integrationId })),
    { persistent: true }
  );
  return jobId;
}

// Durum sorgusu (Redis jobStore'dan).
async function getJobStatus(jobId) {
  return jobStore.getJob(jobId);
}

// CONSUMER: kuyruğu dinle, performSync'i arka planda çalıştır.
function startSyncWorker() {
  (async () => {
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE_NAME, { durable: true });
    ch.prefetch(1); // aynı anda tek iş
    console.log(`📥 [rabbitmq] "${QUEUE_NAME}" kuyruğu dinleniyor...`);

    ch.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (e) {
        ch.ack(msg); // bozuk mesajı kuyruktan at
        return;
      }
      const { jobId, integrationId } = payload;
      console.log(`📦 [rabbitmq] sync başladı: job=${jobId} integration=${integrationId}`);
      try {
        await jobStore.updateJob(jobId, { state: 'active', progress: 10 });
        const count = await performSync(integrationId, (p) =>
          jobStore.updateJob(jobId, { progress: p })
        );
        await jobStore.updateJob(jobId, { state: 'completed', progress: 100, count });
        console.log(`✅ [rabbitmq] sync bitti: job=${jobId} -> ${count} ürün`);
        ch.ack(msg);
      } catch (err) {
        await jobStore.updateJob(jobId, { state: 'failed', failedReason: err.message });
        console.error(`❌ [rabbitmq] sync hata: job=${jobId} -> ${err.message}`);
        ch.nack(msg, false, false); // tekrar kuyruğa koyma (dead-letter yok)
      }
    });
  })().catch((err) => {
    console.error('⚠️  [rabbitmq] worker başlatılamadı:', err.message);
  });
}

// DRAIN: serverless/cron için "pull" tüketici.
// Sürekli dinleyen bir worker yerine (Vercel'de mümkün değil), kuyruktan
// ch.get ile mesajları teker teker çeker, işler ve bağlantıyı kapatır.
// Vercel Cron bunu periyodik (örn. dakikada bir) tetikler.
//   maxMessages: bu turda işlenecek azami mesaj sayısı
//   maxMillis  : fonksiyon zaman aşımına yaklaşmamak için süre sınırı
async function drainQueue({ maxMessages = 10, maxMillis = 25000 } = {}) {
  const started = Date.now();
  const result = { processed: 0, succeeded: 0, failed: 0 };

  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  try {
    await ch.assertQueue(QUEUE_NAME, { durable: true });

    while (result.processed < maxMessages && Date.now() - started < maxMillis) {
      const msg = await ch.get(QUEUE_NAME, { noAck: false });
      if (!msg) break; // kuyruk boş

      let payload;
      try {
        payload = JSON.parse(msg.content.toString());
      } catch (e) {
        ch.ack(msg); // bozuk mesajı at
        continue;
      }

      const { jobId, integrationId } = payload;
      result.processed++;
      console.log(`📦 [drain] sync başladı: job=${jobId} integration=${integrationId}`);
      try {
        await jobStore.updateJob(jobId, { state: 'active', progress: 10 });
        const count = await performSync(integrationId, (p) =>
          jobStore.updateJob(jobId, { progress: p })
        );
        await jobStore.updateJob(jobId, { state: 'completed', progress: 100, count });
        ch.ack(msg);
        result.succeeded++;
        console.log(`✅ [drain] sync bitti: job=${jobId} -> ${count} ürün`);
      } catch (err) {
        await jobStore.updateJob(jobId, { state: 'failed', failedReason: err.message });
        ch.nack(msg, false, false); // tekrar kuyruğa koyma
        result.failed++;
        console.error(`❌ [drain] sync hata: job=${jobId} -> ${err.message}`);
      }
    }
  } finally {
    await ch.close().catch(() => {});
    await conn.close().catch(() => {});
  }
  return result;
}

module.exports = { name: 'rabbitmq', enqueueSync, getJobStatus, startSyncWorker, drainQueue };
