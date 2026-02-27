# Mehmet Taşcı'nın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Pazaryeri Entegrasyon Ekranı
- **UI Görevi:** Satıcının mağazasını sisteme bağlaması için gerekli API Key/Secret form ekranını tasarlama ve geliştirme.
- **Bileşenler:** 
  - API Key giriş alanı
  - Secret Key giriş alanı
  - Pazaryeri Seçici (Trendyol, Amazon vb.)
  - Kaydet butonu

## 2. Satıcı Ürün Listesi Ekranı
- **UI Görevi:** Entegre pazaryerinden çekilen satıcı ürünlerinin bir listesini tasarlama ve ListView / RecyclerView / LazyColumn gibi bileşenlerle gösterme.
- **Bileşenler:** 
  - Ürün resimli liste/kart görünümü
  - Minimalist ürün adı ve fiyat bilgisi gösterimi
  - Refresh indicator (yukarıdan çekince ürünleri güncelleme)
  - Floating action button (bağlantı ayarlarına kısa yol vb.)

## 3. Ürün Detay Aksiyon Sayfası
- **UI Görevi:** Seçilen ürünün stok adetlerinin ve detaylı mevcut satış fiyatlarının gösterildiği ekran tasarımı.
- **Bileşenler:** 
  - Stok durumu ilerleme çubuğu/göstergesi
  - Güncel fiyat metni
  - Geri butonu, ürün isim kartı

## 4. Minimum Fiyat (Taban Fiyat) Güncelleme Modal'ı
- **UI Görevi:** Zarar etmemek adına uygulanan "Minimum Satış Fiyatı"nı düzenlemek için kullanılacak alt pencere (Bottom Sheet) formunun tasarlanması.
- **Bileşenler:**
  - Mevcut alt limiti gösteren metin
  - Yeni limit girmek için sayısal klavye açılan input alanı
  - Kaydet ve İptal butonları

## 5. Bağlantı Bilgilerini Yenileme Görüntüsü
- **UI Görevi:** Süresi dolmuş tokenlar için entegrasyon ayarları form ekranı.
- **Bileşenler:**
  - Durum (Aktif/Pasif/Token Süresi Dolmuş) uyarı mesajları
  - Formu tekrar doldurmak için input alanları

## 6. Envanterden Sil / Takipten Çıkar UI İşlevi
- **UI Görevi:** Ürünün listeden çıkarılması için kaydırma veya onay dialog'u tasarlama.
- **Bileşenler:**
  - Öğeyi silmek için Swipe-to-Delete (kaydırarak silme)
  - "Bu ürünün takibini bırakmak istediğinize emin misiniz?" Alert Dialog
