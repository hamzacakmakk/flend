# Kadir Cihan Kığılcım'ın Web Frontend Görevleri
**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma Formu
- **API Endpoint:** `POST /api/pricing-rules`
- **Görev:** Fiyatlandırma paneli altında yeni kural oluşturma web sayfasının veya Drawer (yan menü) bileşeninin tasarımı
- **UI Bileşenleri:**
  - Responsive Kural Formu
  - Kural Adı (text) ve Değer (number) alanları
  - Kural Koşulu seçimi için Select/Dropdown komponenti
  - "Kaydet" butonu ve load spinner
- **Form Validasyonu:**
  - Custom JavaScript real-time form validation
  - Sınır değer kontrolleri (mantıksız sayılar vb. için)
- **Kullanıcı Deneyimi:**
  - İnput altına anlık hata mesaj basma (Inline Validation)
  - Klavyeden kolay dolum, enter basıldığında submite zorlama
- **Teknik Detaylar:**
  - Framework (React/Vue vb.) içerik mimarisi
  - Form state management araçlarının kullanılması (React Hook Form vs)

## 2. Fiyatlandırma Kuralını Atama Modeli
- **API Endpoint:** `POST /api/pricing-rules/assign`
- **Görev:** Tabloda seçili ürünlere toplu olarak kural atanabilen fonksiyonel model (Modal) tasarımının uygulanması
- **UI Bileşenleri:**
  - DataGrid / Tablo üzerinden Checkbox ile ürün seçim özelliği
  - "Seçilenlere Kural Ata" Butonu (Üst bar veya footer aksiyon çubuğunda)
  - Atanacak kuralı barındıran Select Menu içeren modal
- **Form Validasyonu:**
  - En az 1 ürün işaretli değilse aksiyon butonlarının disabled kalması
- **Kullanıcı Deneyimi:**
  - Bulk Action (Toplu İşlem) sırasında UX göstergeleri (örn. "x ürün seçildi")
- **Teknik Detaylar:**
  - Masaüstü performansı için list management 

## 3. Aktif Fiyatlandırma Kurallarını Listeleme (DataGrid)
- **API Endpoint:** `GET /api/pricing-rules`
- **Görev:** Envanter sekmesindeki gibi, oluşturulmuş kuralların yönetim masası ve tablosunu yapmak
- **UI Bileşenleri:**
  - Gelişmiş tablo kurgusu (Sütunlar: Kural Adı, Tipi, Değer, Durum vs.)
  - Sayfalama/Pagination çubuğu
  - Tablo search/filtreleme input'u
- **Kullanıcı Deneyimi:**
  - Skeleton View (veri çekilene dek şablon tablo gösterme özelliği)
  - Satır bazında düzenleme (edit) menü erişimi (3 nokta vb. ikonlarla)
- **Teknik Detaylar:**
  - Component kütüphanelerinden (MUI DataGrid, Ant Design vb.) DataGrid yeteneklerinden faydalanılması

## 4. Optimum BuyBox Fiyatı Önerisi Kartı
- **API Endpoint:** `GET /api/pricing-rules/optimum-price/{productId}`
- **Görev:** Ayrı bir sayfada ya da ürün popup panosunda fiyat önerisini şıklaştıran widget barındırmak
- **UI Bileşenleri:**
  - Rozetli, çekici, dikkat uyandıran Alert Kartı tasarımı
  - "Hemen Uygula" butonu
- **Kullanıcı Deneyimi:**
  - Akıllı bir animasyon (suggestion update animasyonu) sağlanarak hissini yansıtma
- **Teknik Detaylar:**
  - Anlık polling veya çağrıyla fiyat hesabının gösterimi

## 5. Fiyatlandırma Kuralı Parametrelerini Güncelleme Modal'ı
- **API Endpoint:** `PUT /api/pricing-rules/{ruleId}`
- **Görev:** Liste üzerinde Edit (Kalem) butonuna tıklatıldığında formla dolan Modal yapısının çizimi
- **UI Bileşenleri:**
  - Modal başlığı, form elemanları
  - "Güncelle" ve "İptal Et" çiftli butonu
  - Unsaved Changes indicator (düzenleme devam ettiğinin hissi)
- **Form Validasyonu:**
  - Farkındalık oluşturulmadan submit etme butonunun pasif tutulması
- **Kullanıcı Deneyimi:**
  - Web masaüstü kullanıcılarına form doldurulurken Escape'e basıldığında uyarı verme vs.
- **Akış Adımları:**
  1. Tablo satırında Edit ikonu
  2. Modal Açılımı
  3. PUT Çağrısıyla verenin Update edilmesi
  4. Başarı toastı ve tablonun fresh (yeni değerle) gösterimi
- **Teknik Detaylar:**
  - State güncelleme hızı için Optimistic state renderı ve rollback mimarisi

## 6. Kural Silme İşlemi (Delete Action)
- **API Endpoint:** `DELETE /api/pricing-rules/{ruleId}`
- **Görev:** Kuralın tablodan kaldırılması için silme işlemi arayüz kurgusu
- **UI Bileşenleri:**
  - Satırdaki kural sil (çöp kutusu / danger butonu) iconu
  - Çift onayla (Are you sure?) uyarı Dialog/Modulu
- **Kullanıcı Deneyimi:**
  - Destructive (kalıcı) görev olduğu için açıkça görsel tehlike dili (Red themes vs.)
- **Teknik Detaylar:**
  - Event propagationlarını önleme (Row-click ile edit çalışıyorken sil butonunun override edebilmesi)
