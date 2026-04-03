// ============================================
// Express Application Entry Point
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const integrationRoutes = require('./routes/integrationRoutes');
const productRoutes = require('./routes/productRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/products', productRoutes);



// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Flend API çalışıyor',
    timestamp: new Date().toISOString(),
    mode: 'supabase',
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Flend API sunucusu ${PORT} portunda çalışıyor`);
  console.log(`📦 Mod: Supabase`);
});
