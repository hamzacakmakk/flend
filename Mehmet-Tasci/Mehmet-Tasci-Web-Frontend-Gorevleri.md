# Mehmet Taşcı'nın Web Frontend Görevleri
**Web Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Pazaryeri Entegrasyonu Formu
- **UI Görevi:** Satıcının Trendyol/Amazon vb. API Key ve Secret Key'lerini sisteme tanımlayabileceği modern form bileşkeleri oluşturma.
- **Bileşenler:** 
  - Label ve TextBox girdileri
  - Select / Dropdown yardımıyla pazaryeri seçimi
  - Hata durumunda Error State ve Invalid Focus UI dönüşü

## 2. Ürün Envanter Tablosu (DataGrid)
- **UI Görevi:** Pazaryerinden çekilen satıcı ürünlerinin bir web tablosunda / kart ızgarasında sergilendiği ana liste ekranını yapma.
- **Bileşenler:** 
  - Pagination (Sayfalama) çubuğu
  - Tablo Satırı (Ürün görseli, Adı, Fiyat Sütunları)
  - Arama/Filtre çubuğu (opsiyonel)

## 3. Ürün Detay View
- **UI Görevi:** Listeden bir ürüne tıklandığında beliren detay kartı, panele veya ayrı sayfaya giden akış.
- **Bileşenler:** 
  - Ürün stok sayısı (Badge ile gösterimli)
  - Güncel satış fiyatı (Vurgulu Typography)

## 4. Minimum Satış Fiyatı Belirleme Modal'ı
- **UI Görevi:** Tıklanan üründe taban "Minimum Satış Fiyatı" belirlemek için ortaya çıkan Modal penceresini oluşturma.
- **Bileşenler:**
  - Modal Header ("Taban Fiyat Belirle")
  - Number Input alanı
  - Save Changes (Düzenlemeyi Kaydet) Butonu

## 5. API Bağlantı Güncelleme Ekranı
- **UI Görevi:** Sistemde geçerliliğini yitiren token'ları yenilemek için "Ayarlar / Entegrasyonlar" panelinin alt sekmesi olarak form arayüzü çizimi.
- **Bileşenler:**
  - Expired (Süresi Dolmuş) Alert Bar / Warning
  - Güncelle (Update Token) Formu

## 6. Takipten Çıkartma İşlemi (Delete Action)
- **UI Görevi:** Artık satışı yapılmayan ürünlerin listeden silinmesi sırasında kullanıcı deneyimi tasarlama.
- **Bileşenler:**
  - Tabloda "Çöp Kutusu" (Delete) ikonu
  - Confirm Delete (Silme Onayı) popup'ı ve toast/snackbar success mesajları
