# Nurullah Turgut'un REST API Metotları
**Yayınlanan REST API Domain Adresi:**  [https://nurullah-turgut-backendfinal.vercel.app/]
**API Test Videosu:** [https://www.youtube.com/watch?v=zDKLWXkrooA]

## Dashboard, Analitik ve Bildirim Sorumlusu (Analytics & Alerts)
Satış hızını, istatistikleri ve acil durum uyarılarını yönetir.

- **GET (Read):** `/api/dashboard/stats`
  - *İşlev:* Dashboard ana sayfası için özet istatistikleri (BuyBox kazanma oranı, toplam takip edilen ürün) getirme.
  
- **GET (Read):** `/api/analytics/suggestions`
  - *İşlev:* Satış hızına bağlı olarak algoritmanın ürettiği "Stok Eritme / Kampanya Önerileri" listesini getirme.
  
- **GET (Read):** `/api/notifications`
  - *İşlev:* Kullanıcıya gelen geçmiş bildirimleri (Örn: "Rakip stok bitirdi", "Fiyat tabana ulaştı") listeleme.
  
- **POST (Create):** `/api/alerts/rules`
  - *İşlev:* Sistemde belirli durumlar için yeni bir alarm/bildirim kuralı oluşturma (Örn: Rakip fiyatı %10 düşerse uyar). Request body'sinde condition ve target barındırır.
  Request Body Bilgileri:

JSON
{
  "rule_name": "iPhone 15 Fiyat Takibi",
  "condition_type": "fiyat_degisimi",
  "threshold_value": 10,
  "threshold_unit": "%"
}

  
- **PUT (Update):** `/api/notifications/{notificationId}/read`
  - *İşlev:* Kullanıcının okuduğu bir bildirimin durumunu "Okundu" (isRead: true) olarak güncelleme.
  Request Body Bilgileri:

JSON
{
  "is_read": true
}
  
- **DELETE (Delete):** `/api/notifications/{notificationId}`
  - *İşlev:* Eski veya gereksiz bir bildirimi kullanıcı panelinden silme.
