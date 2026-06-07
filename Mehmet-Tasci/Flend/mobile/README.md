# Flend Mobil Uygulama (Expo / React Native)

Mehmet Taşcı - Pazaryeri Entegrasyonu & Envanter Yönetimi mobil arayüzü.
`mobile-api` (mobil backend) ile `Authorization: Bearer` token kullanarak
konuşur.

## Kurulum

```bash
cd mobile
npm install
npm start          # ardından QR kodu Expo Go ile okutun
# veya: npm run android  /  npm run ios
```

> Önce `../mobile-api` çalışıyor olmalı (`cd ../mobile-api && npm run dev`).

## API Adresi Ayarı

`src/config.js` dosyasındaki `API_BASE_URL` değerini ortamınıza göre ayarlayın:

| Ortam | Adres |
|-------|-------|
| Android emülatör | `http://10.0.2.2:5001/api` (otomatik) |
| iOS simülatör | `http://localhost:5001/api` (otomatik) |
| Gerçek cihaz (Expo Go) | `http://<bilgisayar-LAN-IP>:5001/api` (elle girin) |

`MOBILE_API_TOKEN` değeri, `mobile-api/.env` içindeki ile aynı olmalıdır.

## Ekranlar ↔ Mobil Frontend Görevleri

| # | Görev | Ekran / Bileşen |
|---|-------|-----------------|
| 1 | Pazaryeri Entegrasyon Ekranı | `screens/IntegrationFormScreen.js` (API Key/Secret + pazaryeri seçici + Kaydet) |
| 2 | Satıcı Ürün Listesi | `screens/ProductListScreen.js` (kart liste, pull-to-refresh, FAB, sayfalama) |
| 3 | Ürün Detay Aksiyon Sayfası | `screens/ProductDetailScreen.js` (stok ilerleme çubuğu, güncel fiyat, isim kartı) |
| 4 | Minimum Fiyat Modal'ı | `components/MinPriceSheet.js` (Bottom Sheet, sayısal klavye, Kaydet/İptal) |
| 5 | Bağlantı Yenileme | `screens/IntegrationsScreen.js` + form (Aktif/Pasif/Token uyarıları) |
| 6 | Envanterden Sil / Takipten Çıkar | `ProductListScreen` Swipe-to-Delete + Alert Dialog |

## Yapı

```
mobile/
├── App.js                       # Navigasyon (native-stack)
├── app.json / babel.config.js
└── src/
    ├── config.js                # API adresi + token
    ├── theme.js                 # Web ile tutarlı koyu tema
    ├── api/client.js            # axios + Bearer + hata normalize (400/401)
    ├── components/
    │   ├── ui.js                # Buton, durum rozeti, boş durum
    │   └── MinPriceSheet.js     # Görev 4
    └── screens/
        ├── ProductListScreen.js     # Görev 2 + 6
        ├── ProductDetailScreen.js   # Görev 3 + 4
        ├── IntegrationsScreen.js    # Görev 5
        └── IntegrationFormScreen.js # Görev 1 + 5
```
