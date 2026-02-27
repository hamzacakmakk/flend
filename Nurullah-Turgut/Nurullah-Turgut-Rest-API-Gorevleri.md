# Nurullah Turgut'un REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

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
  
- **PUT (Update):** `/api/notifications/{notificationId}/read`
  - *İşlev:* Kullanıcının okuduğu bir bildirimin durumunu "Okundu" (isRead: true) olarak güncelleme.
  
- **DELETE (Delete):** `/api/notifications/{notificationId}`
  - *İşlev:* Eski veya gereksiz bir bildirimi kullanıcı panelinden silme.
