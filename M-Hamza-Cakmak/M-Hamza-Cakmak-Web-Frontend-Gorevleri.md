# Muhammed Hamza Çakmak'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Link buraya eklenecek]

## 1. Rakip Ekleme Modal / Form Alanı
- **API Endpoint:** `POST /competitors`
- **Görev:** Envanterdeki kendi ürününe rakip linkini SelectBox üzerinden bağlayan arayüz.

## 2. Global "Botu Çalıştır" Tetikleme Butonu
- **API Endpoint:** `POST /competitors/sync`
- **Görev:** Navbarda veya ürün sayfasında bulunan, basınca fiyatların acil güncellenmesini sağlayan spinner'lı buton kontrolü.

## 3. Rakip Analiz Tablosu (Data Table)
- **API Endpoint:** `GET /products/{productId}/competitors`
- **Görev:** Rakip adları, güncel fiyatlar ve "Bizden Ucuz/Pahalı" renkli badge'lerini içeren, sıralanabilir tablo bileşeni.

## 4. Analitik: Geçmiş Fiyat Grafiği Yüzeyi
- **API Endpoint:** `GET /competitors/{competitorId}/history`
- **Görev:** Recharts/Chart.js kullanarak X ekseninde tarih, Y ekseninde TL fiyatını gösteren çizgi grafik tasarımı.

## 5. Takip Switch ve Silme Aksiyonları
- **API Endpoints:** `PUT /competitors/{competitorId}/status`, `DELETE /competitors/{competitorId}`
- **Görev:** Tabloda Aktif/Pasif toggle'ı tasarlamak ve "Kaldır" (Delete) butonuna basılınca güvenli onay modalı sunmak.
