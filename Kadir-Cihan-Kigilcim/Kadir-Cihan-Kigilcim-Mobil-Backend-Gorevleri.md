# Kadir Cihan Kığılcım'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma Servisi
- **API Endpoint:** `POST /api/pricing-rules`
- **Görev:** Mobil uygulamada yeni dinamik fiyatlandırma kuralının veritabanına kaydedilmesi işlemini gerçekleştiren servis
- **İşlevler:**
  - Kural formu verilerini (kural adı, değer, tür, vs.) api istek modeline çevirme
  - API'ye POST isteği gönderme
  - Başarılı işlem durumunda listeye kullanıcıyı yönlendirme veya modal kapatma
  - Hata durumlarını yakalama (400 Bad Request, vb.)
- **Teknik Detaylar:**
  - HTTP Client kullanımı (Retrofit/OkHttp veya URLSession)
  - Request/Response model sınıfları oluşturma
  - Local validation kontrolleri

## 2. Fiyatlandırma Kuralını Atama Servisi
- **API Endpoint:** `POST /api/pricing-rules/assign`
- **Görev:** Seçilen ürün veya kategoriye kuralın atama işlemini yapacak servis çağırma
- **İşlevler:**
  - Kural id ve hedef ürün/kategori listesini toplama
  - Payload'ı hazırlayarak API'ye POST gönderme
  - Başarılı geri dönüşlerde ürün/kural detayını yenileme
- **Teknik Detaylar:**
  - Authorization header ekleme (Bearer Token)
  - Çoklu seçim verilerini liste halinde yollama stratejisi
  - Kısmi başarısızlık ihtimalleri (Partial Success) handle edilmesi

## 3. Aktif Fiyatlandırma Kurallarını Listeleme Servisi
- **API Endpoint:** `GET /api/pricing-rules`
- **Görev:** Kullanıcının mevcut kurallarını apiden çekip listelemesi
- **İşlevler:**
  - JWT token ile kimlik doğrulama ekleme
  - Sayfalamalı (pagination) olarak kuralları listeye çekme
  - Gelen liste verisini lokal veri modellerine dönüştürme ve UI listelerini besleme
- **Teknik Detaylar:**
  - Response caching stratejisi uygulanması
  - Error handling (Eğer sistem dışı ise veya offline ise cache'den çekme)

## 4. Optimum BuyBox Fiyatı Önerisini Getirme Servisi
- **API Endpoint:** `GET /api/pricing-rules/optimum-price/{productId}`
- **Görev:** Bir ürün için algoritmanın önerdiği optimum buybox fiyatını getirme
- **İşlevler:**
  - İlgili ürün productId'si ile dinamik analiz çağrısı yapma
  - Gelen sonucu ayrıştırıp fiyat ve sebep bilgisini UI'a paslama
- **Teknik Detaylar:**
  - Hızlı ve sık istek atan endpoint olabileceği için Throttle yönetimi
  - Error handling (Hata durumunda veya hesaplanamadığında boş state dönme)

## 5. Fiyatlandırma Kuralı Parametrelerini Güncelleme Servisi
- **API Endpoint:** `PUT /api/pricing-rules/{ruleId}`
- **Görev:** Var olan bir kuralın güncellenmesi işlemini sağlama
- **İşlevler:**
  - Değişen alanları (formdan gelen yeni parametreler) yakalama
  - API'ye PUT isteği yollama
  - Optimistic update yaklaşımıyla yerel listede anlık veriyi değiştirme
- **Teknik Detaylar:**
  - Partial update desteği sağlanması (sadece değişen veriler gönderilir)
  - Request body oluşturma ve güncellemelerde çakışma kontrolü (Conflict resolution)

## 6. Fiyatlandırma Kuralını Silme Servisi
- **API Endpoint:** `DELETE /api/pricing-rules/{ruleId}`
- **Görev:** Gereksiz kuralların silinmesi işlemini üstlenen servis
- **İşlevler:**
  - API'ye argüman olarak kural ID'sini delete metoduyla gönderme
  - Başarılı olması durumunda yerel listeden ve cache'den çıkartma
- **Teknik Detaylar:**
  - Destructive çağrılar için hata durumu yönetimini sıkı tutma
  - İstek atılırken UI donmasını önleyecek arkaplan thread vb. kullanımı
