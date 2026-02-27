# Tufan'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Yeni Satıcı Hesabı Oluşturma (Register) Servisi
- **API Endpoint:** `POST /api/auth/register`
- **Görev:** Sisteme yeni bir satıcının (e-ticaret firmasının) kayıt olmasını sağlama.
- **İşlevler:**
  - Kullanıcı kayıt bilgileri için istek modelini oluşturma (Ad, Soyad, E-posta, Şifre vb.).
  - Güvenlik ve validasyon kontrollerinden sonra veritabanına kaydetme.
  - Hata durumlarını (400 Bad Request, Email Already Exists) yakalama.

## 2. Satıcı Girişi (Login) Servisi
- **API Endpoint:** `POST /api/auth/login`
- **Görev:** Kayıtlı satıcının sisteme giriş yapması ve oturum açması.
- **İşlevler:**
  - E-posta ve şifre doğrulaması yapma.
  - Başarılı girişte JWT (JSON Web Token) üretme ve dönme.
  - Hatalı giriş denemelerinde (401 Unauthorized) yanıt dönme.

## 3. Profil ve Abonelik Bilgilerini Getirme Servisi
- **API Endpoint:** `GET /api/users/profile`
- **Görev:** Giriş yapmış olan satıcının profil detaylarını ve hangi abonelik paketini kullandığını getirme.
- **İşlevler:**
  - Token tabanlı yetkilendirme (Bearer Token) ile çağrı atma.
  - Kullanıcı bilgilerini ve aktif abonelik nesnesini dönüştürerek iletme.

## 4. Profil ve Şifre Güncelleme Servisi
- **API Endpoint:** `PUT /api/users/profile`
- **Görev:** Satıcının var olan profil ve şifre bilgilerini değiştirmesi.
- **İşlevler:**
  - Şifre ve diğer bilgilerin değişim isteklerini karşılama.
  - Başarılı güncellemede kullanıcıya yanıt dönme.

## 5. Satıcı Hesabı Silme veya Dondurma Servisi
- **API Endpoint:** `DELETE /api/users/account`
- **Görev:** Kullanıcının hesabı kalıcı olarak silmesi veya dondurması işlemi.
- **İşlevler:**
  - Kullanıcı onayından sonra hesabı silme/pasife alma çağrısı yapma.
  - Başarılı dönüşle mobil arayüzde oturumu sonlandırma.

## 6. SaaS Abonelik Paketlerini Listeleme Servisi
- **API Endpoint:** `GET /api/subscriptions/plans`
- **Görev:** Sistemde kullanılabilecek olan Aylık/Yıllık abonelik paketlerini listeleme.
- **İşlevler:**
  - Abonelik planlarını veritabanından çekip liste formatında JSON olarak sunma.
