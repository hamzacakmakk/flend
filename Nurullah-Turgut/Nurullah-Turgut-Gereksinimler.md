# Nurullah Turgut'un Gereksinimleri (Dashboard, Analitik ve Bildirim Sorumlusu)

## Dashboard, Analitik ve Bildirim Sorumlusu (Analytics & Alerts)
Satış hızını, istatistikleri ve acil durum uyarılarını yönetir.

1. **Özet İstatistik Görüntüleme**
   - **Türü:** GET (Read)
   - **Açıklama:** Dashboard ana sayfası için özet istatistikleri (BuyBox kazanma oranı, toplam takip edilen ürün) getirme.

2. **Kampanya Şablonu/Öneri Listesi Alma**
   - **Türü:** GET (Read)
   - **Açıklama:** Satış hızına bağlı olarak algoritmanın ürettiği "Stok Eritme / Kampanya Önerileri" listesini getirme.

3. **Geçmiş Bildirimleri Listeleme**
   - **Türü:** GET (Read)
   - **Açıklama:** Kullanıcıya gelen geçmiş bildirimleri (Örn: "Rakip stok bitirdi", "Fiyat tabana ulaştı") listeleme.

4. **Yeni Alarm/Bildirim Kuralı Oluşturma**
   - **Türü:** POST (Create)
   - **Açıklama:** Sistemde belirli durumlar için yeni bir alarm/bildirim kuralı oluşturma (Örn: Rakip fiyatı %10 düşerse uyar).

5. **Bildirim Okundu İşaretleme**
   - **Türü:** PUT (Update)
   - **Açıklama:** Kullanıcının okuduğu bir bildirimin durumunu "Okundu" olarak güncelleme.

6. **Bildirim Silme**
   - **Türü:** DELETE (Delete)
   - **Açıklama:** Eski veya gereksiz bir bildirimi kullanıcı panelinden silme.
