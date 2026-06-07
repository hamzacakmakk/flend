# Nurullah Turgut'un Mobil Frontend Görevleri

**Mobil Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

> Tüm ekranlar tek birleşik uygulamada: `mobile/` (Expo Router, SDK 56). Sorumluluk: Panel (dashboard), analitik ve bildirim arayüzleri.

## 1. Ana Panel (Dashboard) Ekranı
- **Ekran:** `mobile/app/(tabs)/dashboard.tsx`
- **Bileşenler:** `StatCard`, `Card`
- **İşlev:** BuyBox kazanma oranı, takip edilen ürün, toplam satış, aktif kampanya ve ciro kartları.

## 2. Kampanya / Stok Eritme Önerileri
- **Ekran:** `mobile/app/(tabs)/dashboard.tsx` (öneriler bölümü)
- **İşlev:** Önerileri öncelik rozetleri (kritik/yüksek) ve önerilen indirim oranıyla listeleme.

## 3. Bildirim Merkezi Ekranı
- **Ekran:** `mobile/app/(tabs)/notifications.tsx`
- **İşlev:** Bildirimleri tipe göre ikon/renkle; okunmamışlar kalın, okunmuşlar soluk gösterilir.

## 4. Alarm / Kural Ekleme Modal'ı
- **Bileşen:** `notifications.tsx → AlertRuleModal`
- **Bileşenler:** `OptionPicker` (tetikleyici), `FormInput` (eşik), `PrimaryButton`
- **İşlev:** "Rakip fiyatı %10 düşerse uyar" gibi alarm kuralı oluşturma.

## 5. Bildirim Okundu Etkileşimi
- **Ekran:** `notifications.tsx` (onPress)
- **İşlev:** Dokunulan bildirimin durumunun anında (optimistic) "okundu"ya çekilmesi.

## 6. Bildirim Silme Etkileşimi
- **Ekran:** `notifications.tsx` (çöp kutusu butonu)
- **İşlev:** Bildirimi listeden anında kaldırma (optimistic, hata olursa geri alma).
