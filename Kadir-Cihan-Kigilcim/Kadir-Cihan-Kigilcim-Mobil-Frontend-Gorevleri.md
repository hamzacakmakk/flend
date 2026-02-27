# Kadir Cihan Kığılcım'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma Ekranı
- **API Endpoint:** `POST /api/pricing-rules`
- **Görev:** Yeni kural form ekranının tasarlanması ve implementasyonu
- **UI Bileşenleri:**
  - Kural Adı text input
  - Kural Türü seçici (Dropdown / Bottom Sheet list)
  - Hedef Miktar / Değer (input alanı, sadece numara)
  - Birim/Kur Seçici ($, TL, %, vb.)
  - Kaydet butonu
  - Yükleme durum (Loading indicator) göstergesi
- **Form Validasyonu:**
  - Kural adı boş bırakılamaz
  - Belirlenen miktar negatif olamaz kontrolleri
- **Kullanıcı Deneyimi:**
  - ScrollView içinde derlenmiş form
  - Başarılı kural ekleme sonrası Success Snackbar/Toast gösterip ana listeye dönme
  - Klavye dismiss (kapatma) fonksiyonları eklenecek
- **Teknik Detaylar:**
  - Form state yönetimi
  - Navigation kurgusu

## 2. Fiyatlandırma Kuralını Atama Ekranı
- **API Endpoint:** `POST /api/pricing-rules/assign`
- **Görev:** Ürün/kategori ile kuralların bağlanmasını sağlayan seçim ekranı tasarımı
- **UI Bileşenleri:**
  - Liste üzerinden çoklu ürün seçimi
  - "Bu ürünlere Kural Ata" Modal / Dialog veya yeni ekran
  - İlgili kuralın seçileceği Dropdown ve Atama Onay Butonu
- **Form Validasyonu:**
  - Ürün seçilmeden işlemin devam etmemesi
- **Kullanıcı Deneyimi:**
  - Arama çubuğu desteğiyle kolay ulaşılan listeler
  - Onaydan sonra anında ekranda görsel bildirimler
- **Teknik Detaylar:**
  - Çoklu seçim list yönetimi (Multiple Selection List)
  - State yönetim aracı entegrasyonu (ViewModel vb.)

## 3. Aktif Fiyatlandırma Kurallarını Listeleme Ekranı
- **API Endpoint:** `GET /api/pricing-rules`
- **Görev:** Sistemde kayıtlı olan kuralların listesi arayüzü tasarımı
- **UI Bileşenleri:**
  - Kuralları içeren Kart veya Liste satırları
  - "Yeni Kural Ekle" FAB (Floating Action Button)
  - Empty State grafik gösterimi
- **Kullanıcı Deneyimi:**
  - Skeleton Loader (ilk veri çekilirken)
  - Pull to refresh özelliği ile güncellemelerin tekrar alınması
  - Akıcı kaydırma deneyimi (Lazy loading)
- **Teknik Detaylar:**
  - FlatList/RecyclerView kullanımı
  - Caching ile çevrimdışı state'te gösterim (opsiyonel)

## 4. Optimum BuyBox Fiyatı Önerisi Gösterimi
- **API Endpoint:** `GET /api/pricing-rules/optimum-price/{productId}`
- **Görev:** Ürün detayı sayfasında algoritmanın önerdiği optimum fiyat için ekstra bir rozet / alan tasarımı
- **UI Bileşenleri:**
  - Önerilen Fiyat Etiketi (Yeşil veya dikkat çeken Badge/Rozet)
  - "Fiyatı Uygula" (Apply) Butonu
- **Kullanıcı Deneyimi:**
  - Butona tıklayınca hemen fiyatın yansıdığını yansıtan Optimistic Update efekti
  - Fiyat yüklenirken küçük in-line progress component
- **Teknik Detaylar:**
  - Partial load ekran tasarımları ve debounce teknikleri

## 5. Fiyatlandırma Kuralı Parametrelerini Güncelleme Modal'ı
- **API Endpoint:** `PUT /api/pricing-rules/{ruleId}`
- **Görev:** Kural güncelleme/düzenleme form ekranı tasarımını yapma
- **UI Bileşenleri:**
  - Önceden var olan verilerin doldurulduğu input alanları
  - Kaydet (Güncelle) ve İptal butonları
- **Form Validasyonu:**
  - Formdaki değerlerin değişip değişmediğini (dirty/pristine) kontrol etme
  - Değişmeden kaydet butonunun aktif olmaması
- **Kullanıcı Deneyimi:**
  - Bekletme durumunda loading overlay gösterme
- **Teknik Detaylar:**
  - Deep Link olanağı (varsa dışarıdan bu ekrana çağrı yapabilmek)

## 6. Kural Silme Akışı
- **API Endpoint:** `DELETE /api/pricing-rules/{ruleId}`
- **Görev:** Kuralı silmek için listeye eklenen fonksiyonel arayüz ve popup
- **UI Bileşenleri:**
  - Swipe-to-delete (yana kaydırıp silme butonu çıkarma)
  - Confirmation Dialog ("Emin misiniz?" onay bildirim uyarıları)
- **Kullanıcı Deneyimi:**
  - Tehlikeli işlemler için (Destructive Action) kırmızı renk palet kullanımı
  - İptal edilebilme rahatlığı
- **Akış Adımları:**
  1. Listedeki kuralı yana kaydırma
  2. Dialog penceresinden silinmesi için Onayla'ya basma
  3. API işlem bitimi sonrası listenin refreshlemesi
- **Teknik Detaylar:**
  - Dialog modal component modülerliğinin sağlanması
  - Hata oluşursa kuralı ui üzerinde tekrar geri koyma
