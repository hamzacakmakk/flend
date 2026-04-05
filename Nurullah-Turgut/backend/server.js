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
const allowedOrigins = [
  'https://nurullah-turgut-frontend.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} izin verilmedi.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', campaignRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);

// ─── Temel Yollar (Health & Home) ──────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API aktif' });
});

app.get('/', (req, res) => {
  res.send('Satıcı Paneli Backend Sunucusu Aktif!');
});

// ─── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Geçersiz İstek: ${req.method} ${req.url}`,
    message: "Aradığınız endpoint sunucuda tanımlı değil."
  });
});

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Sunucu hatası!' });
});

// ─── Start Server ───────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} üzerinde çalışıyor`);
  });
}

module.exports = app;