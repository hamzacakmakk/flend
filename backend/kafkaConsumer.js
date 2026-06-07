// ==========================================================================
// kafkaConsumer.js — Kafka Consumer (Demo Logger)
//
// Çalıştırma: npm run kafka-consumer
//   "price_updated" topic'ini dinler, gelen fiyat değişim event'lerini
//   okunabilir bir tablo olarak loglar → demo'da Kafka akışını görselleştirir.
// ==========================================================================
import 'dotenv/config';
import { Kafka } from 'kafkajs';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const KAFKA_PRICE_TOPIC = process.env.KAFKA_PRICE_TOPIC || 'price_updated';

const kafka = new Kafka({
  clientId: 'flend-consumer',
  brokers: [KAFKA_BROKER],
  retry: { retries: 10, initialRetryTime: 2000 },
});

const consumer = kafka.consumer({ groupId: 'flend-price-monitor' });

function priceArrow(change) {
  if (change > 0) return '🔺';
  if (change < 0) return '🔻';
  return '➡️ ';
}

async function startConsumer() {
  console.log('⏳ [KafkaConsumer] Kafka broker bekleniyor...');
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await consumer.connect();
      break;
    } catch (err) {
      console.warn(`   Deneme ${attempt}/10: ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  await consumer.subscribe({ topic: KAFKA_PRICE_TOPIC, fromBeginning: false });

  console.log(`\n✅ [KafkaConsumer] "${KAFKA_PRICE_TOPIC}" topic'i dinleniyor...`);
  console.log('━'.repeat(70));
  console.log('  Zaman              │ CompetitorId             │ Değişim   │ Fiyat');
  console.log('━'.repeat(70));

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        const time = new Date(event.timestamp).toLocaleTimeString('tr-TR');
        const shortId = event.competitorId.substring(0, 8) + '...';
        const arrow = priceArrow(event.change);
        const changeStr = (event.change >= 0 ? '+' : '') + event.change.toFixed(2);
        const changePerc = (event.changePercent >= 0 ? '+' : '') + event.changePercent.toFixed(2) + '%';
        const newPriceStr = event.newPrice.toFixed(2) + ' ₺';
        console.log(
          `  ${time.padEnd(18)} │ ${shortId.padEnd(24)} │ ${arrow} ${changeStr.padStart(7)} (${changePerc.padStart(7)}) │ ${newPriceStr}`
        );
      } catch (err) {
        console.warn('[KafkaConsumer] Mesaj parse hatası:', err.message);
      }
    },
  });
}

async function shutdown() {
  console.log('\n🛑 [KafkaConsumer] Kapatılıyor...');
  await consumer.disconnect().catch(() => {});
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startConsumer().catch((err) => {
  console.error('❌ [KafkaConsumer] Başlatılamadı:', err.message);
  process.exit(1);
});
