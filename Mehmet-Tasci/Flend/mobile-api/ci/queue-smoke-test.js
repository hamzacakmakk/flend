// ============================================
// CI Kuyruk Smoke Testi
// ============================================
// Amaç: RabbitMQ ve Redis'in gerçekten çalıştığını ve mesaj alışverişinin
// uçtan uca olduğunu CI ortamında (harici Supabase'e gerek olmadan) kanıtlamak.
//
//   1) RabbitMQ'ya bağlan, kuyruğa mesaj yaz (producer)
//   2) Aynı mesajı tüket (consumer) ve içeriğini doğrula
//   3) Redis'e yaz/oku (iş durumu deposu çalışıyor mu?)
//
// Başarısızlıkta process exit(1) -> CI kırmızı olur.

const amqp = require('amqplib');
const Redis = require('ioredis');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@127.0.0.1:5672';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const QUEUE = 'ci-smoke-' + Date.now();

function fail(msg, err) {
  console.error('❌ ' + msg + (err ? ': ' + err.message : ''));
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // ---- 1) RabbitMQ round-trip ----
  let conn, ch;
  try {
    conn = await amqp.connect(RABBITMQ_URL);
    ch = await conn.createChannel();
    await ch.assertQueue(QUEUE, { durable: false, autoDelete: true });
  } catch (e) {
    fail('RabbitMQ bağlantısı kurulamadı', e);
  }
  console.log('✅ RabbitMQ bağlantısı kuruldu');

  const payload = { jobId: 'ci-test', integrationId: 'abc-123', ts: Date.now() };
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)));
  console.log('✅ Mesaj kuyruğa yazıldı (producer)');

  let received = null;
  await ch.consume(
    QUEUE,
    (msg) => {
      if (msg) {
        received = JSON.parse(msg.content.toString());
        ch.ack(msg);
      }
    },
    { noAck: false }
  );

  // Mesajın tüketilmesini bekle
  for (let i = 0; i < 50 && !received; i++) await sleep(100);

  if (!received) fail('Mesaj tüketilemedi (consumer çalışmadı)');
  if (received.integrationId !== payload.integrationId) {
    fail('Tüketilen mesaj içeriği eşleşmedi');
  }
  console.log('✅ Mesaj tüketildi ve doğrulandı (consumer): job=' + received.jobId);

  await ch.close();
  await conn.close();

  // ---- 2) Redis yaz/oku ----
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
  try {
    await redis.connect();
    const key = 'ci:smoke:' + Date.now();
    await redis.set(key, 'ok', 'EX', 30);
    const val = await redis.get(key);
    if (val !== 'ok') fail('Redis okuma değeri beklenenle eşleşmedi');
    await redis.del(key);
    await redis.quit();
  } catch (e) {
    fail('Redis testi başarısız', e);
  }
  console.log('✅ Redis yaz/oku başarılı');

  console.log('\n🎉 Kuyruk smoke testi GEÇTİ — RabbitMQ + Redis uçtan uca çalışıyor.');
  process.exit(0);
})().catch((e) => fail('Beklenmeyen hata', e));
