// ==========================================================================
// lib/config.ts — API taban adresi
//
// ÖNEMLİ: Gerçek cihaz/emülatör "localhost"a ULAŞAMAZ. Bilgisayarınızın
// LAN IP'sini app.json → expo.extra.apiBaseUrl içine yazın:
//   "extra": { "apiBaseUrl": "http://192.168.1.50:5000" }
// (IP'yi `ipconfig` ile öğrenin. Android emülatör için http://10.0.2.2:5000)
// ==========================================================================
import Constants from 'expo-constants';

const fromConfig = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

export const API_BASE_URL = (fromConfig || 'http://192.168.1.100:5000').replace(/\/+$/, '');
