// ============================================
// Senkronizasyon kuyruğu (PRODUCER tarafı)
// ============================================
//
// API, "şu entegrasyonu senkronize et" mesajını bu kuyruğa atar ve
// hemen döner. İşi worker arka planda yapar. (BullMQ + Redis)

const { Queue } = require('bullmq');
const { createRedisConnection, QUEUE_NAME } = require('./connection');

const connection = createRedisConnection();
const syncQueue = new Queue(QUEUE_NAME, { connection });

// Mesajı kuyruğa at; oluşturulan iş (job) kimliğini döndür.
async function enqueueSync(integrationId) {
  const job = await syncQueue.add(
    'sync',
    { integrationId },
    {
      attempts: 3, // başarısız olursa 3 kez dene
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    }
  );
  return job.id;
}

// İşin güncel durumunu döndür (mobil uygulama bunu poll eder).
async function getJobStatus(jobId) {
  const job = await syncQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState(); // waiting | active | completed | failed | delayed
  return {
    jobId: job.id,
    integrationId: job.data?.integrationId,
    state,
    progress: typeof job.progress === 'number' ? job.progress : 0,
    count: job.returnvalue?.count ?? null,
    failedReason: job.failedReason || null,
    attemptsMade: job.attemptsMade,
  };
}

module.exports = { syncQueue, enqueueSync, getJobStatus, QUEUE_NAME };
