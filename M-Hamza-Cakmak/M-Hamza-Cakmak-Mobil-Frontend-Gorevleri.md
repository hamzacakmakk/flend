# Muhammed Hamza Çakmak'ın Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `mobile/` (Expo Router, SDK 56). Sorumluluk: Rakip takibi, fiyat analizi ve grafik arayüzleri.

## 1. Ürün → Rakip Giriş Listesi
- **Ekran:** `mobile/app/(tabs)/competitors.tsx`
- **İşlev:** Ürünleri listeler; bir ürüne dokununca rakip analiz ekranına gider.

## 2. Rakip Analiz Ekranı (Kartlar)
- **Ekran:** `mobile/app/competitor/[productId].tsx`
- **Bileşenler:** `CompetitorCard`, `SyncButton`, `AddCompetitorModal`, `DeleteConfirmModal`
- **İşlev:** Rakip satıcıları fiyat rozetleriyle (Avantajlı/Riskli) listeler; ekle/sil/durum işlemleri.

## 3. Rakip Ekleme Modal'ı
- **Bileşen:** `mobile/components/AddCompetitorModal.tsx`
- **İşlev:** Rakip ilan linki + satıcı adı ile takip başlatma (bottom-sheet form, validasyon).

## 4. Fiyat Geçmişi Grafiği Ekranı
- **Ekran:** `mobile/app/history/[competitorId].tsx`
- **Bileşen:** `PriceChart` (özel çizgi grafik) + istatistik kartları + log tablosu
- **İşlev:** Rakip fiyat trendini görselleştirir.

## 5. Hızlı Aktif/Pasif Toggle
- **Bileşen:** `CompetitorCard` (Switch)
- **İşlev:** Takip durumunu anında (optimistic) değiştirir.

## 6. Swipe-to-Delete Etkileşimi
- **Bileşen:** `CompetitorCard` (PanResponder) + `DeleteConfirmModal`
- **İşlev:** Yana kaydırarak rakip takibini silme + onay diyaloğu.
