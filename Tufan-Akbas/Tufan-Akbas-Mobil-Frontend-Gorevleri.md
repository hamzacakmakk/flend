# Tufan Akbaş'ın Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `mobile/` (Expo Router, SDK 56). Sorumluluk: Kullanıcı kimlik doğrulama, profil ve abonelik arayüzleri.

## 1. Kayıt Ekranı (Register)
- **Ekran:** `mobile/app/(auth)/register.tsx`
- **Bileşenler:** `FormInput`, `PrimaryButton` (`components/ui`)
- **İşlev:** Firma adı, ad-soyad, e-posta, telefon, parola formu; başarıda otomatik giriş + panele yönlendirme.

## 2. Giriş Ekranı (Login)
- **Ekran:** `mobile/app/(auth)/login.tsx`
- **İşlev:** E-posta/parola ile giriş, JWT alımı, demo kullanıcı ipucu (demo@flend.com / demo1234), hata gösterimi.

## 3. Profil & Abonelik Görüntüleme
- **Ekran:** `mobile/app/profile.tsx`
- **Bileşenler:** `Card`, `Badge`
- **İşlev:** Firma/yetkili/telefon bilgileri ve mevcut abonelik paketinin rozet ile gösterimi; alt menü (düzenle, abonelik, pazaryeri, dondur, çıkış).

## 4. Profil / Şifre Düzenleme
- **Ekran:** `mobile/app/profile-edit.tsx`
- **İşlev:** Mevcut bilgilerle dolu form; firma adı, ad-soyad, telefon ve opsiyonel yeni parola güncelleme.

## 5. Hesabı Dondurma / Silme
- **Ekran:** `mobile/app/profile.tsx` (onay diyaloğu)
- **İşlev:** Onay sonrası hesabın dondurulması ve oturumun kapatılarak giriş ekranına dönüş.

## 6. Abonelik Paketleri Ekranı
- **Ekran:** `mobile/app/subscriptions.tsx`
- **İşlev:** Free / Pro Aylık / Pro Yıllık paketlerinin fiyat, periyot ve özellik listesiyle kartlar halinde sunumu; mevcut planın vurgulanması.
