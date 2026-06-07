/**
 * worker.js — RabbitMQ Consumer + Kafka Producer
 *
 * Çalıştırma: npm run worker  veya  node worker.js
 *
 * Görev:
 *  1. RabbitMQ "sync_jobs" queue'yu dinler.
 *  2. Mesaj gelince aktif rakiplerin fiyatlarını Supabase'den çeker ve günceller.
 *  3. Her fiyat güncellemesi için Kafka "price_updated" topic'ine event publish eder.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import amqplib from 'amqplib';
import { Kafka } from 'kafkajs';

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_ANON_KEY.trim()
);
console.log('✅ [Worker] Supabase bağlandı');

// ─── Kafka Producer ──────────────────────────────────────────────────────────
const KAFKA_BROKER      = process.env.KAFKA_BROKER  || 'localhost:9092';
const KAFKA_CLIENT_ID   = process.env.KAFKA_CLIENT_ID || 'flend-worker';
const KAFKA_PRICE_TOPIC = process.env.KAFKA_PRICE_TOPIC || 'price_updated';

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKER],
  retry: { retries: 5 },
});

const producer = kafka.producer();
let kafkaReady = false;

try {
  await producer.connect();
  kafkaReady = true;
  console.log(`✅ [Worker] Kafka Producer bağlandı — Broker: ${KAFKA_BROKER}`);
} catch (err) {
  console.warn('⚠️  [Worker] Kafka bağlanamadı — event publishing devre dışı:', err.message);
}

// Kafka'ya event publish et
async function publishPriceEvent(competitorId, productId, oldPrice, newPrice) {
  if (!kafkaReady) return;
  try {
    await producer.send({
      topic: KAFKA_PRICE_TOPIC,
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
    console.log(
      `📤 [Kafka] price_updated → competitorId: ${competitorId} | ${oldPrice} → ${newPrice} ₺`
    );
  } catch (err) {
    console.warn('[Kafka] publish hatası:', err.message);
  }
}

// ─── Sync İş Mantığı ─────────────────────────────────────────────────────────
async function processSyncJob(jobPayload) {
  console.log('\n🔄 [Worker] Sync job başladı:', jobPayload);

  const { data: competitors, error: fetchError } = await supabase
    .from('competitors')
    .select('*')
    .eq('is_active', true);

  if (fetchError) throw new Error(`Supabase fetch hatası: ${fetchError.message}`);

  console.log(`   ${competitors.length} aktif rakip bulundu`);

  let syncCount = 0;

  for (const comp of competitors) {
    const oldPrice    = Number(comp.last_price) || 1000;
    const change      = (Math.random() - 0.5) * 0.04; // ±2% rastgele değişim
    const newPrice    = Math.round(oldPrice * (1 + change) * 100) / 100;

    // Supabase güncelle
    const { error: updateError } = await supabase
      .from('competitors')
      .update({ last_price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', comp.id);

    if (updateError) {
      console.error(`   ❌ competitor ${comp.id} güncellenemedi:`, updateError.message);
      continue;
    }

    // Price history kaydet
    await supabase.from('price_history').insert({
      competitor_id: comp.id,
      price: newPrice,
    });

    // Kafka'ya event publish et
    await publishPriceEvent(comp.id, comp.product_id, oldPrice, newPrice);

    console.log(`   ✅ [${++syncCount}/${competitors.length}] ${comp.seller_name}: ${oldPrice} → ${newPrice} ₺`);
  }

  console.log(`✅ [Worker] Sync job tamamlandı — ${syncCount} rakip güncellendi\n`);
  return syncCount;
}

// ─── RabbitMQ Consumer ───────────────────────────────────────────────────────
const RABBITMQ_URL        = process.env.RABBITMQ_URL || 'amqp://localhost';
const RABBITMQ_SYNC_QUEUE = process.env.RABBITMQ_SYNC_QUEUE || 'sync_jobs';

async function startWorker() {
  let conn;
  // Bağlantı retry döngüsü (Kafka gibi servisler geç başlayabilir)
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      conn = await amqplib.connect(RABBITMQ_URL);
      break;
    } catch (err) {
      console.warn(`⏳ [Worker] RabbitMQ bekleniyor (${attempt}/10)...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!conn) {
    console.error('❌ [Worker] RabbitMQ bağlantısı kurulamadı. Çıkılıyor.');
    process.exit(1);
  }

  const channel = await conn.createChannel();
  await channel.assertQueue(RABBITMQ_SYNC_QUEUE, { durable: true });
  channel.prefetch(1); // Aynı anda yalnızca 1 job işle

  console.log(`✅ [Worker] RabbitMQ Consumer başlatıldı — Queue: "${RABBITMQ_SYNC_QUEUE}"`);
  console.log('⏳ [Worker] Sync job bekleniyor...\n');

  channel.consume(RABBITMQ_SYNC_QUEUE, async (msg) => {
    if (!msg) return;

    let jobPayload;
    try {
      jobPayload = JSON.parse(msg.content.toString());
    } catch {
      jobPayload = { raw: msg.content.toString() };
    }

    try {
      await processSyncJob(jobPayload);
      channel.ack(msg); // Başarılı → mesajı queue'dan kaldır
    } catch (err) {
      console.error('❌ [Worker] Job işlenirken hata:', err.message);
      channel.nack(msg, false, false); // Başarısız → yeniden kuyruğa koyma (dead-letter)
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 [Worker] Kapatılıyor...');
    await channel.close();
    await conn.close();
    if (kafkaReady) await producer.disconnect();
    process.exit(0);
  });
}

startWorker().catch((err) => {
  console.error('❌ [Worker] Başlatılamadı:', err);
  process.exit(1);
});
