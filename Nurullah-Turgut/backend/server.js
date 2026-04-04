const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const dashboardRoutes = require('./routes/dashboardRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (geliştirme amaçlı) ────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Satıcı Paneli API çalışıyor.',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route bulunamadı: ${req.method} ${req.url}`,
  });
});

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Sunucu hatası oluştu.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   🚀 Satıcı Paneli API Sunucusu Çalışıyor   ║');
  console.log(`║   📡 Port: ${PORT}                              ║`);
  console.log(`║   🔗 http://localhost:${PORT}                    ║`);
  console.log('╠═══════════════════════════════════════════════╣');
  console.log('║   Endpoints:                                  ║');
  console.log('║   GET  /api/dashboard/stats                   ║');
  console.log('║   GET  /api/campaigns/suggestions             ║');
  console.log('║   GET  /api/notifications                     ║');
  console.log('║   POST /api/alerts/rules                      ║');
  console.log('║   PUT  /api/notifications/:id/read            ║');
  console.log('║   DELETE /api/notifications/:id               ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
});
