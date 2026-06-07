// ============================================
// Mobil uygulama yapılandırması
// ============================================
//
// API_BASE_URL: Mobil backend (mobile-api) adresi.
//   - Android emülatör:        http://10.0.2.2:5001/api
//   - iOS simülatör:           http://localhost:5001/api
//   - Gerçek cihaz (Expo Go):  http://<bilgisayar-LAN-IP>:5001/api
//     (örn. http://192.168.1.20:5001/api)
//
// MOBILE_API_TOKEN: mobile-api .env içindeki MOBILE_API_TOKEN ile aynı olmalı.

// Gerçek cihaz (Expo Go) için: bilgisayarın Wi-Fi LAN IP'si.
// Telefon ve bilgisayar AYNI Wi-Fi ağında olmalı.
// USB (adb reverse) ile: telefonun localhost'u bilgisayara yönlendirilir.
const DEV_HOST = '10.0.2.2';

export const API_BASE_URL = `http://${DEV_HOST}:5001/api`;
export const MOBILE_API_TOKEN = 'flend-mobile-dev-token';
