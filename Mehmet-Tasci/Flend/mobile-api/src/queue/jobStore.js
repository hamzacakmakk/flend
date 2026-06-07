// ============================================
// İş durum deposu (RabbitMQ / Kafka driver'ları için)
// ============================================
//
// RabbitMQ ve Kafka sadece MESAJI taşır; işin durumunu (queued/active/
// completed/failed + ilerleme) takip etmezler. Bu yüzden durumu Redis'te
// tutarız. Böylece mobil uygulama /sync/jobs/:jobId ile sorgulayabilir.
//
// (BullMQ kendi durumunu Redis'te zaten tuttuğu için onun driver'ı bunu
//  kullanmaz; bu depo RabbitMQ ve Kafka driver'larında devreye girer.)

const crypto = require('crypto');
const { createRedisConnection } = require('./connection');

const redis = createRedisConnection();
const KEY = (jobId) => `sync:jobstatus:${jobId}`;
const TTL = 60 * 60 * 24; // 1 gün

async function createJob(integrationId) {
  const jobId = crypto.randomUUID();
  const rec = {
    jobId,
    integrationId,
    state: 'queued',
    progress: 0,
    count: null,
    failedReason: null,
    createdAt: new Date().toISOString(),
  };
  await redis.set(KEY(jobId), JSON.stringify(rec), 'EX', TTL);
  return jobId;
}

async function updateJob(jobId, patch) {
  const raw = await redis.get(KEY(jobId));
  if (!raw) return null;
  const rec = { ...JSON.parse(raw), ...patch, updatedAt: new Date().toISOString() };
  await redis.set(KEY(jobId), JSON.stringify(rec), 'EX', TTL);
  return rec;
}

async function getJob(jobId) {
  const raw = await redis.get(KEY(jobId));
  return raw ? JSON.parse(raw) : null;
}

module.exports = { createJob, updateJob, getJob };
