// ============================================
// Driver: BullMQ (Redis tabanlı) — "Redis + Celery" deseninin Node karşılığı
// ============================================
//
// Mevcut, test edilmiş BullMQ mantığını olduğu gibi kullanır.
// (syncQueue.js = producer + durum, syncWorker.js = consumer)

const { enqueueSync, getJobStatus } = require('../syncQueue');
const { startSyncWorker } = require('../syncWorker');

module.exports = { name: 'bullmq', enqueueSync, getJobStatus, startSyncWorker };
