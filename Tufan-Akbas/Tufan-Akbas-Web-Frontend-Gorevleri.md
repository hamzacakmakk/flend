# Tufan'ın Web Frontend Görevleri
**Web Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Web Satıcı Kayıt (Register) Sayfası
- **UI Görevi:** Yeni satıcılar için web standartlarında tam ekran veya modern bir kayıt formu tasarımı.
- **Bileşenler:** 
  - Label ve TextBox girdileri (Kullanıcı bilgileri)
  - Hata durumunda Error State ve Invalid Focus UI dönüşü
  - Etkileşimli (Hover/Active) "Kayıt Ol" butonu

## 2. Web Satıcı Giriş (Login) Sayfası
- **UI Görevi:** Kayıtlı kullanıcıların yetkilendirileceği şık bir web giriş arayüzü.
- **Bileşenler:** 
  - Form validasyonu olan şifre/email girişleri
  - "Beni Hatırla" checkbox
  - Yetkisiz girişlerde (401) alert/warning mesajları

## 3. Profil ve Detaylı Abonelik Paneli (My Account)
- **UI Görevi:** Sağ üst köşedeki menüden veya sidebar'dan erişilen, kullanıcının profil ve plan verilerini gösteren panel.
- **Bileşenler:** 
  - Bilgi kartları (Card layout) ile profil özeti
  - Aktif planın detayları (Bitiş tarihi, özellikleri vs.) gösterimi

## 4. Profil ve Şifre Güncelleme Sekmesi
- **UI Görevi:** Kullanıcı paneli içinde yer alan, verilerin API ile eş zamanlı güncellendiği sekme arayüzü.
- **Bileşenler:**
  - Düzenlenebilir form alanları
  - Değişiklikler için (Save Changes) Butonu
  - Başarılı/Başarısız işlem bildirimleri (Toast Message)

## 5. Hesap Silme / Dondurma İşlemi (Danger Zone)
- **UI Görevi:** Profil ayarları en alt sekmesinde "Tehlikeli Alan" olarak yerleştirilmiş hesap silme bölümü.
- **Bileşenler:**
  - Kırmızı veya dikkat çekici arka planlı alan
  - "Hesabımı Sil/Dondur" butonu
  - Confirm (Onay) modal ekranı

## 6. SaaS Abonelik Paketleri (Pricing Table)
- **UI Görevi:** Kullanıcıların sistemin aylık ve yıllık paket fiyatlarını karşılaştırmalı olarak görebileceği web fiyatlandırma tablosu.
- **Bileşenler:**
  - Fiyatlandırma planlarını içeren esnek sütunlar (Grid Layout)
  - Aylık / Yıllık seçim yapmayı sağlayan Toggle Button
  - Plan özellikleri liste maddeleri
