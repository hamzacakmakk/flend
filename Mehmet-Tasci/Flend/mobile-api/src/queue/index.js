// ============================================
// Kuyruk facade — QUEUE_DRIVER'a göre driver seçer
// ============================================
//
//   QUEUE_DRIVER=bullmq    -> Redis + BullMQ  (varsayılan, "Redis+Celery" deseni)
//   QUEUE_DRIVER=rabbitmq  -> RabbitMQ (amqplib)
//   QUEUE_DRIVER=kafka     -> Kafka (kafkajs)
//
// Üç driver da AYNI arayüzü sunar: enqueueSync, getJobStatus, startSyncWorker.
// Böylece controller/app.js tek bir yerden kullanır, broker değişse de kod aynı kalır.

const driverName = (process.env.QUEUE_DRIVER || 'bullmq').toLowerCase();

let driver;
switch (driverName) {
  case 'rabbitmq':
    driver = require('./drivers/rabbitmq');
    break;
  case 'kafka':
    driver = require('./drivers/kafka');
    break;
  case 'bullmq':
  case 'redis':
  default:
    driver = require('./drivers/bullmq');
    break;
}

console.log(`🧩 Kuyruk driver'ı: ${driver.name}`);

// drainQueue: serverless/cron "pull" tüketici. Sadece bunu destekleyen
// driver'larda (rabbitmq) gerçek iş yapar; diğerlerinde güvenli stub döner.
const drainQueue =
  driver.drainQueue ||
  (async () => ({ processed: 0, note: `'${driver.name}' driver'ı drain desteklemiyor` }));

module.exports = {
  DRIVER: driver.name,
  enqueueSync: driver.enqueueSync,
  getJobStatus: driver.getJobStatus,
  startSyncWorker: driver.startSyncWorker,
  drainQueue,
};
