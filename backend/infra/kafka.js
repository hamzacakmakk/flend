// ==========================================================================
// infra/kafka.js — Kafka producer (graceful-degradation)
//
// Worker tarafından kullanılır: her fiyat güncellemesinde "price_updated"
// topic'ine event publish eder. Kafka yoksa publish sessizce atlanır.
// (M-Hamza-Cakmak/api/worker.js producer deseninden.)
// ==========================================================================
import { Kafka } from 'kafkajs';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'flend-worker';
export const PRICE_TOPIC = process.env.KAFKA_PRICE_TOPIC || 'price_updated';

const kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: [KAFKA_BROKER], retry: { retries: 5 } });
const producer = kafka.producer();
let ready = false;

export async function initKafkaProducer() {
  try {
    await producer.connect();
    ready = true;
    console.log(`✅ [Kafka] Producer bağlandı — Broker: ${KAFKA_BROKER}`);
  } catch (err) {
    console.warn('⚠️  [Kafka] Producer bağlanamadı — event publishing devre dışı:', err.message);
    ready = false;
  }
}

export function isKafkaReady() {
  return ready;
}

export async function disconnectKafka() {
  if (ready) await producer.disconnect().catch(() => {});
}

export async function publishPriceEvent(competitorId, productId, oldPrice, newPrice) {
  if (!ready) return;
  try {
    await producer.send({
      topic: PRICE_TOPIC,
      messages: [
        {
          key: competitorId,
          value: JSON.stringify({
            competitorId,
            productId,
            oldPrice,
            newPrice,
            change: +(newPrice - oldPrice).toFixed(2),
            changePercent: +(((newPrice - oldPrice) / oldPrice) * 100).toFixed(2),
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`📤 [Kafka] price_updated → ${competitorId} | ${oldPrice} → ${newPrice} ₺`);
  } catch (err) {
    console.warn('[Kafka] publish hatası:', err.message);
  }
}
