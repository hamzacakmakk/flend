// ============================================
// Driver: Kafka (kafkajs) — dağıtık olay akışı (event streaming)
// ============================================
//
// NOT: Kafka klasik bir "kuyruk" değil, bir olay log'udur. Bu proje için
// overkill'dir; ödevde de "RabbitMQ fazlasıyla yeter" denir. Yine de aynı
// arayüzle (enqueueSync/getJobStatus/startSyncWorker) bağlanmıştır.
//
// Producer topic'e mesaj yazar; consumer (consumer group) okur ve
// performSync'i çalıştırır. Durum Redis (jobStore) üzerinden takip edilir.

const { Kafka, logLevel } = require('kafkajs');
const jobStore = require('../jobStore');
const { performSync } = require('../../services/syncProcessor');

const BROKERS = (process.env.KAFKA_BROKERS || '127.0.0.1:9092').split(',');
const TOPIC = process.env.SYNC_QUEUE_NAME || 'product-sync';
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'flend-sync-workers';

const kafka = new Kafka({
  clientId: 'flend-mobile-api',
  brokers: BROKERS,
  logLevel: logLevel.NOTHING,
  retry: { retries: 3 },
});

let producer = null;

async function getProducer() {
  if (producer) return producer;
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

// PRODUCER: topic'e olay yaz, jobId döndür.
async function enqueueSync(integrationId) {
  const jobId = await jobStore.createJob(integrationId);
  const p = await getProducer();
  await p.send({
    topic: TOPIC,
    messages: [{ key: integrationId, value: JSON.stringify({ jobId, integrationId }) }],
  });
  return jobId;
}

async function getJobStatus(jobId) {
  return jobStore.getJob(jobId);
}

// CONSUMER: topic'i dinle, performSync'i çalıştır.
function startSyncWorker() {
  (async () => {
    // Topic yoksa oluştur
    const admin = kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [{ topic: TOPIC, numPartitions: 1 }],
      waitForLeaders: true,
    }).catch(() => {});
    await admin.disconnect();

    const consumer = kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
    console.log(`📥 [kafka] "${TOPIC}" topic'i dinleniyor...`);

    await consumer.run({
      eachMessage: async ({ message }) => {
        let payload;
        try {
          payload = JSON.parse(message.value.toString());
        } catch (e) {
          return;
        }
        const { jobId, integrationId } = payload;
        console.log(`📦 [kafka] sync başladı: job=${jobId} integration=${integrationId}`);
        try {
          await jobStore.updateJob(jobId, { state: 'active', progress: 10 });
          const count = await performSync(integrationId, (p) =>
            jobStore.updateJob(jobId, { progress: p })
          );
          await jobStore.updateJob(jobId, { state: 'completed', progress: 100, count });
          console.log(`✅ [kafka] sync bitti: job=${jobId} -> ${count} ürün`);
        } catch (err) {
          await jobStore.updateJob(jobId, { state: 'failed', failedReason: err.message });
          console.error(`❌ [kafka] sync hata: job=${jobId} -> ${err.message}`);
        }
      },
    });
  })().catch((err) => {
    console.error('⚠️  [kafka] worker başlatılamadı:', err.message);
  });
}

module.exports = { name: 'kafka', enqueueSync, getJobStatus, startSyncWorker };
