// ============================================
// Bağımsız worker süreci
// ============================================
//
// Üretim benzeri kurulum: API ile worker AYRI process olarak çalışır.
//   Terminal 1:  npm run dev      (API - producer)
//   Terminal 2:  npm run worker   (worker - consumer)
//
// .env içinde INLINE_WORKER=false yapıp bunu kullanın. Hızlı demo için
// INLINE_WORKER=true bırakıp tek terminalde (npm run dev) çalıştırabilirsiniz.

require('dotenv').config();
const { startSyncWorker, DRIVER } = require('./src/queue');

console.log(`🔧 Flend sync worker başlatılıyor... (driver: ${DRIVER})`);
startSyncWorker();
