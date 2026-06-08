// ==========================================================================
// worker.js — RabbitMQ Consumer + Kafka Producer
//
// Çalıştırma: npm run worker
//   1. "sync_jobs" kuyruğunu dinler.
//   2. Mesaj gelince aktif rakiplerin fiyatlarını (±%2) günceller, price_history yazar.
//   3. Her güncelleme için Kafka "price_updated" topic'ine event publish eder.
// (M-Hamza-Cakmak/api/worker.js'ten — Supabase yerine pg.)
// ==========================================================================
import 'dotenv/config';
import amqplib from 'amqplib';
import { query } from './db/pool.js';
import { initKafkaProducer, publishPriceEvent, disconnectKafka, isKafkaReady } from './infra/kafka.js';
import { runIntegrationSync } from './controllers/integrationController.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const SYNC_QUEUE = process.env.RABBITMQ_SYNC_QUEUE || 'sync_jobs';

await initKafkaProducer();

// ── Sync iş mantığı ──────────────────────────────────────────────────────
async function processSyncJob(jobPayload) {
  // Pazaryeri eklendiğinde bırakılan ürün-senkron işi
  if (jobPayload?.type === 'integration_sync') {
    console.log(`\n📦 [Worker] Entegrasyon ürün senkronu başladı: ${jobPayload.marketplace || jobPayload.integrationId}`);
    const { count, source } = await runIntegrationSync(jobPayload.userId, jobPayload.integrationId);
    console.log(`✅ [Worker] ${count} ürün senkronlandı (kaynak: ${source})\n`);
    return count;
  }

  // Nurullah #28: Alarm kuralı oluşturulunca değerlendirme + bildirim üretimi
  if (jobPayload?.type === 'alert_check') {
    return processAlertCheck(jobPayload);
  }

  // Varsayılan: rakip fiyat senkronu (eski davranış)
  console.log('\n🔄 [Worker] Sync job başladı:', jobPayload);

  const { rows: competitors } = await query('SELECT * FROM competitors WHERE is_active = true');
  console.log(`   ${competitors.length} aktif rakip bulundu`);

  let syncCount = 0;
  for (const comp of competitors) {
    const oldPrice = Number(comp.last_price) || 1000;
    const change = (Math.random() - 0.5) * 0.04; // ±%2 rastgele
    const newPrice = Math.round(oldPrice * (1 + change) * 100) / 100;

    try {
      await query('UPDATE competitors SET last_price = $1, updated_at = now() WHERE id = $2', [newPrice, comp.id]);
      await query('INSERT INTO price_history (competitor_id, price) VALUES ($1, $2)', [comp.id, newPrice]);
      await publishPriceEvent(comp.id, comp.product_id, oldPrice, newPrice);
      console.log(`   ✅ [${++syncCount}/${competitors.length}] ${comp.seller_name}: ${oldPrice} → ${newPrice} ₺`);
    } catch (e) {
      console.error(`   ❌ competitor ${comp.id} güncellenemedi:`, e.message);
    }
  }
  console.log(`✅ [Worker] Sync job tamamlandı — ${syncCount} rakip güncellendi\n`);
  return syncCount;
}

// ── Alarm kuralı değerlendirme (Nurullah #28) ────────────────────────────
async function processAlertCheck({ ruleId, userId }) {
  console.log(`\n🔔 [Worker] Alarm kuralı değerlendiriliyor: ${ruleId}`);
  const { rows } = await query(
    'SELECT * FROM alert_rules WHERE id = $1 AND user_id = $2',
    [ruleId, userId]
  );
  const rule = rows[0];
  if (!rule) {
    console.warn(`   ⚠️ Kural bulunamadı: ${ruleId}`);
    return 0;
  }

  let title, message, type;
  if (rule.condition_type === 'stok_azalmasi') {
    // Eşiğin altında stoğu olan aktif ürünleri say
    const { rows: r } = await query(
      'SELECT count(*)::int AS n FROM products WHERE user_id = $1 AND is_active = true AND stock_quantity < $2::numeric',
      [userId, rule.threshold_value]
    );
    const n = r[0].n;
    title = 'Stok Azalması Uyarısı';
    message = `"${rule.rule_name}" kuralı: stoğu ${rule.threshold_value} altında ${n} ürün bulundu.`;
    type = n > 0 ? 'warning' : 'success';
  } else {
    title = 'Alarm Kuralı Aktif';
    message = `"${rule.rule_name}" kuralı oluşturuldu (${rule.condition_type}, eşik ${rule.threshold_value}${rule.threshold_unit === 'percent' ? '%' : ''}) ve izlemeye alındı.`;
    type = 'info';
  }

  await query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
    [userId, title, message, type]
  );
  console.log(`   ✅ Bildirim üretildi: ${title}\n`);
  return 1;
}

// ── RabbitMQ Consumer (retry'li) ─────────────────────────────────────────
async function startWorker() {
  let conn;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      conn = await amqplib.connect(RABBITMQ_URL);
      break;
    } catch {
      console.warn(`⏳ [Worker] RabbitMQ bekleniyor (${attempt}/10)...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  if (!conn) {
    console.error('❌ [Worker] RabbitMQ bağlantısı kurulamadı. Çıkılıyor.');
    process.exit(1);
  }

  const channel = await conn.createChannel();
  await channel.assertQueue(SYNC_QUEUE, { durable: true });
  channel.prefetch(1);

  console.log(`✅ [Worker] RabbitMQ Consumer başlatıldı — Queue: "${SYNC_QUEUE}"`);
  console.log('⏳ [Worker] Sync job bekleniyor...\n');

  channel.consume(SYNC_QUEUE, async (msg) => {
    if (!msg) return;
    let jobPayload;
    try {
      jobPayload = JSON.parse(msg.content.toString());
    } catch {
      jobPayload = { raw: msg.content.toString() };
    }
    try {
      await processSyncJob(jobPayload);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ [Worker] Job işlenirken hata:', err.message);
      channel.nack(msg, false, false);
    }
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 [Worker] Kapatılıyor...');
    await channel.close().catch(() => {});
    await conn.close().catch(() => {});
    if (isKafkaReady()) await disconnectKafka();
    process.exit(0);
  });
}

startWorker().catch((err) => {
  console.error('❌ [Worker] Başlatılamadı:', err);
  process.exit(1);
});
