# Mehmet Taşcı'nın Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `mobile/` (Expo Router, SDK 56). Sorumluluk: Pazaryeri entegrasyonu ve envanter arayüzleri.

## 1. Pazaryeri Entegrasyonu Ekleme Ekranı
- **Ekran:** `mobile/app/integrations.tsx`
- **Bileşenler:** `FormInput`, `PrimaryButton`
- **İşlev:** Pazaryeri adı + API Key/Secret formu ile yeni entegrasyon ekleme.

## 2. Ürün Listesi (Envanter) Ekranı
- **Ekran:** `mobile/app/(tabs)/products.tsx`
- **İşlev:** Kullanıcının ürünlerini fiyat, stok, min-fiyat ve pazaryeri rozetiyle listeleme; pull-to-refresh; entegrasyon ekranına kısayol.

## 3. Tekil Ürün Detay Ekranı
- **Ekran:** `mobile/app/product/[id].tsx`
- **Bileşenler:** `Card`, `Badge`
- **İşlev:** Ürün adı, fiyat, stok, barkod, pazaryeri ve optimum-fiyat önerisinin gösterimi.

## 4. Minimum Fiyat Güncelleme Alanı
- **Ekran:** `mobile/app/product/[id].tsx` (min-fiyat kartı)
- **Bileşenler:** `FormInput` (numeric), `PrimaryButton`
- **İşlev:** Maliyet eşiğini (min satış fiyatı) düzenleme.

## 5. Pazaryeri API Bilgileri Güncelleme
- **Ekran:** `mobile/app/integrations.tsx` (entegrasyon kartı — Durum)
- **İşlev:** Entegrasyon durumunu (aktif/pasif) ve API bilgilerini güncelleme; "Ürün Çek" ile senkronizasyon.

## 6. Ürün Silme (Envanterden Kaldırma)
- **Ekran:** `mobile/app/product/[id].tsx` (Sil butonu + onay)
- **İşlev:** Ürünü envanterden kaldırma (soft delete) onay diyaloğu.
