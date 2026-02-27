# Nurullah Turgut'un Web Frontend Görevleri

**Web Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## Dashboard, Analitik ve Bildirim Sorumlusu (Analytics & Alerts)

## 1. Analitik Dashboard Paneli
- **UI Görevi:** React/Vue gibi frameworklerde, ana sayfa özet istatistiklerini (BuyBox kazanma oranı, toplam takip edilen ürün sayısını) içeren geniş grid tabanlı paneli (Dashboard) tasarlama.
- **Bileşenler:**
  - Bar/Line Chart'lar
  - Kar zarar durumlarını belirten Widget'lar

## 2. Kampanya & Stok Eritme Listeleri
- **UI Görevi:** Algoritmanın ürettiği "Kampanya Önerileri" listesini tabloda veya esnek yan panelde (Sidebar / Drawer) getirme.
- **Bileşenler:**
  - Akıllı tahmin belirten renkli Tag/Badge bileşenleri (Örn: "Kritik", "Hızlı Üretim").
  - Liste içerisinde Hover etkileşimleri.

## 3. Bildirim Gelen Kutusu (Notification Inbox)
- **UI Görevi:** Navbar üzerinden Dropdown mantığıyla veya ayrı bir `/notifications` sayfasında, kullanıcının geçmiş bildirimlerini ("Rakip stok bitirdi") listeleme.
- **Bileşenler:**
  - Kırmızı nokta / Bubble notification counter
  - Bildirimin önceliğini belirten ufak Warning, Success ikonları.

## 4. Yeni Kural Oluşturma (Alert Criteria) Formu
- **UI Görevi:** Sistemde özel alarm / bildirim ("Rakip fiyatı %10 düşerse uyar") tasarlamak üzere kurgulanan modern form.
- **Bileşenler:**
  - Mantıksal Eğer/O zaman (If/Then) kural oluşturucu mimarisi gibi "If: Condition -> Then: Notify me" Dropdown seti.

## 5. Okundu İşaretleme Etkileşimi
- **UI Görevi:** Okunan bildirime tıklandığında soluklaşması.
- **Bileşenler:**
  - API'den OK cevabı gelmeden önce optimistic UI ile anında state değiştirme (kalından normale dönüş) tecrübesi.

## 6. Görev/Bildirim Silme Action'ı
- **UI Görevi:** Her bildirimin sağında bulunan çarpı (X) veya "Temizle" butonuyla bildirimi listeden uçurma olayı.
- **Bileşenler:**
  - Tek işlemde "Clear All" butonu entegrasyonu (opsiyonel)
  - Fade-out silinme animasyonu ile listeden eksiltme.
