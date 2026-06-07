// ============================================
// Flend Mobil Backend - Express uygulaması
// Mehmet Taşcı - Pazaryeri Entegrasyonu & Envanter Yönetimi
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');
const integrationRoutes = require('./routes/integrationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Sağlık kontrolü (kimlik doğrulama gerektirmez)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Flend Mobil Backend çalışıyor',
    timestamp: new Date().toISOString(),
  });
});

// Kuyruk drain ucu (Vercel Cron tetikler) — sürekli açık worker tutamayan
// serverless ortamda kuyruğu periyodik boşaltır. CRON_SECRET ile korunur.
// Vercel Cron, CRON_SECRET tanımlıysa "Authorization: Bearer <secret>" gönderir.
app.get('/api/queue/drain', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ success: false, message: 'Yetkisiz' });
    }
  }
  try {
    const { drainQueue, DRIVER } = require('./queue');
    const result = await drainQueue({
      maxMessages: Number(process.env.DRAIN_MAX_MESSAGES) || 10,
      maxMillis: Number(process.env.DRAIN_MAX_MILLIS) || 25000,
    });
    res.json({ success: true, driver: DRIVER, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Korumalı rotalar - mobil istemci Bearer token gönderir
app.use('/api/integrations', requireAuth, integrationRoutes);
app.use('/api/inventory', requireAuth, inventoryRoutes);

// Bilinmeyen rota
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı' });
});

app.use(errorHandler);

// Vercel (serverless) dışındaki her ortamda HTTP sunucusunu başlat.
// Docker/üretim sunucusu gerçek bir process olduğu için burada dinlemesi gerekir;
// Vercel ise modülü serverless function olarak sarmaladığından app.listen çağrılmaz.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Flend Mobil Backend ${PORT} portunda çalışıyor`);
  });

  // Hızlı demo için worker'ı API ile aynı process'te başlat.
  // Üretim benzeri kurulumda INLINE_WORKER=false yapıp ayrı "npm run worker" çalıştırın.
  const inlineWorker = (process.env.INLINE_WORKER || 'true').toLowerCase() !== 'false';
  if (inlineWorker) {
    try {
      require('./queue').startSyncWorker();
    } catch (err) {
      console.error('⚠️  Sync worker başlatılamadı (broker çalışıyor mu?):', err.message);
    }
  }
}

module.exports = app;
