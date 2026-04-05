import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ SUPABASE_URL veya SUPABASE_ANON_KEY .env dosyasında bulunamadı. Veritabanı sorguları hata verecektir.');
}

// 1. POST /competitors - Rakip Ürün Linki Ekleme
app.post('/competitors', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { productId, competitorUrl, sellerName } = req.body;
    
    if (!productId || !competitorUrl) {
      return res.status(400).json({ error: 'productId ve competitorUrl zorunludur' });
    }

    const { data, error } = await supabase
      .from('competitors')
      .insert({
        product_id: productId,
        competitor_url: competitorUrl,
        seller_name: sellerName || 'Bilinmeyen Satıcı',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /competitors/sync - Manuel Bot Çalıştırma
app.post('/competitors/sync', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    
    // Aktif rakipler
    const { data: competitors, error: fetchError } = await supabase
      .from('competitors')
      .select('*')
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    let syncCount = 0;
    for (const comp of competitors) {
      // Simülasyon: Fiyatı %1-3 arası rastgele değiştir
      const change = (Math.random() - 0.5) * 0.04;
      const currentPrice = Number(comp.last_price) || 1000;
      const newPrice = Math.round(currentPrice * (1 + change) * 100) / 100;

      await supabase
        .from('competitors')
        .update({ last_price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', comp.id);

      await supabase.from('price_history').insert({
        competitor_id: comp.id,
        price: newPrice,
      });
      syncCount++;
    }

    res.status(200).json({ message: 'Senkronizasyon tamamlandı', count: syncCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /products/:productId/competitors - Rakip Satıcılar Listesi
app.get('/products/:productId/competitors', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /competitors/:competitorId/history - Tarihsel Fiyat Logları
app.get('/competitors/:competitorId/history', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('competitor_id', competitorId)
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. PUT /competitors/:competitorId/status - Takip Durumu Güncelleme
app.put('/competitors/:competitorId/status', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;
    const { isActive } = req.body;

    const { data, error } = await supabase
      .from('competitors')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', competitorId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE /competitors/:competitorId - Rakip Takibini Silme
app.delete('/competitors/:competitorId', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { competitorId } = req.params;

    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', competitorId);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yardımcı endpoint: Tüm ürünleri listele
app.get('/products', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Veritabanı yapılandırılmadı' });
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sunucuyu başlat (Vercel Serverless Function Desteği ile)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Flend Rakip Takibi REST API port ${PORT} üzerinde çalışıyor.`);
  });
}

export default app;
