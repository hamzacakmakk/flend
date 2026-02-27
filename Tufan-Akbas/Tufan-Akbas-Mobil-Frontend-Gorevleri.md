# Tufan'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Satıcı Kayıt (Register) Ekranı
- **UI Görevi:** Sisteme yeni katılacak e-ticaret firmaları için kayıt formu arayüzünü tasarlama.
- **Bileşenler:** 
  - Ad, Soyad, E-posta ve Şifre giriş alanları
  - Form validasyon uyarıları
  - Kayıt Ol butonu
  - Mevcut hesaba giriş yönlendirme linki

## 2. Satıcı Giriş (Login) Ekranı
- **UI Görevi:** Satıcıların e-posta ve şifre ile sisteme giriş yapabileceği ekran.
- **Bileşenler:** 
  - E-posta ve Şifre giriş alanları
  - "Şifremi Unuttum" linki
  - Giriş Yap butonu
  - API'den dönen hatalar için snackbar/toast mesajı

## 3. Profil ve Mevcut Abonelik Görüntüleme Sayfası
- **UI Görevi:** Satıcının kendi bilgilerini ve aktif abonelik detaylarını inceleyebileceği profil sayfası.
- **Bileşenler:** 
  - Kullanıcı avatarı, adı ve e-posta etiketi
  - Aktif abonelik paketi durumu (Rozet / Badge)
  - Ayarlar menüsü liste görünümü

## 4. Profil ve Şifre Düzenleme Formu
- **UI Görevi:** Kullanıcıların isim, iletişim bilgileri veya şifrelerini değiştirebileceği form ekranı.
- **Bileşenler:**
  - Mevcut değerleri içeren doldurulmuş giriş alanları
  - Şifre güncellemesi için eski/yeni şifre alanları
  - Kaydet butonu ve başarı durum uyarısı

## 5. Hesap Silme / Dondurma Onay Dialog'u
- **UI Görevi:** Kullanıcının hesabı silmek/dondurmak istediğinde karşılaşacağı güvenlik prosedürü ve onay ekranı.
- **Bileşenler:**
  - "Hesabınızı silmek istediğinize emin misiniz?" Alert Dialog
  - İptal ve Onay (Kırmızı renkli - tehlikeli işlem) butonları

## 6. SaaS Abonelik Paketleri Listesi
- **UI Görevi:** Mevcut abonelik planlarının (Aylık/Yıllık) satın alınmak üzere listelenmesi.
- **Bileşenler:**
  - Paketlerin kart şeklinde (Fiyat, özellikler) yana/aşağı kaydırılabilir görünümü
  - Satın Al/Abone Ol butonları
  - "Aktif Paket" göstergesi
