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
let connecting = false;

// RabbitMQ'ya bağlanmayı dener; başarısızsa arka planda tekrar dener.
// Böylece API, RabbitMQ'dan önce başlasa bile (startup race) hazır olunca
// kendiliğinden bağlanır ve kalıcı senkron-fallback'e takılı kalmaz.
export async function initRabbit() {
  if (connecting) return;
  connecting = true;
  try {
    const conn = await amqplib.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(SYNC_QUEUE, { durable: true });
    // Bağlantı kopar/hata verirse kanalı sıfırla ve yeniden bağlanmayı tetikle.
    conn.on('error', () => { channel = null; });
    conn.on('close', () => {
      channel = null;
      console.warn('⚠️  RabbitMQ bağlantısı kapandı — yeniden bağlanılacak');
      scheduleReconnect();
    });
    console.log(`✅ RabbitMQ bağlantısı kuruldu — Queue: "${SYNC_QUEUE}"`);
  } catch (err) {
    channel = null;
    console.warn('⚠️  RabbitMQ bağlanamadı, 5sn sonra tekrar denenecek:', err.message);
    connecting = false;
    scheduleReconnect();
    return;
  }
  connecting = false;
}

function scheduleReconnect() {
  if (connecting || channel) return;
  setTimeout(() => { initRabbit(); }, 5000).unref?.();
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
