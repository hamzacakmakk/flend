// ==========================================================================
// infra/rabbitmq.js — RabbitMQ producer (graceful-degradation)
//
// Bağlanamazsa sendSyncJob false döner; controller senkron fallback'e geçer.
// (M-Hamza-Cakmak/api/index.js producer deseninden.)
// ==========================================================================
import amqplib from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export const SYNC_QUEUE = process.env.RABBITMQ_SYNC_QUEUE || 'sync_jobs';

let channel = null;

export async function initRabbit() {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(SYNC_QUEUE, { durable: true });
    conn.on('error', () => { channel = null; });
    conn.on('close', () => { channel = null; });
    console.log(`✅ RabbitMQ bağlantısı kuruldu — Queue: "${SYNC_QUEUE}"`);
  } catch (err) {
    console.warn('⚠️  RabbitMQ bağlanamadı — async sync devre dışı:', err.message);
    channel = null;
  }
}

export function isRabbitReady() {
  return !!channel;
}

// Sync işini kuyruğa bırakır. Başarılıysa true.
export function sendSyncJob(payload) {
  if (!channel) return false;
  try {
    channel.sendToQueue(SYNC_QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`📨 Sync job kuyruğa eklendi: ${JSON.stringify(payload)}`);
    return true;
  } catch (err) {
    console.warn('RabbitMQ gönderim hatası:', err.message);
    return false;
  }
}
