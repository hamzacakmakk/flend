# Mehmet Taşcı'nın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Pazaryeri Entegrasyonu Ekleme Servisi
- **API Endpoint:** `POST /api/integrations`
- **Görev:** Satıcının Trendyol, Amazon gibi pazaryeri API Key ve Secret bilgilerini sisteme kaydederek bağlantıyı sağlama.
- **İşlevler:**
  - Entegrasyon bilgileri için istek modelini oluşturma (API Key, Secret kısımları vs.).
  - Güvenlik ve validasyon kontrollerinden sonra API'ye veri gönderme.
  - Hata durumlarını (400 Bad Request, 401 Unauthorized) mobil uygulamada yakalama.

## 2. Ürün Listesi Çekme Servisi
- **API Endpoint:** `GET /api/inventory/products`
- **Görev:** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekme ve listeleme.
- **İşlevler:**
  - Token tabanlı yetkilendirme (Bearer Token) ile çağrı atma.
  - Gelen JSON verisini parse ederek ürün nesnesi listesine dönüştürme.
  - Sayfalama (Pagination) mantığını kurma.

## 3. Tekil Ürün Detayları Getirme Servisi
- **API Endpoint:** `GET /api/inventory/products/{productId}`
- **Görev:** Sistemdeki tek bir ürünün stok sayısı ve güncel satış fiyatı gibi detaylarını getirme.
- **İşlevler:**
  - Path parameter (productId) üzerinden istek gönderme.
  - Alınan detay bilgilerini UI'da sunulabilir modele dönüştürme.

## 4. Minimum Satış Fiyatı Güncelleme Servisi
- **API Endpoint:** `PUT /api/inventory/products/{productId}/min-price`
- **Görev:** Sistemdeki bir ürünün "Minimum Satış Fiyatı" sınırını güncelleme (Zarar etmemek için taban fiyat).
- **İşlevler:**
  - Yeni fiyat bilgisini PUT isteğinin form/body kısmına ekleme.
  - Başarılı güncellemede kullanıcıya yanıt dönme.

## 5. Pazaryeri API Bilgileri Güncelleme Servisi
- **API Endpoint:** `PUT /api/integrations/{integrationId}`
- **Görev:** Süresi dolan token veya değişen API şifreleri/keyleri için bağlantı bilgilerini güncelleme.
- **İşlevler:**
  - Var olan entegrasyon id'si üzerinden şifre/token yenileme isteği atma.

## 6. Envanter Panelinden Ürün Silme Servisi
- **API Endpoint:** `DELETE /api/inventory/products/{productId}`
- **Görev:** Artık satışı yapılmayan ürünlerin panelden silinmesi/takibinin bırakılması.
- **İşlevler:**
  - Kullanıcı onayından sonra DELETE çağrısı yapma.
  - Başarılı dönüşle mobil arayüzde listeden kaldırma işlemini tetikleme.
