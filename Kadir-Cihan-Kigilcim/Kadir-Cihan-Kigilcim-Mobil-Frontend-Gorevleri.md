# Kadir Cihan Kığılcım'ın Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `mobile/` (Expo Router, SDK 56). Sorumluluk: Dinamik fiyatlandırma kuralları arayüzleri.

## 1. Yeni Fiyatlandırma Kuralı Ekranı
- **Ekran:** `mobile/app/pricing-new.tsx`
- **Bileşenler:** `FormInput`, `OptionPicker`, `PrimaryButton`
- **İşlev:** Kural adı, tip (Rakip/Marj bazlı), değer ve birim (TL/%) ile yeni kural oluşturma.

## 2. Kural Atama Ekranı (Çoklu Seçim)
- **Ekran:** `mobile/app/pricing-assign.tsx`
- **İşlev:** Ürünleri çoklu seçimle işaretleyip seçili kuralı bu ürünlere atama.

## 3. Aktif Kurallar Listesi
- **Ekran:** `mobile/app/(tabs)/pricing.tsx`
- **Bileşenler:** `Badge`, FAB
- **İşlev:** Kuralları tip, değer ve atama sayısı rozetleriyle listeleme; "Ata" kısayolu.

## 4. Optimum BuyBox Fiyatı Önerisi
- **Ekran:** `mobile/app/product/[id].tsx` (optimum-fiyat kartı)
- **İşlev:** Ürün için önerilen optimum fiyatı, gerekçe ve uygulanan kuralla birlikte gösterme.

## 5. Kural Güncelleme Ekranı
- **Ekran:** `mobile/app/pricing-rule/[ruleId].tsx`
- **İşlev:** Mevcut verilerle dolu formda kural parametrelerini düzenleme.

## 6. Kural Silme Etkileşimi
- **Ekran:** `mobile/app/pricing-rule/[ruleId].tsx` (Sil butonu + onay)
- **İşlev:** Destructive onay diyaloğu ile kuralı silme.
