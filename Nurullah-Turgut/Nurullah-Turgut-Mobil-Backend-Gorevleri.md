# Nurullah Turgut'un Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## Dashboard, Analitik ve Bildirim Sorumlusu (Analytics & Alerts)
Satış hızını, istatistikleri ve acil durum uyarılarını yönetir.

## 1. Özet İstatistik Görüntüleme Servisi
- **API Endpoint:** `GET /api/dashboard/stats`
- **Görev:** Dashboard ana sayfası için özet istatistikleri (BuyBox kazanma oranı, toplam takip edilen ürün) getirme.
- **İşlevler:**
  - Ana sayfa yüklendiğinde GET isteği atarak anlık özet veriyi çekme.
  - Alınan veriyi UI statelerine (grafikler vb.) bağlatma.

## 2. Kampanya Öneri Listesi Alma Servisi
- **API Endpoint:** `GET /api/analytics/suggestions`
- **Görev:** Satış hızına bağlı olarak algoritmanın ürettiği "Stok Eritme / Kampanya Önerileri" listesini getirme.
- **İşlevler:**
  - AI algoritmalarından dönen öneri modellerini JSON olarak parçalama ve liste olarak UI'a geçme.

## 3. Geçmiş Bildirimleri Listeleme Servisi
- **API Endpoint:** `GET /api/notifications`
- **Görev:** Kullanıcıya gelen geçmiş bildirimleri (Örn: "Rakip stok bitirdi", "Fiyat tabana ulaştı") listeleme.
- **İşlevler:**
  - Push notification'ların arka planda kaydedildiği listeyi API üzerinden sayfalı/sayfasız getirme.

## 4. Yeni Bildirim Kuralı Oluşturma Servisi
- **API Endpoint:** `POST /api/alerts/rules`
- **Görev:** Sistemde belirli durumlar için yeni bir alarm/bildirim kuralı oluşturma (Örn: Rakip fiyatı %10 düşerse uyar).
- **İşlevler:**
  - Condition (koşul) ve Trigger (tetikleyici) metin/değerlerini POST isteği olarak backend'e kaydetme.

## 5. Bildirim Okundu Olarak İşaretleme Servisi
- **API Endpoint:** `PUT /api/notifications/{notificationId}/read`
- **Görev:** Kullanıcının okuduğu bir bildirimin durumunu "Okundu" olarak güncelleme.
- **İşlevler:**
  - İlgili bildirime dokunulduğunda backend'e "Okundu" durumunu bildirme ve UI durumunu koyudan açığa alma.

## 6. Bildirim Silme Servisi
- **API Endpoint:** `DELETE /api/notifications/{notificationId}`
- **Görev:** Eski veya gereksiz bir bildirimi kullanıcı panelinden silme.
- **İşlevler:**
  - Kullanıcı bildirimi yana kaydırdığında veya sil tuşuna bastığında ilgili kimlik üzerinden silme işlemini yapma.
