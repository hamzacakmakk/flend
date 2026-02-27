# Nurullah Turgut'un Mobil Frontend Görevleri

**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## Dashboard, Analitik ve Bildirim Sorumlusu (Analytics & Alerts)

## 1. Ana Sayfa (Dashboard) Ekranı
- **UI Görevi:** Dashboard ana sayfası için özet istatistiklerin (BuyBox kazanma oranı, toplam takip edilen ürün) modern kart görünümleriyle oluşturulması.
- **Bileşenler:**
  - Skorları vurgulayan Card tasarımları
  - İlerleme grafikleri (Pie/Doughnut charts) özelliği.

## 2. Algoritmik Kampanya Önerileri Ekranı
- **UI Görevi:** Analitik algoritmalardan "Stok Eritme / Kampanya Önerileri" liste ekranını tasarlama.
- **Bileşenler:**
  - Scrollable list item'lar
  - "Uygula" aksiyon butonları ile kısa ürün resmi, ismi ve öneri metni (Badge) içeren kartlar.

## 3. Bildirim Merkezi Ekranı
- **UI Görevi:** Geçmiş bildirimleri (Rakip stok bitirdi, Fiyat tabana ulaştı) liste olarak sunan Notification Activity/Fragment'ı oluşturma.
- **Bileşenler:**
  - Okunan bildirimlerin açık renk, okunmayanların kalın renk/yazı tipinde (Bold) olduğu Lazy Column.
  - Bildirim ikonu ve üzerinde badge göstergeleri.

## 4. Kural / Alarm Ekleme Modal'ı
- **UI Görevi:** Belirli durumlar için ("Rakip fiyatı %10 düşerse uyar") alarm oluşturma formunu tasarlama.
- **Bileşenler:**
  - Tetiklenecek olayı belirlemek için SelectBox / Dropdown listeler.
  - Gerekli eşik(threshold) değerleri için NumberInput alanı.

## 5. Bildirim Okundu Etkileşimi
- **UI Görevi:** Kullanıcının mevcut bildirimin üzerine dokunmasıyla, durumunun UI üzerinde anlık olarak "Okundu"ya çekilmesi.
- **Bileşenler:**
  - Tıklama (onTap) animasyonu ile fon rengi değiştirme özelliği.

## 6. Bildirimi Sil/Temizle Etkileşimi
- **UI Görevi:** Gereksiz veya eski bildirimi listeden atmak için "Swipe to Delete" fonksiyonalitesini geliştirme.
- **Bileşenler:**
  - Yana kaydırırken arkadan çıkan kırmızılı "Çöp Kutusu" ikonu ve animasyonlu silinme hissiyatı.
