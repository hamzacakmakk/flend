// ==========================================================================
// lib/config.ts — API taban adresi (ÇALIŞMA ZAMANINDA değiştirilebilir)
//
// URL artık APK'ya gömülü DEĞİL: kullanıcı giriş ekranındaki "Sunucu Adresi"
// alanından girer, secure-store'a kaydedilir. Böylece TEK APK her backend
// adresiyle (LAN IP / tünel / bulut) çalışır — tek IP'ye bağlı kalınmaz.
// ==========================================================================
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'flend_api_base_url';
const isWeb = Platform.OS === 'web';

function normalize(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

// app.json → extra.apiBaseUrl yalnızca İLK varsayılan; kullanıcı değiştirebilir.
export const DEFAULT_API_BASE_URL = normalize(
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) || 'http://10.0.2.2:5000'
);

let current = DEFAULT_API_BASE_URL;

export function getApiBaseUrl(): string {
  return current;
}

// Uygulama açılışında çağrılır (AuthProvider): kayıtlı adresi yükler.
export async function loadApiBaseUrl(): Promise<string> {
  try {
    const stored = isWeb
      ? (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null)
      : await SecureStore.getItemAsync(KEY);
    if (stored) current = normalize(stored);
  } catch {
    /* yoksay — varsayılan kalır */
  }
  return current;
}

export async function saveApiBaseUrl(url: string): Promise<void> {
  current = normalize(url);
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, current);
    } else {
      await SecureStore.setItemAsync(KEY, current);
    }
  } catch {
    /* bellekte tutuluyor */
  }
}
